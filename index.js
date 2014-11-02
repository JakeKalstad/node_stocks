var http = require('http'),
    querystring = require('querystring');
var writeToConsole = function (msg) { 'use strict'; console.log(msg); };

var DatasourceFactory = (function () {
    'use strict';
    function Http() {
        this.makeRequest = function (options, onReturn) {
            var req = http.request(options, function (res) {
                writeToConsole('STATUS: ' + res.statusCode);
                writeToConsole('HEADERS: ' + JSON.stringify(res.headers));
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    writeToConsole('BODY: ' + chunk);
                    onReturn(chunk);
                });
            });
 
            req.on('error', function (e) {
                writeToConsole('problem with request: ' + e.message);
            });
                // write data to request body
            if (options.data) {
                req.write(querystring.stringify(options.data));                 
            }
          
            req.end();
        };
    }
    
    function DataSource(config) {
        if (!config) {
            writeToConsole("Missing configuration");
        }
        this.config = config;
        writeToConsole("Created a " + this.config.name + " Datasource using the url: " + this.config.host + this.config.path);
        this.Search = function (symb, callBack) {
            var httpReq = new Http();
            httpReq.makeRequest({
                hostname: this.config.host,
                headers: {'content-type' : 'application/x-www-form-urlencoded'},
                port: 80,
                path: this.config.path,
                method: 'POST',
                data : { symbol : symb }
            }, function (jsonResult) {
                if (!jsonResult || jsonResult.Message) {
                    console.error("Error: ", jsonResult.Message);
                }
                callBack(jsonResult);
            });
        };
    }
    var data_src_config = [{ name : 'test', host : 'none', path : '/'},
                           { name : 'markit', host : "dev.markitondemand.com", path : "/Api/v2/Quote/jsonp"}];
    return {
        Datasource_Types : { test : 0, markit : 1 },
        GetDatasource : function (dataSrcType) {
            return new DataSource(data_src_config[dataSrcType]);
        }
    };
}());

module.exports = {
    Factory : DatasourceFactory
};

/* module
            */