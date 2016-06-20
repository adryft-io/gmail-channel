#!/usr/bin/env node
var AWS = require('aws-sdk');
require('dotenv').config();

AWS.config.update({region: process.env.AWS_REGION});
var sqs = new AWS.SQS();
sqs.createQueue({QueueName: 'gmail-channel-webhooks'}, function (err, data) {
  if (err) return console.log(err);

  var url = data.QueueUrl; // use this queue URL to operate on the queue

  // Sending a message
  // The following example sends a message to the queue created in the previous example.
  var queue = new AWS.SQS({params: {QueueUrl: url}});
  var body = JSON.stringify({ email: 'user@domain.com', 'historyId': '127f90a30t' });
  queue.sendMessage({ MessageBody: body }, function (err, data) {
    if (err) return console.log(err);
    console.log(data);
  });
});
