var config = require('../config.json');

require('http').createServer(function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<html><head></head><body><div class="a">Protected server</div></body></html>');
  res.end();
}).listen(config.targetPort); 
console.log("Protected server listening on " + config.targetPort);