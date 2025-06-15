//══════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                                                                      //
//                                     𝗗𝗔𝗩𝗘-𝗠𝗗-𝗩𝟭  𝐁𝐎𝐓                                                  //
//                                                                                                      //
//                                          Ｖ：1.0                                                      //
//                                                                                                      //
//               ██╗  ██╗██╗     ██╗ ██████╗ ██████╗ ███╗   ██╗      ██╗   ██╗██╗  ██╗                  //
//                ██╗██╔╝██║     ██║██╔════╝██╔═══██╗████╗  ██║      ██║   ██║██║  ██║                  //
//                ╚███╔╝ ██║     ██║██║     ██║   ██║██╔██╗ ██║█████╗██║   ██║███████║                  //
//                ██╔██╗ ██║     ██║██║     ██║   ██║██║╚██╗██║╚════╝╚██╗ ██╔╝╚════██║                  //
//               ██╔╝ ██╗███████╗██║╚██████╗╚██████╔╝██║ ╚████║       ╚████╔╝      ██║                  //
//                ═╝  ╚═╝╚══════╝╚═╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝        ╚═══╝       ╚═╝                  //
//                                                                                                      //
//══════════════════════════════════════════════════════════════════════════════════════════════════════//
//
//  @project_name : Dave-Md-V1
//  @author       : gifteddaves
//  @github       : https://github.com/gifteddaves
//  @whatsapp     : https://wa.me/254104260236
//  @description  : Multi-functional WhatsApp User Bot - Mongo & JSON database handler.
//
//  @based_on     : XLICON database logic by salmanytofficial
//

require('../settings');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const mongoose = require('mongoose');

let DataBase;

if (/mongo/.test(global.tempatDB)) {
	DataBase = class MongoDB {
		constructor(url, options = { useNewUrlParser: true, useUnifiedTopology: true }) {
			this.url = url;
			this.data = {};
			this._model = {};
			this.options = options;
		}

		read = async () => {
			await mongoose.connect(this.url, this.options);
			this.connection = mongoose.connection;
			try {
				const schema = new mongoose.Schema({
					data: {
						type: Object,
						required: true,
						default: {},
					}
				});
				this._model = mongoose.model('data', schema);
			} catch {
				this._model = mongoose.model('data');
			}
			this.data = await this._model.findOne({});
			if (!this.data) {
				await new this._model({ data: {} }).save();
				this.data = await this._model.findOne({});
			}
			return this?.data?.data || this?.data;
		}

		write = async (data) => {
			if (this.data && !this.data.data) return new this._model({ data }).save();
			this._model.findById(this.data._id, (err, docs) => {
				if (!err && docs) {
					docs.data = data;
					return docs.save();
				}
			});
		}
	};
} else if (/json/.test(global.tempatDB)) {
	DataBase = class JSONDB {
		constructor() {
			this.data = {};
			this.file = path.join(process.cwd(), 'database', global.tempatDB);
		}

		read = async () => {
			if (fs.existsSync(this.file)) {
				this.data = JSON.parse(fs.readFileSync(this.file));
			} else {
				this.data = {};
				fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2));
			}
			return this.data;
		};

		write = async (data) => {
			this.data = !!data ? data : global.db;
			const dirname = path.dirname(this.file);
			if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, { recursive: true });
			fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2));
			return this.file;
		};
	};
}

module.exports = DataBase;

// Live reload on changes
let file = require.resolve(__filename);
fs.watchFile(file, () => {
	fs.unwatchFile(file);
	console.log(chalk.redBright(`Updated ${__filename}`));
	delete require.cache[file];
	require(file);
});
