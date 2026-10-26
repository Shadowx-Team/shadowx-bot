const { exec } = require("child_process");

module.exports = {
  config: {
    name: "shell",
    aliases: ["sh"],
    version: "2.0",
    author: "Samir | Fahad Islam ",
    countDown: 5,
    role: 0,
    shortDescription: "Run terminal commands",
    longDescription: "Execute shell/terminal commands directly from the bot (owner only)",
    category: "owner",
    guide: "{pn} full guide dio"
  },

  onStart: async function ({ message, event, args }) {
    const authorized = ["100004924009085"]; 
    if (!authorized.includes(event.senderID)) {
      return message.reply("⛔ | Oops! Only my master can whisper commands into my system... 💻💋");
    }

    const command = args.join(" ");
    if (!command) {
      return message.reply("❗ | Please provide a shell command to execute, babe.");
    }

    message.reply(`🕰️ | Running your command, darling...`).then(() => {
      exec(command, (error, stdout, stderr) => {
        let output = "";

        if (error) output += `❌ | Error:\n${error.message}\n`;
        if (stderr) output += `⚠️ | Stderr:\n${stderr}\n`;
        if (stdout) output += `✅ | Output:\n${stdout}`;

        if (output.length > 1999) {
          message.reply("📦 | Output too long, sending as file...");
          const fs = require("fs");
          const path = __dirname + "/output.txt";
          fs.writeFileSync(path, output);
          message.reply({ body: "📄 Here's your result:", attachment: fs.createReadStream(path) }, () => {
            fs.unlinkSync(path);
          });
        } else {
          message.reply(output || "📭 | No output received.");
        }
      });
    });
  }
};