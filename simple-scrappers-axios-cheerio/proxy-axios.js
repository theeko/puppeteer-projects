const axios = require("axios");

(async () => {
  let result;
  try {
    result = await axios.get("https://httpbin.org/status/300");
  } catch (e) {
    if (e.response.status === 300) {
      console.log(result.data);
    }
  }
})().catch(e => console.log("this?"));
