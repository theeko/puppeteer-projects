const fs = require("fs");
const path = require("path");

module.exports = async function downloadImage(url, name) {
  const path = path.resolve(__dirname, "downloads", `${name}.jpg`);
  const writer = fs.createWriteStream(path);

  const response = await Axios({
    url,
    method: "GET",
    responseType: "stream"
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
};
