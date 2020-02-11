var library = require('../../library.js');
var url = require('url');
var https = require('https');
var querystring = require('querystring');
var Promise = require("node-promise").Promise;
var convert = require('xml-js');
var transactions = this;
var request_uzave;
var json_xml_req;

this.purchaseEntryCancel = function (req, res, url_api) {
  var xml = ""
  try {
    var xml = req.body.toString('utf8');
    // uzave params request
    json_xml_req = JSON.parse(convert.xml2json(xml, {compact: true, spaces: 4}));
    var c_rut01 = json_xml_req.Execute.req._text.substring(3, 13);
    var c_rut02 = parseInt(c_rut01.substring(0, c_rut01.length - 1));
    var dv = c_rut01.substring(c_rut01.length - 1, c_rut01.length);

    var date = json_xml_req.Execute.hdr._text.substring(9, 9 + 8);
    var time = json_xml_req.Execute.hdr._text.substring(17, 17 + 6);
    var full_date = date.substring(0, 4) + '-' + date.substring(4, 6) + '-' + date.substring(6, 8) + ' ' +  time.substring(0, 2) + ':' + time.substring(2, 4) + ':' + time.substring(4, 6); // 20180807162400
    console.log('==> json_xml_req: ' + JSON.stringify(json_xml_req));
    var json_req = '';
    var form = querystring.stringify({
      code_uzave:json_xml_req.Execute.req._text.substring(3, 3 + 36),
      date_time:full_date, // date + time = 8 + 6
      store_code:json_xml_req.Execute.hdr._text.substring(3, 3 + 3), // id comercio
      type:json_xml_req.Execute.req._text.substring(53, 53 + 1)
    });
    console.log('==> formData:\n ' + form);

    // input request params
    var full_url = url_api + '/annulmented-transactions';
    var m_url = url.parse(full_url);
    console.log('==> full_url: ' + full_url);

    var post_options = {
      method: 'DELETE',
      host: m_url.host,
      path: m_url.path,
      port: '443',
      headers: {
        'Content-Length': form.length,
        'Content-Type': 'application/x-www-form-urlencoded'
        // 'Authorization': process.env.API_AUTH || req.headers['authorization'],
        // 'X-API-KEY': process.env.API_KEY || req.headers['x-api-key']
      }
    };

    post_callback = function(response) {
      var str = ''
      response.on('data', function (chunk) {
        str += chunk;
      });

      response.on('end', function () {
        transactions.purchaseEntryCancelFinally(req, res, str);
      });
    }
    var form_req = https.request(post_options, post_callback);
    form_req.write(form);
    form_req.end();

  } catch (ex) {
    console.log(ex)
    xml = '';
    xml += '<ExecuteResponse>';
    xml += '<hdr></hdr>';
    xml += '<rsp>';
    xml += '99'; // len 2 - Cod Respuesta
    xml += json_xml_req.Execute.req._text.substring(0, 3); // len 3 - Servicio
    xml += library.fillText('Error 500 NodeJS', ' ', 40); // len 40 - Mensaje POS
    xml += '</rsp>';
    xml += '</ExecuteResponse>';
    res.status(200).send(xml);
  }
}

this.purchaseEntryCancelFinally = function (req, res, request_uzave) {
  try {
    // process response
    r_json = JSON.parse(request_uzave);
    r_json.origin = "uzave";
    json = JSON.stringify(r_json);
    console.log('==> request_uzave: ' + json);

    var c_response = "00";
    switch(r_json.status) {
      case 200: // ok
        c_response = "00";
        break;
      case 400: // transaction not found
          c_response = "01";
          break;
      case 401: // app id not valid
          c_response = "03";
          break;ok
      case 403: // api key not valid
          c_response = "04";
          break;
      default:
          c_response = "98";
    }

    // process response xml
    if (c_response != '00') {
      xml = '';
      xml += '<ExecuteResponse>';
      xml += '<hdr>';
      xml += json_xml_req.Execute.hdr._text;
      xml += '</hdr>';
      xml += '<rsp>';
      xml += c_response; // len 2 - Cod Respuesta
      xml += json_xml_req.Execute.req._text.substring(0, 3); // len 3 - Servicio
      xml += library.fillText(r_json.message.trim(), ' ', 40); // len 40 - Mensaje POS
      xml += '</rsp>';
      xml += '</ExecuteResponse>';

    } else {
      xml = '';
      xml += '<ExecuteResponse>';
      xml += '<hdr>';
      xml += json_xml_req.Execute.hdr._text;
      xml += '</hdr>';
      xml += '<rsp>';
      xml += c_response; // len 2 - Cod Respuesta
      xml += json_xml_req.Execute.req._text.substring(0, 3); // len 3 - Servicio
      xml += library.fillText(r_json.message.trim(), ' ', 40); // len 40 - Mensaje POS
      xml += r_json.data.refund_code; // len 1 - Devolucion

      if (json_xml_req.Execute.req._text.substring(53, 53 + 1) == 1) {
        xml += library.parseDatePOSFormat(r_json.data.fecha_anulacion_comercio.trim()); // len 8 - Fecha anulación comercio formato aaaammdd
        xml += library.parseDatePOSFormat(r_json.data.fecha_anulacion_uzave.trim()); // len 8 - Fecha anulación U-zave formato aaaammdd

      } else if (json_xml_req.Execute.req._text.substring(53, 53 + 1) == 2) {
        xml += library.parseDatePOSFormat(r_json.data.fecha_reversa_comercio.trim()); // len 8 - Fecha anulación comercio formato aaaammdd
        xml += library.parseDatePOSFormat(r_json.data.fecha_reversa_uzave.trim()); // len 8 - Fecha anulación U-zave formato aaaammdd
      }

      xml += library.fillText(' ', ' ', 57); // len 57 - Filler
      xml += '</rsp>';
      xml += '</ExecuteResponse>';
    }

  } catch (ex) {
    console.log(ex)
    xml = '';
    xml += '<ExecuteResponse>';
    xml += '<hdr></hdr>';
    xml += '<rsp>';
    xml += '99'; // len 2 - Cod Respuesta
    xml += json_xml_req.Execute.req._text.substring(0, 3); // len 3 - Servicio
    xml += library.fillText('Error 500 NodeJS', ' ', 40); // len 40 - Mensaje POS
    xml += '</rsp>';
    xml += '</ExecuteResponse>';
  }

  res.status(200).send(xml);
}
