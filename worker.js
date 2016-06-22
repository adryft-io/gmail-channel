var AWS = require('aws-sdk');
var Gmail = require('node-gmail-api');
var request = require('request-promise');
var moment = require('moment');
require('dotenv').config();

AWS.config.update({region: process.env.AWS_REGION});
var auth = process.env.AUTH_SERVICE_URL;


var getQueue = function(sqs, name) {
  return new Promise(function(resolve, reject) {
    sqs.getQueueUrl({QueueName: name}, function (err, resp) {
      if (err) return reject(err);
      return resolve(resp);
    });
  }).then(function(res) {
    return new AWS.SQS({params: {QueueUrl: res.QueueUrl}});
  });
};

var getConnectedUsers = function() {
  return request({ uri: auth + '/connected/gmail', json: true });
};

var getToken = function(userId) {
  return request({ uri: auth + '/token/' + userId, json: true });
};

var getMessages = function(gmail) {
  return new Promise(function(resolve, reject) {
    var messages = [];
    var lastCheckedAt = moment().subtract(15, 'minutes').format('x');
    gmail.messages('after:' + lastCheckedAt, {format: 'metadata'})
    .on('data', function (data) {
      messages.push(data);
    })
    .on('end', function() {
      console.log(messages);
      resolve(messages)
    });
  });
};

var triggerProgagatedEvents = function(messages) {
  var propagated = {};
  messages.forEach(function(message) {
    if(message.labelIds.includes('IMPORTANT') && typeof propagated['new-important'] === 'undefined') {
      propagated['new-important'] = true;
    }
  });

  Object.keys(propagated).forEach(function(name) {
    trigger(name, user.id);
  });
};

var trigger = function(name, userId) {
  var body = JSON.stringify({ trigger_channel: 'gmail', trigger_name: name, user_id: userId });
  this.sendMessage({ MessageBody: body }, function (err, data) {
    if (err) return console.log(err);
    console.log(data.MessageId);
  });
};

getQueue(new AWS.SQS(), 'triggers')
.then(function(queue) {
  trigger = trigger.bind(queue);

  getConnectedUsers().then(function(connectedUsers) {
    console.log(connectedUsers);
    connectedUsers.forEach(function(user) {
      getToken(user.id)
      .then(function(token) { return new Gmail(token); })
      .then(getMessages)
      .then(triggerProgagatedEvents);
    });
  });
});
