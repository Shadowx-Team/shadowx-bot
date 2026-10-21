const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
module.exports = {
  config: {
    name: "reject",
    version: "1.0.5",
    author: "Fahad Islam",
    countDown: 5,
    role: 0,
    shortDescription: "i reject you",
    longDescription: "Same-gender (male x male or female x female) is strictly not allowed.",
    category: "love",
    guide: {
      en: "{p}reject [@tag optional]"
    }
  },
  onStart: async function ({ api, event, args, usersData }) {
    const { threadID, messageID, senderID, mentions } = event;
    const resolveGender = async (userID) => {
      try {
        const uData = await usersData.get(userID);
        let g = uData?.gender;
        if (g === 1 || String(g).toUpperCase() === "FEMALE" || String(g) === "1") return "FEMALE";
        if (g === 2 || String(g).toUpperCase() === "MALE" || String(g) === "2") return "MALE";
        const info = await api.getUserInfo(userID);
        if (info && info[userID]) {
          const apiGender = info[userID].gender;
          if (apiGender === 1 || String(apiGender).toUpperCase() === "FEMALE") return "FEMALE";
          if (apiGender === 2 || String(apiGender).toUpperCase() === "MALE") return "MALE";
        }
      } catch (e) {
        console.error("Gender fetch error:", e);
      }
      return "UNKNOWN";
    };
    const fetchAvatar = async (userID) => {
      const token = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";
      const urls = [
        `https://graph.facebook.com/${userID}/picture?height=500&width=500&access_token=${token}`,
        `https://graph.facebook.com/${userID}/picture?type=large`,
        `https://unavatar.io/facebook/${userID}`
      ];
      for (const url of urls) {
        try {
          const res = await axios.get(url, {
            responseType: "arraybuffer",
            timeout: 6000,
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
          });
          return await loadImage(Buffer.from(res.data, "binary"));
        } catch (e) {
          continue;
        }
      }
      const fallbackRes = await axios.get("https://i.imgur.com/6E294T4.png", { responseType: "arraybuffer" });
      return await loadImage(Buffer.from(fallbackRes.data, "binary"));
    };
    const fetchBg = async (url) => {
      const res = await axios.get(url, { responseType: "arraybuffer", timeout: 10000 });
      return await loadImage(Buffer.from(res.data, "binary"));
    };
    try {
      const mentionedIDs = Object.keys(mentions || {});
      let targetID = null;
      if (mentionedIDs.length > 0) {
        targetID = mentionedIDs[0];
      } else {
        return api.sendMessage("⚠️ Please tag a user to use this command! \nExample: reject @user", threadID, messageID);
      }
      if (senderID === targetID) {
        return api.sendMessage("❌ You cannot use this command on yourself!", threadID, messageID);
      }
      const senderGender = await resolveGender(senderID);
      const targetGender = await resolveGender(targetID);
      if (
        (senderGender === "MALE" && targetGender === "MALE") ||
        (senderGender === "FEMALE" && targetGender === "FEMALE")
      ) {
        return api.sendMessage(
          "❌ Same-gender pairing is strictly NOT allowed!\n\n• Only Female × Male is allowed.",
          threadID,
          messageID
        );
      }
      let femaleID = null;
      let maleID = null;
      if (senderGender === "FEMALE" && targetGender === "MALE") {
        femaleID = senderID;
        maleID = targetID;
      } else if (senderGender === "MALE" && targetGender === "FEMALE") {
        femaleID = targetID;
        maleID = senderID;
      } else {
        return api.sendMessage(
          "❌ Command blocked! Male × Male and Female × Female are not allowed. Please make sure both profiles have public gender settings on Facebook.",
          threadID,
          messageID
        );
      }
      const bgImgUrl = "https://raw.githubusercontent.com/faahhdev12/cmdstore/refs/heads/main/Image/love/reject.jpeg";
      const [bgImg, femaleAvatar, maleAvatar] = await Promise.all([
        fetchBg(bgImgUrl),
        fetchAvatar(femaleID),
        fetchAvatar(maleID)
      ]);
      const canvas = createCanvas(bgImg.width, bgImg.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
      const drawCircularAvatar = (img, x, y, radius) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, x - radius, y - radius, radius * 2, radius * 2);
        ctx.restore();
      };
      const scaleX = canvas.width / 720;
      const scaleY = canvas.height / 720;
      drawCircularAvatar(femaleAvatar, 188 * scaleX, 246 * scaleY, 45 * scaleX);
      drawCircularAvatar(maleAvatar, 638 * scaleX, 296 * scaleY, 38 * scaleX);
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const cachePath = path.join(cacheDir, `reject_${Date.now()}.png`);
      const buffer = canvas.toBuffer("image/png");
      await fs.writeFile(cachePath, buffer);
      const femaleData = await usersData.get(femaleID);
      const maleData = await usersData.get(maleID);
      const femaleName = femaleData?.name || "Female";
      const maleName = maleData?.name || "Male";
      return api.sendMessage(
        {
          body: `💔 ${femaleName}🖕 i reject you ${maleName} `,
          attachment: fs.createReadStream(cachePath)
        },
        threadID,
        () => {
          if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
        },
        messageID
      );
    } catch (err) {
      console.error("reject Command Error:", err);
      return api.sendMessage(
        `❌ Error: ${err.message || "Failed to process image"}`,
        threadID,
        messageID
      );
    }
  }
};
