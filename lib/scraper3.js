const cheerio = require('cheerio');
const fetch = require('node-fetch');
const axios = require('axios');

// Fungsi download dari sekaikomik
async function sekaikomikDl(url) {
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);
  const scripts = $('script')
    .toArray()
    .map(el => $(el).html());
  const filtered = scripts.find(s => s.includes('wp-content'));
  const data = eval(filtered.split('JSON.parse(')[1].split(')]')[0]);
  return data.map(link => encodeURI(link));
}

// Fungsi download dari Facebook via fdownloader
async function facebookDl(url) {
  const getToken = await fetch('https://fdownloader.net/');
  const $ = cheerio.load(await getToken.text());
  const token = $('input[name="__RequestVerificationToken"]').attr('value');
  const cookie = getToken.headers.get('set-cookie');

  const form = new URLSearchParams({ __RequestVerificationToken: token, q: url });
  const res = await fetch('https://fdownloader.net/api/ajaxSearch', {
    method: 'POST',
    headers: {
      cookie,
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      referer: 'https://fdownloader.net/',
    },
    body: form
  });

  const json = await res.json();
  const html = cheerio.load(json.data);
  const result = {};
  html('.button.is-success.download-link-fb').each((i, el) => {
    const link = html(el).attr('href');
    const label = html(el).text().trim();
    if (link) result[label] = link;
  });

  return result;
}

// Fungsi stalk TikTok
async function tiktokStalk(user) {
  const res = await axios.get(`https://urlebird.com/user/${user}/`);
  const $ = cheerio.load(res.data);
  return {
    pp_user: $('div.user__img').attr('src'),
    nama: $('div.user__title > a > h1').text().trim(),
    bio: $('div.content > h5').text().trim(),
    pengikut: $('span.followers').text().split(' ')[1],
    mengikuti: $('span.following').text().split(' ')[1],
  };
}

// Fungsi stalk Instagram dari Dumpor
async function igStalk(username) {
  username = username.replace('@', '');
  const res = await fetch(`https://dumpor.com/v/${username}`);
  const $ = cheerio.load(await res.text());

  const nama = $('meta[property="og:title"]').attr('content');
  const desc = $('div.user__info-desc').text().trim();
  const img = $('div[class="col-auto d-none d-sm-block text-truncate"] img').attr('src');

  const stats = $('ul.list > li').map((i, el) => $(el).text()).get();
  const post = parseInt(stats[0]?.replace(/\D/g, ''));
  const followers = parseInt(stats[1]?.replace(/\D/g, ''));
  const following = parseInt(stats[2]?.replace(/\D/g, ''));

  return {
    nama,
    username,
    bio: desc,
    post,
    followers,
    following,
    foto_profil: img,
  };
}

// Fungsi download video dari xnxx
async function xnxxdl(url) {
  try {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);
    const script = $('script:contains("html5player.setVideoUrlLow")').html();

    return {
      low: script.match(/setVideoUrlLow'(.*?)'/)?.[1],
      high: script.match(/setVideoUrlHigh'(.*?)'/)?.[1],
      hls: script.match(/setVideoHLS'(.*?)'/)?.[1],
    };
  } catch (err) {
    console.error(err);
    return null;
  }
}

// Fungsi cari video di xnxx
async function xnxxSearch(query) {
  const page = Math.floor(Math.random() * 3 + 1);
  const res = await fetch(`https://www.xnxx.com/search/${query}/${page}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const hasil = [];

  $('div.thumb-under').each((i, el) => {
    const judul = $(el).find('p.title a').attr('title');
    const link = 'https://www.xnxx.com' + $(el).find('p.title a').attr('href');
    hasil.push({ title: judul, link });
  });

  return hasil;
}

// Fungsi ChatGPT via proxy
async function ChatGpt(prompt, systemMessage = '') {
  const response = await fetch('https://chatapicn.a3r.fun/api/chat-process', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Referer: 'https://chatapicn.a3r.fun/',
    },
    body: JSON.stringify({
      prompt,
      systemMessage,
      temperature: 0.8,
      top_p: 1,
      presence_penalty: 1,
      frequency_penalty: 1,
      roomId: 1002,
      uuid: +new Date(),
    }),
  });

  const text = await response.text();
  return JSON.parse(text.trim().split('\n').pop());
}

// Fungsi cari video di Xvideos
async function xvideosSearch(query) {
  const page = Math.floor(Math.random() * 9 + 1);
  const res = await axios.get(`https://www.xvideos.com/?k=${query}&p=${page}`);
  const $ = cheerio.load(res.data);
  const hasil = [];

  $('div.thumb-under').each((i, el) => {
    const title = $(el).find('.title a').text();
    const duration = $(el).find('span.duration').text();
    const link = 'https://www.xvideos.com' + $(el).find('a').attr('href');
    const thumb = $(el).parent().find('img').attr('src');
    hasil.push({ title, duration, link, thumb });
  });

  return hasil;
}

// Fungsi download metadata dari Xvideos
async function xvideosdl(url) {
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  return {
    title: $('h1').text().trim(),
    videoUrl: $('video source').attr('src'),
    keywords: $('meta[name="keywords"]').attr('content'),
    views: $('div.views').text().trim(),
    likes: $('span.rating-good-nbr').text().trim(),
    dislikes: $('span.rating-bad-nbr').text().trim(),
    thumb: $('meta[property="og:image"]').attr('content'),
  };
}

module.exports = {
  sekaikomikDl,
  facebookDl,
  tiktokStalk,
  igStalk,
  xnxxdl,
  xnxxSearch,
  ChatGpt,
  xvideosSearch,
  xvideosdl,
};