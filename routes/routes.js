var costumers = require('../api/v1/costumers.js');
var affiliates = require('../api/v1/affiliates.js');
var transaction_charge = require('../api/v1/transaction_charge.js');
var transaction_cancel = require('../api/v1/transaction_cancel.js');
var bodyParser = require('body-parser');
var url_api = process.env.API_URL || 'https://test.u-zave.com/api/v1';

var swaggerUi = require('swagger-ui-express'),
    swaggerDocument = require('../swagger.json');


var appRouter = function (app) {
  //ruta swagger
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  
  app.use(function timeLog(req, res, next) {
    console.log('==> app_version: ' + process.env.npm_package_version);
    next();
  });

  app.get("/", function(req, res) {
    res.status(200).send("Welcome to our restful API");
  });

  // to uzave /api/v1/costumers
  app.post("/api/uzave/consulta", function(req, res) {
    var xml = '';
    try {
      console.log('body:\n' + req.body)
      xml = costumers.verificationClientRut(req, res, url_api);
      res.status(200).send(xml);
    } catch (ex) {
      console.log(ex)
      responseError(req, res, ex);
    }
  });

  // to uzave /api/v1/affiliates
  app.post("/api/uzave/afiliacion", function(req, res) {
    var xml = '';
    try {
      xml = affiliates.affiliatesOfPrograms(req, res, url_api);
      res.status(200).send(xml);
    } catch (ex) {
      console.log(ex)
      responseError(req, res, ex);
    }
  });

  // to uzave /api/v1/transactions/new
  app.post("/api/uzave/cargo", function(req, res) {
    var xml = '';
    try {
      transaction_charge.purchaseEntryNew(req, res, url_api);

    } catch (ex) {
      console.log(ex)
      responseError(req, res, ex);
    }
  });

  // to uzave /api/v1/transactions/cancel
  app.post("/api/uzave/anulacion", function(req, res) {
    var xml = '';
    try {
      transaction_cancel.purchaseEntryCancel(req, res, url_api);

    } catch (ex) {
      console.log(ex)
      responseError(req, res, ex);
    }
  });
}

function responseError(req, res, ex) {
  console.log(ex)
  xml = '';
  xml += '<ExecuteResponse>';
  xml += '<hdr></hdr>';
  xml += '<rsp>99</rsp>';
  xml += '</ExecuteResponse>';
  res.status(200).send(xml);
}

module.exports = appRouter;
