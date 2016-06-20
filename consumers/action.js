require('dotenv').config();
var Consumer = require('sqs-consumer');
var AWS = require('aws-sdk');

AWS.config.update({region: process.env.AWS_REGION});
var sqs = new AWS.SQS();
sqs.getQueueUrl({ QueueName: 'gmail-channel-actions' }, function(err, data) {
  var app = Consumer.create({
    queueUrl: data.QueueUrl,
    handleMessage: function (message, done) {
      var id = message.MessageId;
      var body = JSON.parse(message.Body);
      console.log(id, body);
      done();
    },
    sqs: sqs
  });

  app.on('error', function (err) {
    console.log(err.message);
  });

  app.start();
});
