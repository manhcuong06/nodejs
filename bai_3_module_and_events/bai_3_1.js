const CAMEL_CASE = '1';
const BO_DAU = '2';
const FRIENDLY_URL = '3';

var http = require('http');
var fs = require ('fs');
var querystring = require('querystring');
var module_xu_ly_chuoi = require('./libraries/module_xu_ly_chuoi');

var server = http.createServer((request, response) => {
    var body;
    request.on('data', (data) => {
        body = data.toString();
    });
    request.on('end', () => {
        switch (request.url) {
            case '/':
                html = fs.readFileSync('./views/bai_3_1.html').toString();
                response.write(html);
                break;
            default:
                break;
        }

        var data_post = querystring.parse(body);
        var input_string = data_post.input_string;
        var output_type  = data_post.output_type;
        switch (output_type) {
            case CAMEL_CASE:
                var camel_case = module_xu_ly_chuoi.camelCase(input_string);
                response.write(camel_case);
                break;
            case BO_DAU:
                var string_bo_dau = module_xu_ly_chuoi.boDauTiengViet(input_string);
                response.write(string_bo_dau);
                break;
            case FRIENDLY_URL:
                var friendly_url = module_xu_ly_chuoi.friendUrl(input_string);
                response.write(friendly_url);
                break;
            default:
                break;
        }
        response.end();
    });
});
server.listen(8000);
