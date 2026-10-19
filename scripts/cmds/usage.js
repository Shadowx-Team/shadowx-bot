const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');
let commandUsage = [];
const prefixes = {};
const unlistedCommands = ["eval", "usage", "restart", "spamkick", "cmd"];
const maxBarsToShow = 5;
try {
  commandUsage = JSON.parse(fs.readFileSync('usage.json', 'utf8'));
} catch (error) {
  console.error('Error loading command usage data:', error);
}
module.exports = {
  config: {
    name: "usage",
    version: "2.0",
    author: "Vex_Kshitiz",
    role: 0,
    shortDescription: { en: "Usage" },
    longDescription: { en: "Usage" },
    category: "utility",
    guide: { en: "{pn}" },
  },
  onStart: async function({ api, args, message, event }) {
    try {
      if (commandUsage.length === 0) return message.reply("No command usage data available.");
      commandUsage.sort((a, b) => b.usage - a.usage);
      const topCommands = commandUsage.slice(0, maxBarsToShow);
      const totalCommands = commandUsage.length;
      const canvasWidth = totalCommands <= maxBarsToShow ? totalCommands * 120 : maxBarsToShow * 120;
      const canvasHeight = 400;
      const canvas = createCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
      gradient.addColorStop(0, '#f6f8fa');
      gradient.addColorStop(1, '#dfe6e9');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.fillStyle = '#000'; 
      ctx.textAlign = 'center';
      ctx.font = 'bold 14px Arial';
      ctx.fillText("Commands", canvasWidth / 2 - 30, canvasHeight - 5);
      ctx.save(); 
      ctx.rotate(-Math.PI / 2); 
      ctx.fillText("Usage Count", -canvasHeight / 2, 20);
      ctx.restore(); 
      const numGridLines = 5; 
      const gridSpacing = (canvasHeight - 100) / numGridLines;
      ctx.strokeStyle = '#000'; 
      ctx.lineWidth = 1;
      for (let i = 1; i <= numGridLines; i++) {
        const y = canvasHeight - 50 - (gridSpacing * i);
        ctx.beginPath();
        ctx.moveTo(40, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
      }
      const barWidth = 50;
      const spacing = 20;
      let xPos = 50;
      const maxUsage = Math.max(...topCommands.map(cmd => cmd.usage));
      for (const cmd of topCommands) {
        const barHeight = (cmd.usage / maxUsage) * (canvasHeight - 100);
        const hue = Math.floor(Math.random() * 360);
        const gradientBar = ctx.createLinearGradient(xPos, canvasHeight - barHeight - 50, xPos + barWidth, canvasHeight);
        gradientBar.addColorStop(0, `hsl(${hue}, 70%, 50%)`);
        gradientBar.addColorStop(1, `hsl(${hue}, 50%, 70%)`);
        ctx.fillStyle = gradientBar;
        ctx.fillRect(xPos, canvasHeight - barHeight - 50, barWidth, barHeight);
        ctx.strokeStyle = '#34495e';
        ctx.lineWidth = 2;
        ctx.strokeRect(xPos, canvasHeight - barHeight - 50, barWidth, barHeight);
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(cmd.name, xPos + (barWidth / 2), canvasHeight - 30);
        ctx.fillText(cmd.usage, xPos + (barWidth / 2), canvasHeight - barHeight - 60);
        xPos += barWidth + spacing;
      }
      const buffer = canvas.toBuffer('image/png');
      const cacheFolderPath = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheFolderPath)) {
        fs.mkdirSync(cacheFolderPath);
      }
      const cachedImagePath = path.join(cacheFolderPath, 'usage_chart.png');
      fs.writeFileSync(cachedImagePath, buffer);
      message.reply({
        body: "",
        attachment: fs.createReadStream(cachedImagePath),
      });
    } catch (error) {
      message.reaction("❌", event.messageID);
      message.reply(error.message);
    }
  },
  onChat: async function({ event, message }) {
    const text = event.body;
    if (!text) return;
    let prefix = prefixes[event.threadID];
    if (!prefix) {
      prefix = await global.utils.getPrefix(event.threadID);
      prefixes[event.threadID] = prefix;
    }
    if (text.startsWith(prefix)) {
      const commandText = text.slice(prefix.length).split(" ")[0].toLowerCase();
      if (unlistedCommands.includes(commandText)) return;
      const existingCommandIndex = commandUsage.findIndex(cmd => cmd.name === commandText);
      if (existingCommandIndex !== -1) {
        commandUsage[existingCommandIndex].usage++;
      } else {
        commandUsage.push({ name: commandText, usage: 1 });
      }
      saveCommandUsage();
    }
  }
};
function saveCommandUsage() {
  fs.writeFile('usage.json', JSON.stringify(commandUsage, null, 2), err => {
    if (err) {
      console.error('Error saving command:', err);
    } else {
      console.log('saved successfully.');
    }
  });
}
