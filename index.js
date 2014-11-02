var http = require('http'),
    querystring = require('querystring');

function writeToConsole(msg) { 'use strict'; console.log(msg); }
function retrieveData(data) { 'use strict'; return data; }

var DatasourceFactory = (function () {
    'use strict';
    function Http() {
        this.makeRequest = function (options, onReturn) {
            var request = require('request');
            request.post({
                headers: {'content-type' : 'application/x-www-form-urlencoded'},
                url:     options.url,
                body:    options.data
            }, function (error, response, body) {
                if (body) {
                    // Eval is evil... but i'm baffled at what else to do with the behavior i'm seeing
                    onReturn(eval(body));
                } else if (error) {
                    onReturn(error);
                } else { onReturn({}); }
            });
        };
    }
    function DataSource(config) {
        if (!config) {
            writeToConsole("Missing configuration");
        }
        this.config = config;
        this.Search = function (symb, callBack) {
            var httpReq = new Http(),
                data = querystring.stringify({ symbol : symb, callBack : 'retrieveData' });
            httpReq.makeRequest({
                url: this.config.url,
                headers: {'content-type' : 'application/x-www-form-urlencoded', 'Content-Length': data.length},
                port: 80,
                method: 'POST',
                data : data
            }, function (jsonResult) {
                if (!jsonResult || jsonResult.Message) {
                    console.error("Error: ", jsonResult.Message);
                }
                callBack(jsonResult);
            });
        };
    }
    var data_src_config = [{ name : 'test', url : 'none'},
                           { name : 'markit', url : "http://dev.markitondemand.com/Api/v2/Quote/jsonp"}];
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