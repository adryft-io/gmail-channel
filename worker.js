var AWS = require('aws-sdk');
var Gmail = require('node-gmail-api');
// require('dotenv').config();

AWS.config.update({region: process.env.AWS_REGION});
var sqs = new AWS.SQS();

// from auth service
var connectedUsers = [{id: 0}];

// from auth service
var getToken = function(userId) {
  var tokens = {
    0: 'ya29.CjAIA0TOCILd7OCDMncygaJdDw0uBu7Ghewv_A_xrMsHYSg8dfuqpsGAz6VNQ2Wjkc0'
  };
  return tokens[userId];
}


sqs.createQueue({QueueName: 'triggers'}, function (err, resp) {
  if (err) return console.log(err);
  var url = resp.QueueUrl;
  var queue = new AWS.SQS({params: {QueueUrl: url}});

  connectedUsers.forEach(function(user) {
    var token = getToken(user.id);
    var gmail = new Gmail(token);
    gmail.messages('after:1466518000', {format: 'metadata'})
    .on('data', function (data) {
      if(data.labelIds.includes('IMPORTANT')) {
        trigger.call(queue, 'new-important');
      }
    });
  });
});

function trigger(name) {
  var body = JSON.stringify({ channel: 'gmail', name: name });
  this.sendMessage({ MessageBody: body }, function (err, data) {
    if (err) return console.log(err);
    console.log(data.MessageId);
  });
}
