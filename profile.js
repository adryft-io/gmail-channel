var google = require('googleapis');
var gmail = google.gmail('v1');

var CLIENT_ID = '928786934582-5dh1oa7o2344a3m04a8ehoa6engstvdd.apps.googleusercontent.com';
var CLIENT_SECRET = 'EisvKlTJzl9PIRlPyh7iuABQ';
var REDIRECT_URL = 'http://localhost:8000/api/auth/callback';

var OAuth2 = google.auth.OAuth2;
var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
oauth2Client.setCredentials({
  access_token: 'ya29.CjAGA0BJrczoQQnKCQj2q3YFhUCRjWzqa2BCJermPDF1Qg6z225RR0uNTObgDspUF8I'
});

gmail.users.getProfile({
  auth: oauth2Client,
  userId: 'me'
}, function(err, response) {
  console.log(err, response);
});
