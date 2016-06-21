var AWS = require('aws-sdk');
var Gmail = require('node-gmail-api');
require('dotenv').config();

AWS.config.update({region: process.env.AWS_REGION});
var sqs = new AWS.SQS();

// from auth service
var connectedUsers = [{id: 0}];

// from auth service
var getToken = function(userId) {
  var tokens = {
    0: process.env.GMAIL_TEST_ACCESS_TOKEN
  };
  return tokens[userId];
}

var trigger = function(name, userId) {
  var body = JSON.stringify({ channel: 'gmail', name: name, userId: userId });
  this.sendMessage({ MessageBody: body }, function (err, data) {
    if (err) return console.log(err);
    console.log(data.MessageId);
  });
}

// TODO: promsify
sqs.getQueueUrl({QueueName: 'triggers'}, function (err, resp) {
  if (err) return console.log(err);
  var queue = new AWS.SQS({params: {QueueUrl: resp.QueueUrl}});
  trigger = trigger.bind(queue);

  connectedUsers.forEach(function(user) {
    var messages = [];
    var token = getToken(user.id);
    var gmail = new Gmail(token);
    gmail.messages('after:1466518000', {format: 'metadata'})
    .on('data', function (data) {
      messages.push(data);
    })
    .on('end', function() {
      var occurred = {}
      messages.forEach(function(message) {
        if(message.labelIds.includes('IMPORTANT') && typeof occurred['new-important'] === 'undefined') {
          occurred['new-important'] = true;
        }
      })

      Object.keys(occurred).forEach(function(name) {
        trigger(name, user.id);
      });
    });
  });
});
