const { findUid } = global.utils;
const regExCheckURL = /^(http|https):\/\/[^ "]+$/;
module.exports = {
	config: {
		name: "uid",
		version: "1.3",
		author: "NTKhang", // by Fahad Islam 
		countDown: 2,
		role: 0,
		description: {
			vi: "Chia sẻ contact thẻ bài chứa UID của người dùng",
			en: "Share contact card containing user's UID"
		},
		category: "box chat",
		guide: {
			vi: "   {pn}: dùng để gửi card id facebook của bạn"
				+ "\n   {pn} @tag: chia sẻ contact card của người được tag"
				+ "\n   {pn} <link profile>: chia sẻ contact card từ link profile"
				+ "\n   Phản hồi tin nhắn kèm lệnh để chia sẻ contact card của họ",
			en: "   {pn}: use to share your facebook contact card"
				+ "\n   {pn} @tag: share contact card of tagged people"
				+ "\n   {pn} <profile link>: share contact card from profile link"
				+ "\n   Reply to someone's message with the command to share their contact card"
		}
	},
	langs: {
		vi: {
			syntaxError: "Vui lòng tag người muốn xem uid hoặc để trống để xem uid của bản thân"
		},
		en: {
			syntaxError: "Please tag the person you want to view uid or leave it blank to view your own uid"
		}
	},
	onStart: async function ({ api, message, event, args, getLang }) {
		const { threadID, senderID, messageReply, mentions } = event;
		const sendContactCard = async (targetID) => {
			if (typeof api.shareContact === "function") {
				return api.shareContact(targetID, targetID, threadID);
			} else {
				return message.reply(targetID);
			}
		};
		if (messageReply) {
			return await sendContactCard(messageReply.senderID);
		}
		if (!args[0]) {
			return await sendContactCard(senderID);
		}
		if (args[0].match(regExCheckURL)) {
			for (const link of args) {
				try {
					const uid = await findUid(link);
					await sendContactCard(uid);
				} catch (e) {
					message.reply(`Error finding UID for ${link}: ${e.message}`);
				}
			}
			return;
		}
		const mentionKeys = Object.keys(mentions);
		if (mentionKeys.length > 0) {
			for (const id of mentionKeys) {
				await sendContactCard(id);
			}
			return;
		}
		return message.reply(getLang("syntaxError"));
	}
};
