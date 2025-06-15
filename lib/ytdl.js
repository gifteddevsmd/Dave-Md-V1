//                                         Ｖ：1.0                                                       //
//                                                                                                      //
//               ██████╗  █████╗ ██╗   ██╗███████╗    ███╗   ███╗██████╗                                 //              
//               ██╔══██╗██╔══██╗██║   ██║██╔════╝    ████╗ ████║██╔══██╗                                //
//               ██████╔╝███████║██║   ██║█████╗      ██╔████╔██║██║  ██║                                // 
//               ██╔═══╝ ██╔══██║╚██╗ ██╔╝██╔══╝      ██║╚██╔╝██║██║  ██║                                // 
//               ██║     ██║  ██║ ╚████╔╝ ███████╗    ██║ ╚═╝ ██║██████╔╝                                //
//               ╚═╝     ╚═╝  ╚═╝  ╚═══╝  ╚══════╝    ╚═╝     ╚═╝╚═════╝                                 //
//                                                                                                      //
//══════════════════════════════════════════════════════════════════════════════════════════════════════//
//*
//  * @project_name : Dave-Md-V1
//  * @author       : gifteddaves
//  * @contact      : https://wa.me/254104260236
//  * @github       : https://github.com/gifteddaves
//  * @telegram     : https://t.me/Digladoo
//  * @instagram    : https://www.instagram.com/_gifted_dave/profilecard/?igsh=MWFjZHdmcm4zMGkzNw==
//  * @description  : Dave-Md-V1 - Multi-functional WhatsApp User Bot.
//*
//  * Forked from: XLICON-V4-MD
//  * Credits to: DGXeon
//  * Modified & Maintained by: gifteddaves
//  * Free to use, but credit the author!
//  * WhatsApp Group: https://chat.whatsapp.com/CaPeB0sVRTrL3aG6asYeAC
//  * WhatsApp Channel: https://whatsapp.com/channel/0029VbApvFQ2Jl84lhONkc3k
//  * © 2025 Dave-Md-V1
// */

const ytdl = require('@distube/ytdl-core');
const yts = require('youtube-yts');
const ytMusic = require('node-youtube-music');
const ffmpeg = require('fluent-ffmpeg-7');
const NodeID3 = require('node-id3');
const { fetchBuffer } = require('./function');
const fs = require('fs');
const { randomBytes } = require('crypto');

const ytIdRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/;

class YT {
    static isYTUrl = (url) => ytIdRegex.test(url);

    static getVideoID = (url) => {
        if (!this.isYTUrl(url)) throw new Error('Not a valid YouTube URL');
        return ytIdRegex.exec(url)[1];
    }

    static WriteTags = async (filePath, metadata) => {
        NodeID3.write({
            title: metadata.Title,
            artist: metadata.Artist,
            album: metadata.Album,
            year: metadata.Year || '',
            image: {
                mime: 'jpeg',
                type: { id: 3, name: 'front cover' },
                imageBuffer: (await fetchBuffer(metadata.Image)).buffer,
                description: `Cover of ${metadata.Title}`
            }
        }, filePath);
    }

    static search = async (query, options = {}) => {
        const search = await yts.search({ query, hl: 'en', gl: 'US', ...options });
        return search.videos;
    }

    static searchTrack = async (query) => {
        const tracks = await ytMusic.searchMusics(query);
        return tracks.map(track => ({
            isYtMusic: true,
            title: `${track.title} - ${track.artists.map(x => x.name).join(' ')}`,
            artist: track.artists.map(x => x.name).join(' '),
            id: track.youtubeId,
            url: 'https://youtu.be/' + track.youtubeId,
            album: track.album,
            duration: {
                seconds: track.duration.totalSeconds,
                label: track.duration.label
            },
            image: track.thumbnailUrl.replace('w120-h120', 'w600-h600')
        }));
    }

    static downloadMusic = async (query) => {
        const trackList = Array.isArray(query) ? query : await this.searchTrack(query);
        const song = trackList[0];
        const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${song.id}`);
        const stream = ytdl(song.id, { filter: 'audioonly', quality: 140 });
        const filePath = `./DaveMdMedia/audio/${randomBytes(3).toString('hex')}.mp3`;

        const file = await new Promise((resolve, reject) => {
            ffmpeg(stream)
                .audioCodec('libmp3lame')
                .audioBitrate(128)
                .audioFrequency(44100)
                .audioChannels(2)
                .toFormat('mp3')
                .save(filePath)
                .on('end', () => resolve(filePath))
                .on('error', reject);
        });

        await this.WriteTags(file, {
            Title: song.title,
            Artist: song.artist,
            Image: song.image,
            Album: song.album,
            Year: info.videoDetails.publishDate.split('-')[0]
        });

        return {
            meta: song,
            path: file,
            size: fs.statSync(file).size
        };
    }

    static mp4 = async (input, quality = 134) => {
        const videoId = this.isYTUrl(input) ? this.getVideoID(input) : input;
        const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`);
        const format = ytdl.chooseFormat(info.formats, { format: quality, filter: 'videoandaudio' });

        return {
            title: info.videoDetails.title,
            thumb: info.videoDetails.thumbnails.slice(-1)[0],
            date: info.videoDetails.publishDate,
            duration: info.videoDetails.lengthSeconds,
            channel: info.videoDetails.ownerChannelName,
            quality: format.qualityLabel,
            contentLength: format.contentLength,
            description: info.videoDetails.description,
            videoUrl: format.url
        };
    }

    static mp3 = async (url, metadata = {}, autoWriteTags = false) => {
        const fullUrl = this.isYTUrl(url) ? `https://www.youtube.com/watch?v=${this.getVideoID(url)}` : url;
        const { videoDetails } = await ytdl.getInfo(fullUrl);
        const stream = ytdl(fullUrl, { filter: 'audioonly', quality: 140 });
        const filePath = `./DaveMdMedia/audio/${randomBytes(3).toString('hex')}.mp3`;

        const file = await new Promise((resolve, reject) => {
            ffmpeg(stream)
                .audioCodec('libmp3lame')
                .audioBitrate(128)
                .audioFrequency(44100)
                .audioChannels(2)
                .toFormat('mp3')
                .save(filePath)
                .on('end', () => resolve(filePath))
                .on('error', reject);
        });

        if (Object.keys(metadata).length !== 0) {
            await this.WriteTags(file, metadata);
        } else if (autoWriteTags) {
            await this.WriteTags(file, {
                Title: videoDetails.title,
                Artist: videoDetails.author.name,
                Album: videoDetails.author.name,
                Year: videoDetails.publishDate?.split('-')[0] || '',
                Image: videoDetails.thumbnails?.slice(-1)[0]?.url || ''
            });
        }

        return {
            meta: {
                title: videoDetails.title,
                channel: videoDetails.author.name,
                seconds: videoDetails.lengthSeconds,
                image: videoDetails.thumbnails?.slice(-1)[0]?.url
            },
            path: file,
            size: fs.statSync(file).size
        };
    }
}

module.exports = YT;
