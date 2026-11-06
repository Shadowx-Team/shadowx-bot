const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
module.exports = {
  config: {
    name: "jail",
    version: "1.0",
    author: "Fahad Islam",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Overlay user avatar onto the prisoner in jail"
    },
    longDescription: {
      en: "Tag a user or reply to someone's message to put their profile picture on the prisoner in jail meme."
    },
    category: "fun",
    guide: {
      en: "{p}jail @mention or reply to a message"
    }
  },
  onStart: async function ({ api, event }) {
    const { threadID, messageID, senderID, mentions, type, messageReply } = event;
    let targetID = senderID;
    if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (type === "message_reply" && messageReply) {
      targetID = messageReply.senderID;
    }
    const cachePath = path.join(__dirname, 'cache', `jail_${targetID}.png`);
    try {
      const baseImageUrl = "https://raw.githubusercontent.com/faahhdev12/cmdstore/refs/heads/main/Image/fun/jail.jpeg";
      const avatarUrl = `https://graph.facebook.com/${targetID}/picture?height=500&width=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const [baseImg, avatarImg] = await Promise.all([
        loadImage(baseImageUrl),
        loadImage(avatarUrl)
      ]);
      const canvas = createCanvas(baseImg.width, baseImg.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(baseImg, 0, 0, baseImg.width, baseImg.height);
      const circleX = baseImg.width * 0.463; 
      const circleY = baseImg.height * 0.482; 
      const radius = baseImg.width * 0.052;   
      ctx.save();
      ctx.beginPath();
      ctx.arc(circleX, circleY, radius, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(
        avatarImg, 
        circleX - radius, 
        circleY - radius, 
        radius * 2, 
        radius * 2
      );
      ctx.restore();
      await fs.ensureDir(path.join(__dirname, 'cache'));
      const buffer = canvas.toBuffer('image/png');
      await fs.writeFile(cachePath, buffer);
      await api.sendMessage(
        {
          attachment: fs.createReadStream(cachePath)
        },
        threadID,
        () => fs.unlinkSync(cachePath),
        messageID
      );
    } catch (error) {
      console.error(error);
      api.sendMessage("An error occurred while generating the jail meme image.", threadID, messageID);
    }
  }
};
