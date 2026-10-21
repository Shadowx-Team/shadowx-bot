const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
module.exports = {
  config: {
    name: "murgi2",
    version: "1.0",
    author: "NC-FAHAD",
    countDown: 5,
    role: 0,
    shortDescription: "Murgi funny",
    longDescription: "Funny murgi meme",
    category: "fun",
    guide: {
      en: "{p}{n} @mention / reply"
    }
  },
  onStart: async function ({ api, event, args }) {
    try {
      let targetID;
      if (Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
      } else if (event.messageReply) {
        targetID = event.messageReply.senderID;
      } else {
        return api.sendMessage("- কাকে মুরগি বানাবি মেনশন দে..!", event.threadID, event.messageID);
      }
      const targetAvatar = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
      const templatePath = path.join(cacheDir, "murgi_base.png");
      const imgUrl = "https://raw.githubusercontent.com/faahhdev12/cmdstore/refs/heads/main/Image/fun/murgi.jpeg";
      if (!fs.existsSync(templatePath)) {
        const res = await axios.get(imgUrl, { responseType: "arraybuffer" });
        fs.outputFileSync(templatePath, res.data);
      }
      const baseImg = await loadImage(templatePath);
      const targetImg = await loadImage(targetAvatar);
      const canvas = createCanvas(baseImg.width, baseImg.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);
      const targetX = canvas.width * 0.28;
      const targetY = canvas.height * 0.17;
      const targetSize = canvas.width * 0.18;
      ctx.save();
      ctx.beginPath();
      ctx.arc(targetX + targetSize / 2, targetY + targetSize / 2, targetSize / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(targetImg, targetX, targetY, targetSize, targetSize);
      ctx.restore();
      const outPath = path.join(cacheDir, `murgi_${targetID}.png`);
      fs.writeFileSync(outPath, canvas.toBuffer());
      api.sendMessage(
        { body: "- এই নে তোর মুরগি! 🐔", attachment: fs.createReadStream(outPath) },
        event.threadID,
        () => {
          if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
        },
        event.messageID
      );
    } catch (e) {
      console.error(e);
      return api.sendMessage("❌ Error generating murgi image.", event.threadID, event.messageID);
    }
  }
};
