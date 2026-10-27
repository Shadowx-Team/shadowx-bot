module.exports = {
  config: {
    name: "fork",
    version: "2.0",
    author: "Mueid Mursalin Rifat",
    countDown: 5,
    role: 0,
    shortDescription: "Show github repository link ",
    category: "utility",
    guide: {
      en: "{p}fork"
    }
  },

  langs: {
    en: {
      current: `🌑 𝐒𝐇𝐀𝐃𝐎𝐖𝐗 𝐁𝐎𝐓 🌑
━━━━━━━━━━━━━━━━━━━━
👤 𝐎𝐰𝐧𝐞𝐫 : 𝐌𝐮𝐞𝐢𝐝 𝐌𝐮𝐫𝐬𝐚𝐥𝐢𝐧 𝐑𝐢𝐟𝐚𝐭
🔗 𝐑𝐞𝐩𝐨   : %1
💎 𝐒𝐭𝐚𝐭𝐮𝐬 : 𝐀𝐥𝐰𝐚𝐲𝐬 𝐔𝐩𝐝𝐚𝐭𝐢𝐧𝐠
━━━━━━━━━━━━━━━━━━━━
⭐ 𝐅𝐨𝐫𝐤 • 𝐒𝐭𝐚𝐫 • 𝐄𝐧𝐣𝐨𝐲 ⭐`
    }
  },

  onStart: async function ({ message, getLang }) {
    const link = "https://github.com/Shadowx-Team/shadowx-bot/";
    return message.reply(getLang("current", link));
  },

  onChat: async function ({ message, getLang, event }) {
    if (event.body && event.body.toLowerCase() === "fork") {
      const link = "https://github.com/Shadowx-Team/shadowx-bot/";
      return message.reply(getLang("current", link));
    }
  }
};
