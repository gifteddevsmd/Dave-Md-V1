/**
   * Dave-Md-V1 WhatsApp Bot
   * Rebranded by Gifted Dave (https://wa.me/254104260236)
   * Original Base: XLICON Bot by ComradeAnas (comradeanasafa@gmail.com)
   * Github: https://github.com/gifteddaves/Dave-Md-V1
*/

const axios = require("axios");
const cheerio = require("cheerio");
const fetch = require("node-fetch");
const fs = require("fs");
const FormData = require("form-data");

// --- pinterest ---
async function pinterest(query) {
  try {
    const response = await axios.get(
      `https://pinterest.com/search/pins/?q=${encodeURIComponent(query)}`
    );
    const $ = cheerio.load(response.data);
    const data = [];
    $("img").each((_, el) => {
      const img = $(el).attr("src");
      if (img && img.startsWith("https://i.pinimg.com")) data.push(img);
    });
    return data;
  } catch (error) {
    return [];
  }
}

// --- wallpaper ---
async function wallpaper(query) {
  const response = await axios.get(
    `https://www.wallpaperflare.com/search?wallpaper=${encodeURIComponent(query)}`
  );
  const $ = cheerio.load(response.data);
  const result = [];
  $("ul.gallery > li > figure > a > img").each((_, el) => {
    result.push($(el).attr("data-src"));
  });
  return result;
}

// --- wikimedia ---
async function wikimedia(query) {
  const res = await axios.get(
    `https://commons.wikimedia.org/w/index.php?search=${query}&title=Special:MediaSearch&go=Go&type=image`
  );
  const $ = cheerio.load(res.data);
  const results = [];
  $(".sdms-search-result__media-container > img").each((_, el) => {
    results.push($(el).attr("src"));
  });
  return results;
}

// --- quotesAnime ---
async function quotesAnime() {
  try {
    const { data } = await axios.get("https://animechan.xyz/api/random");
    return `${data.quote}\n\n— ${data.character} (${data.anime})`;
  } catch {
    return "Anime quote not found.";
  }
}

// --- happymod ---
async function happymod(query) {
  const { data } = await axios.get(`https://www.happymod.com/search.html?q=${query}`);
  const $ = cheerio.load(data);
  const result = [];
  $(".pdt-app-box").each((_, el) => {
    result.push({
      title: $(el).find("h3").text(),
      icon: $(el).find("img").attr("data-src"),
      link: "https://www.happymod.com" + $(el).find("a").attr("href")
    });
  });
  return result;
}

// --- umma ---
async function umma(query) {
  const res = await axios.get(`https://umma.id/channel/search?q=${query}`);
  const $ = cheerio.load(res.data);
  const result = [];
  $(".video-thumb__item").each((_, el) => {
    result.push({
      title: $(el).find(".video-thumb__title").text().trim(),
      views: $(el).find(".video-thumb__meta").text().trim(),
      thumb: $(el).find("img").attr("src"),
      url: "https://umma.id" + $(el).find("a").attr("href")
    });
  });
  return result;
}

// --- ringtone ---
async function ringtone(query) {
  const res = await axios.get(`https://meloboom.com/en/search/${query}`);
  const $ = cheerio.load(res.data);
  const result = [];
  $(".content-item").each((_, el) => {
    result.push({
      title: $(el).find(".content-title").text(),
      audio: $(el).find("audio").attr("src")
    });
  });
  return result;
}

// --- styletext ---
async function styletext(text) {
  const res = await axios.get(`https://qaz.wtf/u/convert.cgi?text=${text}`);
  const $ = cheerio.load(res.data);
  const result = [];
  $("table > tbody > tr").each((_, el) => {
    result.push($(el).find("td:nth-child(2)").text().trim());
  });
  return result;
}

// --- githubstalk ---
async function githubstalk(username) {
  const { data } = await axios.get(`https://api.github.com/users/${username}`);
  return {
    username: data.login,
    name: data.name,
    bio: data.bio,
    public_repos: data.public_repos,
    followers: data.followers,
    following: data.following,
    avatar: data.avatar_url,
    url: data.html_url
  };
}

// --- mlstalk ---
async function mlstalk(id) {
  const { data } = await axios.get(`https://mobile-legends.fandom.com/wiki/${id}`);
  const $ = cheerio.load(data);
  return {
    name: $("h1").text().trim(),
    role: $(".pi-data-value[data-source='role']").text().trim(),
    specialty: $(".pi-data-value[data-source='specialty']").text().trim(),
    release: $(".pi-data-value[data-source='release_date']").text().trim(),
    image: $(".pi-image-thumbnail").attr("src")
  };
}

// --- ffstalk ---
async function ffstalk(id) {
  const res = await axios.get(`https://freefire.garena.com/en/player/${id}`);
  const $ = cheerio.load(res.data);
  return {
    id,
    name: $("title").text().trim(),
    image: $("img.profile-img").attr("src")
  };
}

// --- hentai ---
async function hentai(query) {
  const { data } = await axios.get(`https://hentaifox.com/search/?q=${query}`);
  const $ = cheerio.load(data);
  const result = [];
  $("div.thumb").each((_, el) => {
    result.push({
      title: $(el).find(".caption").text(),
      url: "https://hentaifox.com" + $(el).find("a").attr("href"),
      thumb: $(el).find("img").attr("data-src")
    });
  });
  return result;
}

// --- npmstalk ---
async function npmstalk(pkg) {
  const res = await axios.get(`https://registry.npmjs.org/${pkg}`);
  const data = res.data;
  return {
    name: data.name,
    version: data["dist-tags"].latest,
    description: data.description,
    author: data.author?.name || "unknown",
    license: data.license,
    homepage: data.homepage,
    repository: data.repository?.url,
    keywords: data.keywords
  };
}

// --- Export all functions ---
module.exports = {
  pinterest,
  wallpaper,
  wikimedia,
  quotesAnime,
  happymod,
  umma,
  ringtone,
  styletext,
  githubstalk,
  mlstalk,
  ffstalk,
  hentai,
  npmstalk
};