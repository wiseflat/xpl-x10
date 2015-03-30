var Xpl = require('xpl-api');
var fs = require('fs');
var os = require('os');
var net = require('net');

function wt(device, options) {
	options = options || {};
	this._options = options;
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

