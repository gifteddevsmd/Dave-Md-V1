//══════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                                                                      //
//                                     𝗗𝗔𝗩𝗘-𝗠𝗗-𝗩𝟭 𝐁𝐎𝐓                                                  //
//                                                                                                      //
//                                  𝐌𝐀𝐍𝐆𝐀𝐃𝐄𝐗 𝐀𝐏𝐈 𝐔𝐓𝐈𝐋𝐈𝐓𝐘 𝐌𝐎𝐃𝐔𝐋𝐄                                     //
//                                                                                                      //
//   This module provides functionality to search for manga and fetch chapter images from MangaDex.     //
//                                                                                                      //
//   © 2025 Dave-Md-V1                                                                                  //
//   Developed by Gifted Dave | WhatsApp: https://wa.me/254104260236                                   //
//   GitHub: https://github.com/gifteddaves | Telegram: https://t.me/Digladoo                           //
//══════════════════════════════════════════════════════════════════════════════════════════════════════//

const axios = require('axios');
const PDFDocument = require('pdfkit');
const fs = require('fs');

const apiUrl = 'https://api.mangadex.org';

// Fetch chapter image URLs for a given chapterId
const fetchChapterPages = async (chapterId) => {
  try {
    const response = await axios.get(`${apiUrl}/at-home/server/${chapterId}`);
    const { baseUrl, chapter } = response.data;

    const pages = chapter.data.map((imageName, idx) => ({
      img: `${baseUrl}/data/${chapter.hash}/${imageName}`,
      page: idx + 1,
    }));

    return pages;
  } catch (err) {
    throw new Error('Error fetching chapter pages');
  }
};

// Search for manga by title with optional pagination
const searchManga = async (query, page = 1, limit = 20) => {
  if (page <= 0) throw new Error('Page number must be greater than 0');
  if (limit > 100) throw new Error('Limit must be less than or equal to 100');
  if (limit * (page - 1) >= 10000) throw new Error('Not enough results');

  try {
    const offset = limit * (page - 1);
    const response = await axios.get(`${apiUrl}/manga`, {
      params: {
        limit,
        title: query,
        offset,
        'order[relevance]': 'desc',
      },
    });

    const data = response.data;
    if (data.result !== 'ok') throw new Error(data.message);

    return data.data.map((manga) => {
      const coverArtRel = manga.relationships.find((rel) => rel.type === 'cover_art');
      const coverArtId = coverArtRel ? coverArtRel.id : null;
      return {
        id: manga.id,
        title: Object.values(manga.attributes.title)[0],
        altTitles: manga.attributes.altTitles,
        description: Object.values(manga.attributes.description)[0],
        status: manga.attributes.status,
        releaseDate: manga.attributes.year,
        contentRating: manga.attributes.contentRating,
        lastVolume: manga.attributes.lastVolume,
        lastChapter: manga.attributes.lastChapter,
        coverArtId,
      };
    });
  } catch (err) {
    throw new Error('Error searching for manga');
  }
};

module.exports = { fetchChapterPages, searchManga };