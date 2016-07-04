var AWS = require('aws-sdk');
var Gmail = require('node-gmail-api');
var request = require('request-promise');
var moment = require('moment');
require('dotenv').config({ silent: true });

AWS.config.update({region: process.env.AWS_REGION});
var auth = process.env.AUTH_SERVICE_URL;


var getQueue = function(sqs, name) {
  return new Promise(function(resolve, reject) {
    sqs.getQueueUrl({QueueName: name}, function (err, resp) {
      if (err) return reject(err);
      return resolve(resp);
    });
  }).then(function(res) {
    console.log(res.QueueUrl);
    return new AWS.SQS({params: {QueueUrl: res.QueueUrl}});
  });
};

var getConnectedUsers = function() {
  return request({ uri: auth + '/connected/gmail', json: true });
};

var getToken = function(userId) {
  return request({ uri: auth + '/token/gmail/' + userId, json: true })
  .then(function(resp) {
    return resp.accessToken;
  })
  .catch(function(err) {
    console.log(err);
  });
};

var getMessages = function(gmail) {
  return new Promise(function(resolve, reject) {
    var messages = [];

    // TODO: last checked should eventually be tracked per user
    var lastCheckedAt = moment().subtract(process.env.FREQUENCY, 'minutes').unix();

    gmail.messages('after:' + lastCheckedAt, {format: 'metadata'})
    .on('data', function (data) {
      messages.push(data);
    })
    .on('end', function() {
      console.log(messages);
      resolve(messages);
    });
  });
};

var triggerProgagatedEvents = function(userId) {
  return function(messages) {
    var propagated = {};
    messages.forEach(function(message) {
      if(message.labelIds.includes('IMPORTANT') && typeof propagated['new-important'] === 'undefined') {
        propagated['new-important'] = true;
      }
    });

    Object.keys(propagated).forEach(function(triggerName) {
      trigger(triggerName, userId);
    });
  }
};

var trigger = function(name, userId) {
  var body = JSON.stringify({ action_channel: 'gmail', action_name: name, user_id: userId });
  this.sendMessage({ MessageBody: body }, function (err, data) {
    if (err) return console.log(err);
    console.log(name, userId, data.MessageId);
  });
};

getQueue(new AWS.SQS(), 'trigger')
.then(function(queue) {
  trigger = trigger.bind(queue);

  getConnectedUsers().then(function(connectedUsers) {
    console.log(connectedUsers);
    connectedUsers.forEach(function(userId) {
      getToken(userId)
      .then(function(token) { console.log(token); return new Gmail(token); })
      .then(getMessages)
      .then(triggerProgagatedEvents(userId));
    });
  });
});
