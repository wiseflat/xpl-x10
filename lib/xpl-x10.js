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

                        self._log("XPL is ready");
                        callback(null,  self.xpl);
                });
                
        },

	_log: function(log) {
		/*if (!this._configuration.xplLog) {
			return;
		}*/
                
		console.log('xpl-x10 -', log);
	},
    
        _sendXplStat: function(body, schema, target) {
                var self = this;
                self.xpl.sendXplStat(
                        body, 
                        schema,
			target
                );
        },
      
	/*
         *  Config xPL message
         */
        
        readConfig: function(callback) {
                var self = this;
                fs.readFile(self.configFile, { encoding: "utf-8"}, function (err, body) {
                        if (err) self._log("file "+self.configFile+" is empty ...");
                        else self.configHash = JSON.parse(body);
                });
        },

        sendConfig: function(callback) {
                var self = this;
                self._sendXplStat(self.configHash, 'x10.config', '*');
        },
        
        writeConfig: function(evt) {
                var self = this;
		self.configHash.version = self.version;
                self.configHash.enable = evt.body.enable;
                fs.writeFile(self.configFile, JSON.stringify(self.configHash), function(err) {
                        if (err) self._log("file "+self.configFile+" was not saved to disk ...");
			else self._sendXplStat(self.configHash, 'x10.config', evt.header.source);
                });
        },
	
	/*_sendMochad: function(evt, command){
		var self = this;		
		var client = net.connect(1099, function(){
			client.on('data', function(data) {
				//self._log('data:', data.toString());
				self._sendXplStat(evt.body, 'x10.basic', evt.header.source);
			});
		
			client.on('error', function(err) {
				self._log('error:', err.message);
			});
			
			client.on('close', function() {
				self._log('Connection closed');
			});

			client.write(command);
		});
	},*/
	
	_sendMochad: function(evt, command){
		var self = this;		
		var client = net.connect(1099, function(){
			client.write(command);
		});
		client.on('data', function(data) {
			self._sendXplStat(evt.body, 'x10.basic', evt.header.source);
			client.end();
		});
	
		client.on('error', function(err) {
			self._log('error:', err.message);
		});
		
		/*client.on('end', function() {
			self._log('Connection closed');
		});*/
	},
	
        /*
         *  Plugin specifics functions
         */
        
        on : function(evt) {
                var self = this;
                self._sendMochad(evt, 'pl ' +evt.body.device + ' on\n');
        },

        off : function(evt) {
                var self = this;
                self._sendMochad(evt, 'pl ' +evt.body.device + ' off\n');
        },
        
        dim : function(evt) {
                var self = this;
                self._sendMochad(evt, 'pl ' +evt.body.device + ' dim '+ evt.body.level+'\n');
        },
        
        bright : function(evt) {
                var self = this;
                self._sendMochad(evt, 'pl ' +evt.body.device + ' bright '+ evt.body.level+'\n');
        }
}

for ( var m in proto) {
	wt.prototype[m] = proto[m];
}

