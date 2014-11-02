var http = require('http'),
    querystring = require('querystring');
var writeToConsole = function (msg) { 'use strict'; console.log(msg); };
function retrieveData(data){ return data; };
var DatasourceFactory = (function () {
    'use strict';
    function Http() {
        this.makeRequest = function (options, onReturn) {
            var request = require('request'); 
            request.post({
              headers: {'content-type' : 'application/x-www-form-urlencoded'},
              url:     "http://"+ options.hostname + options.path,
              body:    options.data
            }, function(error, response, body){
                if(body)
                    onReturn(eval(body));
                else if(error)
                    onReturn(error);
                else onReturn({});
            });
        };
    }
    function DataSource(config) {
        if (!config) {
            writeToConsole("Missing configuration");
        }
        this.config = config; 
        this.Search = function (symb, callBack) {
            var httpReq = new Http();
            var data = querystring.stringify({ symbol : symb, callBack : 'retrieveData' });
            httpReq.makeRequest({
                hostname: this.config.host,
                headers: {'content-type' : 'application/x-www-form-urlencoded', 'Content-Length': data.length},
                port: 80,
                path: this.config.path,
                method: 'POST',
                data : data,
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
    StockQuotes : DatasourceFactory.GetDatasource(DatasourceFactory.Datasource_Types.markit)
};

/* module
            */