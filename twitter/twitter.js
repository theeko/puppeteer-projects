const puppeteer = require("puppeteer");

let browser = null;
let page = null;

const baseUrl = "https://twitter.com";
const loginUrl = `${baseUrl}/login`;
const userUrl = username => `${baseUrl}/${username}`;

const isThereAField = selector => (selector ? selector :"");

const twitter = {
  async initialize() {
    browser = await puppeteer.launch({ headless: true });
    page = await browser.newPage();
    // await page.setRequestInterception(true);
    // page.on("request", req => {
    //   if (
    //     ["stylesheet", "image", "media", "font"].includes(req.resourceType())
    //   ) {
    //     req.abort();
    //   } else {
    //     req.continue();
    //   }
    // });
    await page.goto(baseUrl);
    return this;
  },
  login: async (username, password) => {
    if (!page || !browser) this.initialize();
    await page.goto(loginUrl);
    await page.waitFor("input[class^='js-username-field']");
    await page.waitFor(500);

    await page.type("input[class^='js-username-field']", username, {
      delay: 100
    });
    await page.type("input[class^='js-password-field']", password, {
      delay: 100
    });
    await page.click("button[class^='submit']");

    return this;
  },
  tweet: async text => {
    await page.goto(baseUrl);
    await page.waitFor("a[data-testid='SideNav_NewTweet_Button']");
    await page.waitFor(1000);
    await page.click("a[href='/compose/tweet']");
    await page.waitFor(500);
    await page.keyboard.type(text, {
      delay: 100
    });
    await page.click("div[data-testid='tweetButton']");
  },
  fetchUserData: async username => {
    let url = await page.url();
    if (url != userUrl(username)) {
      await page.goto(userUrl(username));

      await page.waitFor(500);
    }

    await page.waitFor("h2[role='heading']");
    await page.waitFor(500);
    let data = await page.evaluate(() => {
      // sender
      // Array.from(document.querySelectorAll("div[data-testid='tweet'] > div:nth-child(2)")).map(item=> item.querySelector("a").textContent)

      //twitter text content
      // Array.from(document.querySelectorAll("div[data-testid='tweet'] > div:nth-child(2)")).map(item=> item.querySelector("div[lang='en']").textContent)

      //like-retweet etc count
      // Array.from(document.querySelectorAll("div[data-testid='tweet'] > div:nth-child(2)")).map(item=> item.querySelector("div[role='group']").getAttribute("aria-label"))

      return {
        description:
          document.querySelector("div[data-testid='UserDescription']") &&
          document.querySelector("div[data-testid='UserDescription']")
            .textContent,
        isVerified: document.querySelector("svg[aria-label='Verified account']")
          ? true
          : false,
        followingCount:
          document.querySelector(`a[href*='following'] span:first-child`) &&
          document.querySelector(`a[href*='following'] span:first-child`)
            .textContent,
        followerCount:
          document.querySelector(`a[href*='followers'] span:first-child`) &&
          document.querySelector(`a[href*='followers'] span:first-child`)
            .textContent,
        profileInfo: Array.from(
          document.querySelectorAll(
            "div[data-testid='UserProfileHeader_Items'] > span"
          )
        ).map(item => item.textContent)
      };
    });

    console.log(data);
  },
  getTweets: async (username, howMany = 6) => {
    let url = await page.url();
    if (url != userUrl(username)) {
      await page.goto(userUrl(username));
      await page.waitFor(1000);
    }

    let doesAccExist = await page.evaluate(() => {
      // return document.querySelectorAll("[data-testid]")[6].querySelectorAll("span")[4].textContent == doesAccExist;
      let test = Array.from(document.querySelectorAll("span")).every(span => {
        span.textContent != "This account doesn’t exist";
      });
      return test;
    });

    if (!doesAccExist) {
      console.log("This account doesn’t exist");
      return;
    }

    await page.waitFor("div[data-testid='tweet']");
    await page.waitFor(1000);

    let tweetArray = await page.$$(
      "div[data-testid='tweet'] > div:nth-child(2)"
    );
    let lastCount = null;
    while (
      (tweetArray.length !== lastCount || !lastCount) &&
      tweetArray.length < howMany
    ) {
      lastCount = tweetArray.length;
      await page.evaluate(() => window.scrollBy(0, document.body.scrollHeight));
      await page.waitFor(2000);
      tweetArray = await page.$$("div[data-testid='tweet'] > div:nth-child(2)");
      console.log("while");
    }

    let data = await page.evaluate(() => {
      let posts = Array.from(
        document.querySelectorAll("div[data-testid='tweet'] > div:nth-child(2)")
      );

      return posts.map(item => {
        const sender = item.querySelector("a").textContent;
        const text = item.querySelector("div[lang='en']").textContent;
        const etc = item
          .querySelector("div[role='group']")
          .getAttribute("aria-label");

        return {
          sender,
          text,
          etc
        };
      });
    });

    console.log(data.slice(0, howMany));
    console.log(data.length);
  },

  close: async () => {
    await browser.close();
  }
};

module.exports = twitter;
