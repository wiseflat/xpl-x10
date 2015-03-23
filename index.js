var xplx10 = require("./lib/xpl-x10");

var wt = new xplx10(null, {
	//xplSource: 'bnz-shell.wiseflat'
        xplLog: false
});

wt.init(function(error, xpl) { 

	if (error) {
		console.error(error);
		return;
	}

        xpl.on("xpl:x10.basic", function(evt) {
                if(evt.headerName == 'xpl-cmnd' && wt.validBasicSchema(evt.body)) {
                    //console.log(evt);
                    if(evt.body.command == 'on') wt.on(evt.body);
                    if(evt.body.command == 'off') wt.off(evt.body);
                    if(evt.body.command == 'dim') wt.dim(evt.body);
                    if(evt.body.command == 'bright') wt.bright(evt.body);
                }
        });
});

