const puppeteer = require("puppeteer");
const twitter = require("./twitter");

const username = "theeko@hotmail.com";
const password = "eee111eee111";

(async () => {
  try {
    await twitter.initialize();
    await twitter.login(username, password);
    //await twitter.fetchUserData("udemy");
    await twitter.getTweets("udemy", 10);
    //await twitter.close();
  } catch (e) {
    console.log("something went wrong");
    console.log(e.message);
  }
})();
