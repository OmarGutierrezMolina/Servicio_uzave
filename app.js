var express = require("express");
var bodyParser = require("body-parser");
var routes = require("./routes/routes.js");
var app = express();

app.use(bodyParser.raw({type: '*/*'}));
app.use(bodyParser.urlencoded({ extended: true }));

routes(app);

var server = app.listen(process.env.HTTP_PORT || 3030, function () {
    console.log("app running on port.", server.address().port);
});
