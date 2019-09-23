const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const { Parser } = require("json2csv");
const fields = ["title", "rating"];
const json2csvParser = new Parser({ fields }); //without fields, it will get field names from array

const csvParser = require("csv-parser");

const movies = [
  {
    url: "https://www.imdb.com/title/tt0133093/?ref_=fn_al_tt_1",
    name: "matrix"
  },
  {
    url: "https://www.imdb.com/title/tt0120737/?ref_=tt_sims_tt",
    name: "lord of the rings"
  }
];
let $;
let data = [];

(async () => {
  for (let movie of movies) {
    let result = await axios.get(movie.url, {
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
        "cache-control": "max-age=0",
        referer: "https://www.imdb.com/find?ref_=nv_sr_fn&q=matrix&s=all",
        "sec-fetch-mode": " navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36"
      }
    });

    $ = cheerio.load(result.data);

    const title = $(".title_wrapper h1")
      .text()
      .trim();
    const rating = $("span[itemprop='ratingValue']").text();
    const poster = $(".poster img").attr("src");

    data.push({ title, rating, poster });

    const file = fs.createWriteStream(
      `${__dirname}/downloads/${movie.name}.jpg`,
      {
        encoding: "utf-8"
      }
    );

    let fileTypes = {
      "image/jpeg": "jpg"
    };

    console.log(Date.now());

    axios.get(poster, { responseType: "stream" }).then(function(response) {
      response.data.pipe(
        fs.createWriteStream(
          // or path.basename(url) // or Date.now() + name
          `${__dirname}/downloads/${movie.name}.${
            fileTypes[response.data.headers["content-type"]]
          }`
        )
      );
    });
  }
  const csv = json2csvParser.parse(data);

  fs.writeFileSync("./data.csv", csv, { flag: "a" });

  let results = [];
  fs.createReadStream("./data.csv")
    .pipe(csvParser())
    .on("data", data => {
      results.push(data);
      // console.log(data.title);
    })
    .on("end", () => {
      // console.log(results);
    });
})();
