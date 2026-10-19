const { getTime, drive } = global.utils;
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const moment = require("moment-timezone");
if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};
function getNumberSuffix(n) {
	if (n % 10 === 1 && n % 100 !== 11) return "ꜱᴛ";
	if (n % 10 === 2 && n % 100 !== 12) return "ɴᴅ";
	if (n % 10 === 3 && n % 100 !== 13) return "ʀᴅ";
	return "ᴛʜ";
}
async function getThreadInfoSafe(threadID, threadsData, api) {
	try {
		const data = await threadsData.get(threadID);
		if (data && data.threadName) return { threadName: data.threadName, participantIDs: data.members || [] };
		const info = await api.getThreadInfo(threadID);
		return info || { threadName: `ᴛʜʀᴇᴀᴅ ${threadID}`, participantIDs: [] };
	} catch {
		return { threadName: `ᴛʜʀᴇᴀᴅ ${threadID}`, participantIDs: [] };
	}
}
async function getUserNameSafe(userID, usersData, api) {
	try {
		let name = await usersData.getName(userID);
		if (name && name !== "ᴜɴᴋɴᴏᴡɴ") return name;
		const info = await api.getUserInfo(userID);
		return info?.[userID]?.name || `ᴜꜱᴇʀ ${userID}`;
	} catch {
		return `ᴜꜱᴇʀ ${userID}`;
	}
}
module.exports = {
	config: {
		name: "welcome",
		version: "7.1",
		author: "Fahad Islam & Modified by mueid mursalin Rifat ",
		category: "events"
	},
	langs: {
		en: {
			session1: "🌅 ᴍᴏʀɴɪɴɢ",
			session2: "☀️ ɴᴏᴏɴ",
			session3: "🌇 ᴀꜰᴛᴇʀɴᴏᴏɴ",
			session4: "🌙 ᴇᴠᴇɴɪɴɢ",
			welcomeMessage: "🤖 ʙᴏᴛ ɪɴɪᴛɪᴀʟɪᴢᴀᴛɪᴏɴ\n" +
				"├─ ꜱᴛᴀᴛᴜꜱ: ᴀᴄᴛɪᴠᴇ\n" +
				"├─ ᴘʀᴇꜰɪx: %1\n" +
				"└─ ᴄᴏᴍᴍᴀɴᴅ ʟɪꜱᴛ: %1ʜᴇʟᴘ",
			multiple1: "👤 ʏᴏᴜ",
			multiple2: "👥 ʏᴏᴜ ɢᴜʏꜱ"
		}
	},
	onStart: async ({ threadsData, message, event, api, getLang, usersData }) => {
		if (event.logMessageType !== "log:subscribe") return;
		const { threadID } = event;
		const prefix = global.utils.getPrefix(threadID);
		const dataAddedParticipants = event.logMessageData.addedParticipants;
		const botID = api.getCurrentUserID();
		const hours = getTime("HH");
		if (dataAddedParticipants.some(u => u.userFbId == botID)) {
			const { nickNameBot, threadApproval } = global.GoatBot.config;
			if (nickNameBot) api.changeNickname(nickNameBot, threadID, botID);
			try {
				if (threadApproval?.enable) {
					const isAutoApproved = threadApproval.autoApprovedThreads?.includes(threadID);
					if (isAutoApproved) {
						await threadsData.set(threadID, { approved: true });
						console.log(`✅ ᴀᴜᴛᴏ-ᴀᴘᴘʀᴏᴠᴇᴅ ᴛʜʀᴇᴀᴅ ${threadID}`);
						setTimeout(async () => {
							try { await api.sendMessage(getLang("welcomeMessage", prefix), threadID); } catch {};
						}, 2000);
						return;
					}
					await threadsData.set(threadID, { approved: false });
					if (threadApproval.adminNotificationThreads?.length && threadApproval.sendNotifications !== false) {
						setTimeout(async () => {
							const threadInfo = await getThreadInfoSafe(threadID, threadsData, api);
							const addedByName = event.author ? await getUserNameSafe(event.author, usersData, api) : "ᴜɴᴋɴᴏᴡɴ";
							const notifMsg = "🫠 ʙᴏᴛ ᴀᴅᴅᴇᴅ ᴛᴏ ɴᴇᴡ ᴛʜʀᴇᴀᴅ 🫠\n\n" +
								"📋 ᴛʜʀᴇᴀᴅ ɴᴀᴍᴇ: " + threadInfo.threadName + "\n" +
								"🆔 ᴛʜʀᴇᴀᴅ ɪᴅ: " + threadID + "\n" +
								"👤 ᴀᴅᴅᴇᴅ ʙʏ: " + addedByName + "\n" +
								"👥 ᴍᴇᴍʙᴇʀꜱ: " + (threadInfo.participantIDs?.length || 0) + "\n" +
								"⏰ ᴛɪᴍᴇ: " + new Date().toLocaleString() + "\n\n" +
								"⚠️ ᴛʜɪꜱ ᴛʜʀᴇᴀᴅ ɪꜱ ɴᴏᴛ ᴀᴘᴘʀᴏᴠᴇᴅ. ʙᴏᴛ ᴡɪʟʟ ɴᴏᴛ ʀᴇꜱᴘᴏɴᴅ ᴛᴏ ᴀɴʏ ᴄᴏᴍᴍᴀɴᴅꜱ.\n" +
								`ᴜꜱᴇ "${prefix}mthread" ᴛᴏ ᴍᴀɴᴀɢᴇ ᴀᴘᴘʀᴏᴠᴀʟꜱ.`;
							for (let i = 0; i < threadApproval.adminNotificationThreads.length; i++) {
								const notifyThreadID = threadApproval.adminNotificationThreads[i];
								try {
									if (i > 0) await new Promise(r => setTimeout(r, 1500));
									await api.sendMessage(notifMsg, notifyThreadID);
								} catch {};
							}
						}, 5000);
					}
					if (threadApproval.sendThreadMessage !== false) {
						setTimeout(async () => {
							try {
								await new Promise(r => setTimeout(r, 5000));
								const warningMsg = "⚠️ ᴛʜɪꜱ ᴛʜʀᴇᴀᴅ ɪꜱ ɴᴏᴛ ᴀᴘᴘʀᴏᴠᴇᴅ ʏᴇᴛ.\n" +
									"ʙᴏᴛ ᴡɪʟʟ ɴᴏᴛ ʀᴇꜱᴘᴏɴᴅ ᴛᴏ ᴄᴏᴍᴍᴀɴᴅꜱ ᴜɴᴛɪʟ ᴀᴘᴘʀᴏᴠᴇᴅ ʙʏ ᴀɴ ᴀᴅᴍɪɴ.\n\n" +
									`ᴜꜱᴇ "${prefix}help" ᴀꜰᴛᴇʀ ᴀᴘᴘʀᴏᴠᴀʟ.`;
								await api.sendMessage(warningMsg, threadID);
							} catch {};
						}, 10000);
					}
					return;
				}
			} catch {};
			setTimeout(async () => { try { await api.sendMessage(getLang("welcomeMessage", prefix), threadID); } catch {}; }, 2000);
			return;
		}
		if (!global.temp.welcomeEvent[threadID]) global.temp.welcomeEvent[threadID] = { joinTimeout: null, dataAddedParticipants: [] };
		global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
		clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);
		global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async () => {
			try {
				const threadData = await threadsData.get(threadID);
				if (threadData.settings.sendWelcomeMessage === false) return;
				const newUsers = global.temp.welcomeEvent[threadID].dataAddedParticipants;
				const dataBanned = threadData.data.banned_ban || [];
				const usersToWelcome = newUsers.filter(u => !dataBanned.some(b => b.id == u.userFbId));
				if (!usersToWelcome.length) return;
				const tmpDir = path.join(__dirname, "cache");
				await fs.ensureDir(tmpDir);
				const backgrounds = [
					"https://raw.githubusercontent.com/faahhdev12/cmdstore/refs/heads/main/Image/welcome/welcome.jpeg",
					"https://raw.githubusercontent.com/faahhdev12/cmdstore/refs/heads/main/Image/welcome/welcome2.jpeg",
					"https://raw.githubusercontent.com/faahhdev12/cmdstore/refs/heads/main/Image/welcome/welcome3.jpeg",
					"https://raw.githubusercontent.com/faahhdev12/cmdstore/refs/heads/main/Image/welcome/welcome4.jpeg",
					"https://raw.githubusercontent.com/faahhdev12/cmdstore/refs/heads/main/Image/welcome/welcome5.jpeg",
					"https://raw.githubusercontent.com/faahhdev12/cmdstore/refs/heads/main/Image/welcome/welcome6.jpeg",
					"https://raw.githubusercontent.com/faahhdev12/cmdstore/refs/heads/main/Image/welcome/welcome7.jpeg",
					"https://raw.githubusercontent.com/faahhdev12/cmdstore/refs/heads/main/Image/welcome/welcome8.jpeg",
					"https://raw.githubusercontent.com/faahhdev12/cmdstore/refs/heads/main/Image/welcome/welcome9.jpeg",
					"https://raw.githubusercontent.com/faahhdev12/cmdstore/refs/heads/main/Image/welcome/welcome10.jpeg",
					"https://raw.githubusercontent.com/faahhdev12/cmdstore/refs/heads/main/Image/welcome/welcome11.jpeg",
					"https://raw.githubusercontent.com/faahhdev12/cmdstore/refs/heads/main/Image/welcome/welcome.jpeg"
				];
				const avatarSize = 180;
				for (const user of usersToWelcome) {
					try {
						const avatarURL = `https://graph.facebook.com/${user.userFbId}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
						const avatarPath = path.join(tmpDir, `avt_${user.userFbId}.png`);
						const avatarRes = await axios.get(avatarURL, { responseType: "arraybuffer" });
						await fs.writeFile(avatarPath, Buffer.from(avatarRes.data));
						const bgURL = backgrounds[Math.floor(Math.random() * backgrounds.length)];
						const bgPath = path.join(tmpDir, `bg_${user.userFbId}.jpg`);
						const bgRes = await axios.get(bgURL, { responseType: "arraybuffer" });
						await fs.writeFile(bgPath, Buffer.from(bgRes.data));
						const avatar = await loadImage(avatarPath);
						const bg = await loadImage(bgPath);
						const W = 983, H = 480;
						const canvas = createCanvas(W, H);
						const ctx = canvas.getContext("2d");
						ctx.drawImage(bg, 0, 0, W, H);
						const ax = (W - avatarSize) / 2, ay = 40, r = avatarSize / 2;
						for (let i = 4; i >= 0; i--) {
							ctx.beginPath();
							ctx.arc(ax+r, ay+r, r+i*4, 0, Math.PI*2);
							const glow = ["#00ffff","#00ccff","#0099cc","#005577"][i]||"#fff";
							ctx.strokeStyle = glow;
							ctx.lineWidth = 2;
							ctx.shadowColor = glow;
							ctx.shadowBlur = 20+i*4;
							ctx.stroke();
						}
						ctx.save();
						ctx.beginPath();
						ctx.arc(ax+r, ay+r, r, 0, Math.PI*2);
						ctx.clip();
						ctx.drawImage(avatar, ax, ay, avatarSize, avatarSize);
						ctx.restore();
						ctx.textAlign = "center";
						ctx.font = "bold 42px Arial";
						ctx.fillStyle = "#00ffff";
						ctx.shadowColor = "#00ccff";
						ctx.shadowBlur = 25;
						ctx.fillText(`ʜᴇʟʟᴏ ${user.fullName}`, W/2, 280);
						ctx.font = "bold 34px Arial";
						ctx.fillStyle = "#ff99cc";
						ctx.shadowColor = "#cc6699";
						ctx.shadowBlur = 20;
						ctx.fillText(`ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ ${threadData.threadName}`, W/2, 330);
						const memberInfo = await api.getThreadInfo(threadID);
						ctx.font = "30px Arial";
						ctx.fillStyle = "#ffff99";
						ctx.shadowColor = "#cccc66";
						ctx.shadowBlur = 20;
						const memberCount = memberInfo.participantIDs.length;
						ctx.fillText(`ʏᴏᴜ'ʀᴇ ᴛʜᴇ ${memberCount}${getNumberSuffix(memberCount)} ᴍᴇᴍʙᴇʀ 🎉`, W/2, 375);
						ctx.font = "28px monospace";
						ctx.fillStyle = "#bbbbbb";
						ctx.shadowBlur = 0;
						ctx.fillText("━━━━━━━━━━━━━━━━", W/2, 415);
						const timeStr = moment().tz("Asia/Dhaka").format("");
						ctx.font = "20px Arial";
						ctx.fillStyle = "#aaaaaa";
						ctx.fillText(timeStr, W/2, 455);
						const outputPath = path.join(tmpDir, `welcome_card_${user.userFbId}.png`);
						await fs.writeFile(outputPath, canvas.toBuffer("image/png"));
						const welcomeMsg = "👋 ʜᴇʟʟᴏ " + user.fullName + "\n" +
							"🎀 ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ " + threadData.threadName + "\n" +
							"🎇 ʏᴏᴜ'ʀᴇ ᴛʜᴇ " + memberInfo.participantIDs.length + getNumberSuffix(memberInfo.participantIDs.length) + " ᴍᴇᴍʙᴇʀ 🎉\n" +
							"━━━━━━━━━━━━━━━━\n" +
							timeStr;
						await api.sendMessage({
							body: welcomeMsg,
							attachment: fs.createReadStream(outputPath),
							mentions: [{ tag: user.fullName, id: user.userFbId }]
						}, threadID);
						await fs.unlink(avatarPath);
						await fs.unlink(bgPath);
						setTimeout(() => fs.unlink(outputPath).catch(()=>{}), 60000);
					} catch (err) { console.error("❌ ᴡᴇʟᴄᴏᴍᴇ ᴄᴀʀᴅ ᴇʀʀᴏʀ:", err); }
				}
			} catch (err) { console.error("❌ ᴡᴇʟᴄᴏᴍᴇ ᴇᴠᴇɴᴛ ᴇʀʀᴏʀ:", err); }
			delete global.temp.welcomeEvent[threadID];
		}, 1500);
	}
};
