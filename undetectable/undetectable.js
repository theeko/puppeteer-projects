const puppeteer = require("puppeteer");
const randomUseragent = require("random-useragent");
let url =
  "https://intoli.com/blog/not-possible-to-block-chrome-headless/chrome-headless-test.html";
let url2 = "https://arh.antoinevastel.com/bots/areyouheadless";

// https://antoinevastel.com/bot%20detection/2018/01/17/detect-chrome-headless-v2.html
/***********************************
// User agent 
if (/HeadlessChrome/.test(window.navigator.userAgent)) {
  console.log("Chrome headless detected");
}

// Webdriver
if(navigator.webdriver) {
  console.log("Chrome headless detected");
}

// Chrome: an obj for extension devs, available in normal but not in headless mode
if(isChrome && !window.chrome) {
  console.log("Chrome headless detected");
}

// Permissions : not possible to handle permissions in headless mode, ,
// thus, leads to an inconsistent state where Noti.permission and nav.permissions.query 
navigator.permissions.query({name:'notifications'}).then(function(permissionStatus) {
  if(Notification.permission === 'denied' && permissionStatus.state === 'prompt') {
      console.log('This is Chrome headless')	
  } else {
      console.log('This is not Chrome headless')
  }
});

// Plugins : pdf reader, etc plugins, length is 0 in headless(no plugins)
if(navigator.plugins.length === 0) {
  console.log("It may be Chrome headless"); // maybe
}

//Languages: nav.language(lang of browser ui), nav.languages(users prefered: returns "" in headless) 
if(navigator.languages === "") {
  console.log("Chrome headless detected");
}

**************************************************************************************/

(async () => {
  const browserOpts = {
    headless: true,
    // just setting lang works
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--lang=en-US,en;q=0.9"]
  };

  let browser = await puppeteer.launch(browserOpts);
  let page = await browser.newPage();
  await page.setUserAgent(randomUseragent.getRandom()); // setting userAgent
  // await page.evaluateOnNewDocument(() => {
  //   Object.defineProperty(navigator, 'webdriver', {
  //     get: () => false, // or delete navigator.__proto__.webdriver; instead of defineProp(this way it keeps getter/setter)
  //   });
  // });

  // webdriver is true for automated browser, we are deleting it
  await page.evaluateOnNewDocument(() => {
    delete navigator.__proto__.webdriver;
  });

  // Pass the Chrome Test. (there is a chrome obj for extension dev)
  await page.evaluateOnNewDocument(() => {
    // We can mock this in as much depth as we need for the test.
    window.chrome = {
      runtime: {},
      something: {}
    };
  });

  // Pass the Plugins Length Test.
  await page.evaluateOnNewDocument(() => {
    // Overwrite the `plugins` property to use a custom getter.
    Object.defineProperty(navigator, "plugins", {
      // This just needs to have `length > 0` for the current test,
      // but we could mock the plugins too if necessary.
      get: () => [1, 2, 3, 4, 5]
    });
  });

  // Pass the Languages Test.
  await page.evaluateOnNewDocument(() => {
    // Overwrite the `plugins` property to use a custom getter.
    Object.defineProperty(navigator, "languages", {
      get: () => ["en-US", "en", "q=0.9"]
    });
  });

  // Pass the Permissions Test.
  await page.evaluateOnNewDocument(() => {
    const originalQuery = window.navigator.permissions.query;
    return (window.navigator.permissions.query = parameters =>
      parameters.name === "notifications"
        ? Promise.resolve({ state: Notification.permission })
        : originalQuery(parameters));
  });

  await page.goto(url2, { waitUntil: "networkidle2" });
  await page.screenshot({ path: "./test.jpg" });
  await browser.close();
})();
