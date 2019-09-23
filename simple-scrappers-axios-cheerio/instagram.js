const axios = require("axios");
const cheerio = require("cheerio");

let url = "https://www.instagram.com/willsmith/";

(async () => {
  let result = await axios.get(url);
  const $ = cheerio.load(result.data);

  let script = $("script[type='text/javascript']")
    .eq(3)
    .html();
  let json = /^window._sharedData = (.*);$/gi.exec(script)[1];
  let jsonObj = JSON.parse(json);
  let data = jsonObj["entry_data"]["ProfilePage"][0]["graphql"]["user"];

  let instaData = {
    followers: data.edge_followed_by.count,
    following: data.edge_follow.count,
    uploads: data.edge_owner_to_timeline_media.count,
    fullname: data.full_name,
    picture_url: data.profile_pic_url_hd
  };

  console.log(instaData);
})();
