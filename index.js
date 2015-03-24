var xplx10 = require("./lib/xpl-x10");
var schema_x10basic = require('/etc/wiseflat/schemas/x10.basic.json');

var wt = new xplx10(null, {
	//xplSource: 'bnz-shell.wiseflat'
        xplLog: false
});

wt.init(function(error, xpl) { 

	if (error) {
		console.error(error);
		return;
	}

	xpl.addBodySchema(schema_x10basic.id, schema_x10basic.definitions.body);
	
        xpl.on("xpl:x10.basic", function(evt) {
                if(evt.headerName == 'xpl-cmnd' && wt.validBasicSchema(evt.body)) {
                    if(evt.body.command == 'on') wt.on(evt.body);
                    if(evt.body.command == 'off') wt.off(evt.body);
                    if(evt.body.command == 'dim') wt.dim(evt.body);
                    if(evt.body.command == 'bright') wt.bright(evt.body);
                }
        });
});

