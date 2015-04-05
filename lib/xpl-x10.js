var Xpl = require('xpl-api');
var fs = require('fs');
var os = require('os');
var net = require('net');
var pjson = require('../package.json');

function wt(device, options) {
	options = options || {};
	this._options = options;
	
	this.configFile = "/etc/wiseflat/x10.config.json";
        this.configHash = [];

	this.version = pjson.version;
	
	options.xplSource = options.xplSource || "bnz-x10."+os.hostname();
	this.xpl = new Xpl(options);
};

module.exports = wt;

var proto = {
    
        init: function(callback) {
                var self = this;

                self.xpl.bind(function(error) {
                        if (error) {
                                return callback(error);
                        }

                        console.log("XPL is ready");
                        callback(null,  self.xpl);
                });
                
        },

	_log: function() {
		if (!this._configuration.xplLog) {
			return;
		}
                
		console.log.apply(console, arguments);
	},
    
        _sendXplStat: function(body, schema) {
                var self = this;
                self.xpl.sendXplStat(
                        body, 
                        schema
                );
		console.log('to xPL - '+ JSON.stringify(body));
        },
      
	/*
         *  Config xPL message
         */
        
        readConfig: function(callback) {
                var self = this;
                fs.readFile(self.configFile, { encoding: "utf-8"}, function (err, body) {
                        if (err) console.log("file "+self.configFile+" is empty ...");
                        else self.configHash = JSON.parse(body);
                });
        },

        sendConfig: function(callback) {
                var self = this;
                self._sendXplStat(self.configHash, 'x10.config');
        },
        
        writeConfig: function(body) {
                var self = this;
		self.configHash.version = self.version;
                self.configHash.enable = body.enable;
                fs.writeFile(self.configFile, JSON.stringify(self.configHash), function(err) {
                        if (err) console.log("file "+self.configFile+" was not saved to disk ...");
                });
        },
	
	_sendMochad: function(body, command){
		var self = this;		
		var client = net.connect(1099, function(){
			client.on('data', function(data) {
				//console.log('data:', data.toString());
				self._sendXplStat(body, 'x10.basic');
			});
		
			client.on('error', function(err) {
				console.log('error:', err.message);
			});
			
			client.on('close', function() {
				console.log('Connection closed');
			});

			client.write(command);
		});
	},
        /*
         *  Plugin specifics functions
         */
        
        on : function(body) {
                var self = this;
                self._sendMochad(body, 'pl ' +body.device + ' on\n');
        },

        off : function(body) {
                var self = this;
                self._sendMochad(body, 'pl ' +body.device + ' off\n');
        },
        
        dim : function(body) {
                var self = this;
                self._sendMochad(body, 'pl ' +body.device + ' dim '+ body.level+'\n');
        },
        
        bright : function(body) {
                var self = this;
                self._sendMochad(body, 'pl ' +body.device + ' bright '+ body.level+'\n');
        }
}

for ( var m in proto) {
	wt.prototype[m] = proto[m];
}

