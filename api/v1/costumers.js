var library = require('../../library.js');
var request = require('sync-request');
var convert = require('xml-js');

this.verificationClientRut = function (req, res, url_api) {
  var xml = "";
  try {
    var xml = req.body.toString('utf8');
    // uzave params request
    var json_xml_req = JSON.parse(convert.xml2json(xml, {compact: true, spaces: 4}));
    var c_rut01 = json_xml_req.Execute.req._text.substring(3, 13);
    var c_rut02 = parseInt(c_rut01.substring(0, c_rut01.length - 1));
    var dv = c_rut01.substring(c_rut01.length - 1, c_rut01.length);

    console.log('==> json_xml_req: ' + JSON.stringify(json_xml_req));

    // input request params
    var rut = c_rut02.toString() + '-' + dv.toString();
    var program = 1; // constant
    var full_url = url_api + '/customers/' + rut + '/' + program;
    console.log('==> full_url: ' + full_url);

    // request to uzave
    var request_uzave = request('GET', full_url, {
      headers: {
        'Content-Type': 'application/json'
        // 'Authorization': process.env.API_AUTH || req.headers['authorization'],
        // 'X-API-KEY': process.env.API_KEY || req.headers['x-api-key']
      }
    });

    // process response uzave
    r_json = JSON.parse(request_uzave.body.toString('utf8'));
    r_json.origin = "uzave";
    json = JSON.stringify(r_json);
    console.log('==> request_uzave: ' + json);

    var c_response = "00";
    switch(r_json.status) {
      case 200: // ok
        c_response = "00";
        break;
      case 401: // app id not valid
        c_response = "01";
        break;
      case 403: // api key not valid
          c_response = "02";
          break;
      default:
          c_response = "98";
    }

    // test rut_not_valid
    if (!r_json.data.hasOwnProperty('name') &&
      !r_json.data.hasOwnProperty('last_name') &&
      !r_json.data.hasOwnProperty('save_profile')) {
      c_response = '03';
    }
    console.log('==> c_response: ' + c_response);

    // process response xml
    xml = '';
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
      var name = r_json.data.hasOwnProperty('name') ? r_json.data.name.trim() : '';
      var last_name = r_json.data.hasOwnProperty('last_name') ? r_json.data.last_name.trim() : '';
      var save_profile = r_json.data.hasOwnProperty('save_profile') ? r_json.data.save_profile.trim() : '';
      xml = '';
      xml += '<ExecuteResponse>';
      xml += '<hdr>';
      xml += json_xml_req.Execute.hdr._text;
      xml += '</hdr>';
      xml += '<rsp>';
      xml += c_response; // len 2 - Cod Respuesta
      xml += json_xml_req.Execute.req._text.substring(0, 3); // len 3 - Servicio
      xml += library.fillText(r_json.message.trim(), ' ', 40); // len 40 - Mensaje POS
      xml += library.fillText(c_rut02.toString() + dv.toString(), '0', 10); // len 10 - Rut Cliente
      xml += library.fillText(save_profile, '0', 3, 1); // len 3 - Profile
      xml += library.fillText(name, ' ', 20); // len 20 - Nombre
      xml += library.fillText(last_name, ' ', 20); // len 20 - Apellido
      xml += library.fillText(name + ' ' + last_name, ' ', 92); // len 92 - Nombre Paciente
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

  return xml;
}
