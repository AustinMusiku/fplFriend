const twit = require('twit');
const dotenv = require('dotenv');

// setup config files
dotenv.config({
    path: '../.env'
});

// setup twitter api
const T = new twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

// send tweet
const sendTweet = (tweet) => {
    params = {
        status: tweet
    }
    T.post('statuses/update', params, (err, data, response) => {
        if (err) {
        console.log(err);
        } else{
        console.log(data);
        }
    });
};

// account info
const accountInfo = (screen_name) => {
    params = {
        screen_name: screen_name
    }
    T.get('users/show', params, (err, data, response) => {
        if (err) {
        console.log(err);
        } else{
        console.log(data);
        }
    });
};

module.exports = { sendTweet, accountInfo }