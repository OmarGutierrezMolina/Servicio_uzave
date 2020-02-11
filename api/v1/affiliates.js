var library = require('../../library.js');
var request = require('sync-request');
var convert = require('xml-js');

this.affiliatesOfPrograms = function (req, res, url_api) {
  var xml = ""
  try {
    var xml = req.body.toString('utf8');
    // uzave params request

    // input request params
    var program = req.body.data.program
    var full_url = url_api + '/affiliates/' + program;
    console.log('==> full_url: ' + full_url);

    // request to uzave
    var request_uzave = request('GET', full_url, {
      headers: {
        'Content-Type': 'application/json'
        // 'Authorization': process.env.API_AUTH || req.headers['authorization'],
        // 'X-API-KEY': process.env.API_KEY || req.headers['x-api-key']
      },
    });

    // process response
    r_json = JSON.parse(request_uzave.body.toString('utf8'));
    r_json.origin = "uzave";
    json = JSON.stringify(r_json);
    console.log('==> request_uzave: ' + json);

    // process response xml
    xml = '';
    xml += '<ExecuteResponse>';
    xml += '<hdr>';
    xml += 'Servicio no documentado';
    xml += '</hdr>';
    xml += '<rsp>';
    xml += json;
    xml += '</rsp>';
    xml += '<org>uzave</org>';
    xml += '<dsc>OK</dsc>';
    xml += '</ExecuteResponse>';

  } catch (ex) {
    console.log(ex)
    xml = '';
    xml += '<ExecuteResponse>';
    xml += '<hdr></hdr>';
    xml += '<rsp>99</rsp>';
    xml += '<org>nodejs</org>';
    xml += '<dsc>' + ex + '</dsc>';
    xml += '</ExecuteResponse>';
  }

  return xml;
}
