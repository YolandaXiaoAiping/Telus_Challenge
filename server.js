var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//added for data retrive

var fs = require('fs')
var data = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:loc="http://www.csapi.org/schema/parlayx/terminal_location/v2_3/local"><soapenv:Header/><soapenv:Body><loc:getLocation><loc:address>tel:6048427146</loc:address><loc:requestedAccuracy>5000</loc:requestedAccuracy> <loc:acceptableAccuracy>5000</loc:acceptableAccuracy> </loc:getLocation> </soapenv:Body></soapenv:Envelope>';
var https = require('https');
var buf = fs.readFileSync('telus.p12');
var options = { host: 'webservices.telus.com',
  port: 443,
  path: '/TerminalLocationService/services/TerminalLocation',
  method: 'POST',
  headers:
   { 'Content-Type': 'text/xml; charset=utf-8',
     'Content-Length': data.length } ,
  pfx: buf,
  passphrase: 'secret'
};

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


app.use(express.static(__dirname));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  console.log('a user connected');
  socket.on('disconnect', function() {
      console.log('user disconnected');
  });

  socket.on('clicked', function(msg){
      console.log('Button is clicked.');

      var req = https.request(options, (res) => {
        console.log('statusCode:', res.statusCode);
        console.log('headers:', res.headers);
        var msg = '';

        res.on('data', (chunk) => {
          msg+=chunk;
        });
        res.on('end', function() {
          console.log(msg);
        });
      });

      req.on('error', (e) => {
        console.error(e);
      });

      req.write(data);
      req.end();
      
  });
});

http.listen(8080, function() {
    console.log('listen on *:8080')
});
