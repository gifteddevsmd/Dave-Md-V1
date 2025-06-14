/**
   * DAVE-MD-V1 - WHATSAPP BOT
   * Rebranded and Maintained by GiftedDave
   * GitHub: https://github.com/gifteddaves
   * Contact: https://wa.me/254104260236
   * Telegram: https://t.me/Digladoo
   * Instagram: https://www.instagram.com/_gifted_dave/profilecard/?igsh=MWFjZHdmcm4zMGkzNw==
*/

const axios = require("axios");
const cheerio = require("cheerio");
const fetch = require("node-fetch");
const FormData = require("form-data");
const qs = require("qs");

async function tiktokdlv1(url) {
  return new Promise(async (resolve, reject) => {
    await axios.get(`https://tikdown.org/id`, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
      },
    }).then(async (res) => {
      const $ = cheerio.load(res.data);
      const token = $('input[name="token"]').attr("value");
      const form = new URLSearchParams();
      form.append("url", url);
      form.append("format", "");
      form.append("token", token);
      await axios.post(`https://tikdown.org/getAjax?url=${url}`, form, {
        headers: {
          accept: "*/*",
          "accept-language": "en-US,en;q=0.9",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          cookie: res.headers["set-cookie"].join("; "),
          Origin: "https://tikdown.org",
          Referer: "https://tikdown.org/id",
          "Referrer-Policy": "strict-origin-when-cross-origin",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
          "x-requested-with": "XMLHttpRequest",
        },
      }).then(({ data }) => {
        if (data.status) {
          const $ = cheerio.load(data.html);
          resolve({
            nowm: $("div.download-links > div:nth-child(1) > a").attr("href"),
            wm: $("div.download-links > div:nth-child(2) > a").attr("href"),
            audio: $("div.download-links > div:nth-child(3) > a").attr("href"),
          });
        } else {
          resolve({ status: false });
        }
      });
    }).catch((err) => reject(err));
  });
}

async function igdl(url) {
  return new Promise(async (resolve, reject) => {
    const base = "https://saveig.app/en";
    const config = {
      headers: {
        cookie: "_ga=GA1.1.1426404185.1685166160; _ga_NP3DK9VVFZ=GS1.1.1685166159.1.1.1685166183.0.0.0",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
      },
    };

    try {
      const res = await axios.get(base, config);
      const $ = cheerio.load(res.data);
      const token = $('input[name="token"]').attr("value");
      const form = {
        q: url,
        t: "media",
        lang: "en",
        token: token,
      };

      const { data } = await axios.post(`${base}/action.php`, qs.stringify(form), {
        headers: {
          ...config.headers,
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          origin: base,
          referer: base,
          "x-requested-with": "XMLHttpRequest",
        },
      });

      const ch = cheerio.load(data.data);
      const result = [];

      ch("div.download-box > a").each((i, el) => {
        const href = ch(el).attr("href");
        const type = ch(el).text().trim();
        if (href) {
          result.push({ url: href, type });
        }
      });

      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  tiktokdlv1,
  igdl,
};