require('dotenv').config();
var http = require('http');

function handleRequest(req, res) {
  if (req.url === '/connected/gmail') {
    result = JSON.stringify([
      {
        id: 0
      }
    ]);
  } else {
    result = JSON.stringify({
      access_token: process.env.GMAIL_TEST_ACCESS_TOKEN
    });
  }

  res.end(result);
}

var server = http.createServer(handleRequest);
server.listen(process.env.PORT || 8000, function() { console.log('listening...'); });
