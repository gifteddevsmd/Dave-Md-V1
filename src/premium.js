//══════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                                                                      //
//                                    𝗗𝗔𝗩𝗘-𝗠𝗗-𝗩𝟭  𝐁𝐎𝐓                                                  //
//                                                                                                      //
//                                         Ｖ：1.0                                                       //
//                                                                                                      //
//                                                                                                      //      
//               ██╗  ██╗██╗     ██╗ ██████╗ ██████╗ ███╗   ██╗      ██╗   ██╗██╗  ██╗                  //              
//                ██╗██╔╝██║     ██║██╔════╝██╔═══██╗████╗  ██║      ██║   ██║██║  ██║                  //
//                ╚███╔╝ ██║     ██║██║     ██║   ██║██╔██╗ ██║█████╗██║   ██║███████║                  // 
//                ██╔██╗ ██║     ██║██║     ██║   ██║██║╚██╗██║╚════╝╚██╗ ██╔╝╚════██║                  // 
//               ██╔╝ ██╗███████╗██║╚██████╗╚██████╔╝██║ ╚████║       ╚████╔╝      ██║                  //
//                ═╝  ╚═╝╚══════╝╚═╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝        ╚═══╝       ╚═╝                  // 
//                                                                                                      //
//                                                                                                      //
//══════════════════════════════════════════════════════════════════════════════════════════════════════//
//*
//  * @project_name : Dave-Md-V1
//  * @author : gifteddaves
//  * @github : https://github.com/gifteddaves
//  * @description : Premium user system for Dave-Md-V1 WhatsApp bot.
//*
//*
//base by DGXeon & SalmanYt
//rebrand by Gifted Dave
//Instagram: https://www.instagram.com/_gifted_dave
//Telegram: https://t.me/Digladoo
//WhatsApp: https://wa.me/254104260236
//© 2025 Dave-Md-V1
// */

// Premium User Handling
const fs = require('fs');
const toMs = require('ms');

const addPremiumUser = (userId, expired, _dir) => {
	const cekUser = _dir.find((user) => user.id == userId);
	if (cekUser) {
		cekUser.expired = cekUser.expired + toMs(expired);
	} else {
		const obj = { id: userId, expired: Date.now() + toMs(expired) };
		_dir.push(obj);
	}
	fs.writeFileSync('./database/premium.json', JSON.stringify(_dir));
};

const getPremiumPosition = (userId, _dir) => {
	let position = null;
	Object.keys(_dir).forEach((i) => {
		if (_dir[i].id === userId) {
			position = i;
		}
	});
	if (position !== null) return position;
};

const getPremiumExpired = (userId, _dir) => {
	let position = null;
	Object.keys(_dir).forEach((i) => {
		if (_dir[i].id === userId) {
			position = i;
		}
	});
	if (position !== null) return _dir[position].expired;
};

const checkPremiumUser = (userId, _dir) => {
	let status = false;
	Object.keys(_dir).forEach((i) => {
		if (_dir[i].id === userId) {
			status = true;
		}
	});
	return status;
};

const expiredCheck = (conn, _dir) => {
	setInterval(() => {
		let position = null;
		Object.keys(_dir).forEach((i) => {
			if (Date.now() >= _dir[i].expired) {
				position = i;
			}
		});
		if (position !== null) {
			idny = _dir[position].id;
			console.log(`Premium expired: ${_dir[position].id}`);
			_dir.splice(position, 1);
			fs.writeFileSync('./database/premium.json', JSON.stringify(_dir));
			idny ? conn.sendMessage(idny, { text: 'Premium Expired, Terima Kasih Sudah Berlangganan' }) : '';
			idny = false;
		}
	}, 1000);
};

const getAllPremiumUser = (_dir) => {
	const array = [];
	Object.keys(_dir).forEach((i) => {
		array.push(_dir[i].id);
	});
	return array;
};

module.exports = {
	addPremiumUser,
	getPremiumExpired,
	getPremiumPosition,
	expiredCheck,
	checkPremiumUser,
	getAllPremiumUser,
};