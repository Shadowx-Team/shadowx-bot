const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const DAY_MS = 24 * 60 * 60 * 1000;
const EMOJI_DIR = path.join(__dirname, "cache", "emojis");
fs.ensureDirSync(EMOJI_DIR);
const emojiCacheMap = new Map();
const EMOJI_REGEX = /([\p{Extended_Pictographic}\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]\uFE0F?)/gu;
const boldText = (text) => {
  const fonts = {
    'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢', 'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳',
    'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
    '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗'
  };
  return text.split('').map(char => fonts[char] || char).join('');
};
function getEmojis(str) {
  if (!str) return [];
  const matches = str.match(EMOJI_REGEX);
  return matches ? [...new Set(matches)] : [];
}
async function preloadEmojis(textList) {
  const combined = textList.filter(Boolean).join(" ");
  const uniqueEmojis = getEmojis(combined);
  await Promise.all(uniqueEmojis.map(async (emoji) => {
    if (emojiCacheMap.has(emoji)) return;
    const hexCode = emoji.codePointAt(0).toString(16).toLowerCase();
    const localPath = path.join(EMOJI_DIR, `${hexCode}.png`);
    if (fs.existsSync(localPath)) {
      try {
        const cachedImg = await loadImage(localPath);
        emojiCacheMap.set(emoji, cachedImg);
        return;
      } catch (e) {}
    }
    const url = `https://raw.githubusercontent.com/shahadat20066/fb-emojis/master/png/${hexCode}.png`;
    try {
      const img = await loadImage(url);
      emojiCacheMap.set(emoji, img);
      try {
        if (typeof fetch !== "undefined") {
          const res = await fetch(url);
          if (res.ok) {
            const buf = Buffer.from(await res.arrayBuffer());
            fs.writeFileSync(localPath, buf);
          }
        }
      } catch (err) {}
    } catch (err) {
      emojiCacheMap.set(emoji, null);
    }
  }));
}
function measureTextWithEmoji(ctx, text, fontSize) {
  if (!text) return 0;
  const parts = text.split(EMOJI_REGEX);
  let totalWidth = 0;
  for (const part of parts) {
    if (!part) continue;
    if (EMOJI_REGEX.test(part) && emojiCacheMap.get(part)) {
      totalWidth += fontSize + 4;
    } else {
      totalWidth += ctx.measureText(part).width;
    }
  }
  return totalWidth;
}
function drawTextWithEmoji(ctx, text, x, y, fontSize, align = "left") {
  if (!text) return;
  const parts = text.split(EMOJI_REGEX);
  const totalWidth = measureTextWithEmoji(ctx, text, fontSize);
  let curX = x;
  if (align === "center") {
    curX = x - totalWidth / 2;
  } else if (align === "right") {
    curX = x - totalWidth;
  }
  const prevAlign = ctx.textAlign;
  const prevBaseline = ctx.textBaseline;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  for (const part of parts) {
    if (!part) continue;
    const isEmoji = EMOJI_REGEX.test(part);
    const img = isEmoji ? emojiCacheMap.get(part) : null;
    if (isEmoji && img) {
      ctx.drawImage(img, curX, y - fontSize / 2, fontSize, fontSize);
      curX += fontSize + 4;
    } else {
      ctx.fillText(part, curX, y);
      curX += ctx.measureText(part).width;
    }
  }
  ctx.textAlign = prevAlign;
  ctx.textBaseline = prevBaseline;
}
const TASKS_CONFIG = [
  { id: 1, title: "Chat 1 Message", sub: "Send 1 message in group", target: 1, reward: 20000, rewardTxt: "20K", type: "chat", tag: "CHAT" },
  { id: 2, title: "Chat 100 Messages", sub: "Send 100 messages in group", target: 100, reward: 200000, rewardTxt: "200K", type: "chat", tag: "CHAT" },
  { id: 3, title: "Guess Play", sub: "Play Guess 20 times", target: 20, reward: 1000000, rewardTxt: "1M", type: "guess", tag: "GAME" },
  { id: 4, title: "Mine Play", sub: "Play Mine 20 times", target: 20, reward: 1000000, rewardTxt: "1M", type: "mine", tag: "GAME" },
  { id: 5, title: "Waifu Play", sub: "Play Waifu 25 times", target: 25, reward: 2000000, rewardTxt: "2M", type: "waifu", tag: "GAME" },
  { id: 6, title: "Quiz Play", sub: "Play Quiz 25 times", target: 25, reward: 3000000, rewardTxt: "3M", type: "quiz", tag: "GAME" },
  { id: 7, title: "Aniqz Play", sub: "Play Aniqz 25 times", target: 25, reward: 2000000, rewardTxt: "2M", type: "aniqz", tag: "GAME" },
  { id: 8, title: "wheel", sub: "wheel 10 times", target: 10, reward: 1000000, rewardTxt: "1M", type: "wheel", tag: "GAME" },
  { id: 9, title: "Slot Play", sub: "Play Slot 25 times", target: 25, reward: 1000000, rewardTxt: "1M", type: "slot", tag: "GAME" },
  { id: 10, title: "Actor Play", sub: "Play Actor 10 times", target: 10, reward: 2000000, rewardTxt: "2M", type: "actor", tag: "GAME" },
  { id: 11, title: "Flag Game", sub: "Play Flag Game 25 times", target: 25, reward: 2000000, rewardTxt: "2M", type: "flag", tag: "GAME" },
  { id: 12, title: "Dice Play", sub: "Play Dice 25 times", target: 25, reward: 2000000, rewardTxt: "2M", type: "dice", tag: "GAME" },
  { id: 13, title: "Cartoon Play", sub: "Play Cartoon 25 times", target: 25, reward: 2000000, rewardTxt: "2M", type: "cartoon", tag: "GAME" },
  { id: 14, title: "Completionist", sub: "Claim all 14 daily missions", target: 14, reward: 5000000, rewardTxt: "5M", type: "completionist", tag: "SPECIAL" },
  { id: 15, title: "spin", sub: "Play spin 25 times", target: 25, reward: 2000000, rewardTxt: "2M", type: "spin", tag: "GAME" }
];
const FILE_CMDS = {
  "slot": "slot",
  "guess": "guess",
  "mine": "mine",
  "waifu": "waifu",
  "quiz": "quiz",
  "aniqz": "aniqz",
  "wheel": "wheel",
  "spin": "spin",
  "actor": "actor",
  "flag": "flag",
  "dice": "dice",
  "cartoon": "cartoon"
};
async function handleTaskProgress(event, usersData) {
  if (!event.senderID || !event.body) return;
  const uid = event.senderID;
  const body = event.body.trim().toLowerCase();
  const user = await usersData.get(uid);
  if (!user) return;
  const data = user.data || {};
  let taskData = data.taskData || { lastReset: Date.now(), progress: {}, claimed: {} };
  if (Date.now() - taskData.lastReset >= DAY_MS) {
    taskData = { lastReset: Date.now(), progress: {}, claimed: {} };
  }
  taskData.progress.chat = (taskData.progress.chat || 0) + 1;
  const cleanBody = body.replace(/^[^\w]+/, '');
  const firstWord = cleanBody.split(/\s+/)[0];
  if (FILE_CMDS[firstWord]) {
    const gameType = FILE_CMDS[firstWord];
    taskData.progress[gameType] = (taskData.progress[gameType] || 0) + 1;
  }
  await usersData.set(uid, { data: { ...data, taskData } });
}
module.exports = {
  config: {
    name: "task",
    version: "5.6",
    author: "ShadowX",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Daily tasks & rewards UI" },
    category: "economy",
    guide: {
      en: "{p}task\n{p}task claim <1-15>\n{p}task claim all"
    }
  },
  onChat: async function ({ event, usersData }) {
    await handleTaskProgress(event, usersData);
  },
  onStart: async function ({ event, args, usersData, threadsData, message }) {
    const { threadID, senderID } = event;
    const user = await usersData.get(senderID);
    const data = user.data || {};
    let taskData = data.taskData || { lastReset: Date.now(), progress: {}, claimed: {} };
    if (Date.now() - taskData.lastReset >= DAY_MS) {
      taskData = { lastReset: Date.now(), progress: {}, claimed: {} };
      await usersData.set(senderID, { data: { ...data, taskData } });
    }
    if (args[0] === "all" || (args[0] === "claim" && args[1] === "all")) {
      let totalReward = 0;
      let claimedCount = 0;
      for (const task of TASKS_CONFIG) {
        if (taskData.claimed[task.id]) continue;
        let prog = 0;
        if (task.id === 14) {
          prog = Object.keys(taskData.claimed).filter(k => k != "14").length;
        } else {
          prog = taskData.progress[task.type] || 0;
        }
        if (prog >= task.target) {
          taskData.claimed[task.id] = true;
          totalReward += task.reward;
          claimedCount++;
        }
      }
      if (claimedCount === 0) {
        return message.reply(`• ⚠️ ${boldText("No completed missions ready to claim right now!")}`);
      }
      const currentMoney = user.money || 0;
      await usersData.set(senderID, {
        money: currentMoney + totalReward,
        data: { ...data, taskData }
      });
      return message.reply(
        `🎉 ${boldText(`Claimed ${claimedCount} Missions Successfully!`)}\n\n` +
        `💰 ${boldText(`Total Earned: +$${totalReward.toLocaleString()}`)}\n` +
        `✅ ${boldText("Reward credited to your account balance!")}`
      );
    }
    if (args[0] === "claim" || (parseInt(args[0]) >= 1 && parseInt(args[0]) <= 15)) {
      const taskId = parseInt(args[0] === "claim" ? args[1] : args[0]);
      if (!taskId || taskId < 1 || taskId > 15) {
        return message.reply(`• ❌ ${boldText("Please specify a valid task number (1 - 15) or use 'task claim all'.")}`);
      }
      const task = TASKS_CONFIG.find(t => t.id === taskId);
      if (taskData.claimed[taskId]) {
        return message.reply(`• ⚠️ ${boldText("You have already claimed this mission!")}`);
      }
      let currentProgress = 0;
      if (task.id === 14) {
        currentProgress = Object.keys(taskData.claimed).filter(k => k != "14").length;
      } else {
        currentProgress = taskData.progress[task.type] || 0;
      }
      if (currentProgress < task.target) {
        return message.reply(
          `• ❌ ${boldText("Mission not completed yet!")}\n` +
          `📊 ${boldText("Progress:")} ${currentProgress}/${task.target}`
        );
      }
      const currentMoney = user.money || 0;
      taskData.claimed[taskId] = true;
      await usersData.set(senderID, {
        money: currentMoney + task.reward,
        data: { ...data, taskData }
      });
      return message.reply(
        `🎉 ${boldText(`Mission ${taskId} completed!`)}\n\n` +
        `💰 ${boldText(`Reward: +$${task.reward.toLocaleString()}`)}\n` +
        `✅ ${boldText("Reward credited to your account balance!")}`
      );
    }
    try {
      const rawUserName = (await usersData.getName(senderID)) || "Player";
      const threadInfo = await threadsData.get(threadID);
      const threadName = threadInfo.threadName || "Community Group";
      const userName = [...rawUserName].length > 18 ? [...rawUserName].slice(0, 16).join('') + "..." : rawUserName;
      const shortThread = [...threadName].length > 25 ? [...threadName].slice(0, 23).join('') + "..." : threadName;
      const timeLeftMs = Math.max(0, DAY_MS - (Date.now() - taskData.lastReset));
      const hoursLeft = Math.floor(timeLeftMs / (1000 * 60 * 60));
      const minsLeft = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
      const textsToPreload = [
        userName,
        shortThread,
        `⏳ RESETS: ${hoursLeft}h ${minsLeft}m`,
        "⚡ DAILY OPERATIONS & REWARDS",
        "CLAIMED ✔",
        "🛡️ Group: ",
        "💡 Tip: Use 'task claim all' to collect rewards"
      ];
      TASKS_CONFIG.forEach(t => { textsToPreload.push(t.title); textsToPreload.push(t.sub); });
      await preloadEmojis(textsToPreload);      
      const width = 1040;
      const height = 1440; 
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");      
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, "#080c15");
      bgGrad.addColorStop(0.4, "#0b1324");
      bgGrad.addColorStop(1, "#050811");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);      
      drawGlowCircle(ctx, 160, 100, 240, "rgba(56, 189, 248, 0.08)");
      drawGlowCircle(ctx, 880, 1280, 260, "rgba(168, 85, 247, 0.07)");      
      drawCard(ctx, 40, 40, 960, 140, 20, "rgba(17, 24, 39, 0.8)", "rgba(56, 189, 248, 0.25)", 1.2);
      try {
        const avatarUrl = await usersData.getAvatarUrl(senderID);
        const avatar = await loadImage(avatarUrl);
        ctx.save();
        ctx.beginPath();
        ctx.arc(115, 110, 46, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 69, 64, 92, 92);
        ctx.restore();
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(115, 110, 48, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "rgba(56, 189, 248, 0.3)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(115, 110, 53, 0, Math.PI * 2);
        ctx.stroke();
      } catch (e) {
        ctx.fillStyle = "#1e293b";
        ctx.beginPath();
        ctx.arc(115, 110, 46, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 28px 'Segoe UI', Roboto, sans-serif";
      drawTextWithEmoji(ctx, userName, 185, 95, 28, "left");      
      drawCard(ctx, 770, 65, 205, 34, 10, "rgba(30, 41, 59, 0.85)", "rgba(255, 255, 255, 0.1)");
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 13px 'Segoe UI', Roboto, sans-serif";
      drawTextWithEmoji(ctx, `⏳ RESETS: ${hoursLeft}h ${minsLeft}m`, 788, 82, 14, "left");      
      const completedCount = Object.keys(taskData.claimed).length;
      const overallPercent = Math.min(completedCount / 15, 1);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "14px 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(`Overall Missions Claimed: ${completedCount}/15`, 185, 126);      
      const topBarW = 380;
      drawCard(ctx, 185, 137, topBarW, 8, 4, "#131e31");
      if (overallPercent > 0) {
        const fillG = ctx.createLinearGradient(185, 0, 185 + topBarW * overallPercent, 0);
        fillG.addColorStop(0, "#06b6d4");
        fillG.addColorStop(1, "#3b82f6");
        drawCard(ctx, 185, 137, topBarW * overallPercent, 8, 4, fillG);
      }      
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 22px 'Segoe UI', Roboto, sans-serif";
      drawTextWithEmoji(ctx, "⚡ DAILY OPERATIONS & REWARDS", 45, 222, 22, "left");
      ctx.fillStyle = "#64748b";
      ctx.font = "14px 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("Complete tasks before midnight reset", 45, 244);      
      const startX = 40;
      const startY = 265;
      const cardW = 465;
      const cardH = 118;
      const gapX = 30;
      const gapY = 16;      
      for (let i = 0; i < TASKS_CONFIG.length; i++) {
        const task = TASKS_CONFIG[i];
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = startX + col * (cardW + gapX);
        const y = startY + row * (cardH + gapY);
        let prog = 0;
        if (task.id === 14) {
          prog = Object.keys(taskData.claimed).filter(k => k != "14").length;
        } else {
          prog = taskData.progress[task.type] || 0;
        }
        const isClaimed = !!taskData.claimed[task.id];
        const isReady = !isClaimed && prog >= task.target;
        let cardBg = "rgba(15, 23, 42, 0.75)";
        let borderColor = "rgba(255, 255, 255, 0.07)";
        if (isClaimed) {
          cardBg = "rgba(16, 36, 32, 0.55)";
          borderColor = "rgba(16, 185, 129, 0.35)";
        } else if (isReady) {
          cardBg = "rgba(35, 30, 20, 0.65)";
          borderColor = "rgba(245, 158, 11, 0.5)";
        }
        drawCard(ctx, x, y, cardW, cardH, 14, cardBg, borderColor, 1.2);        
        let tagColor = "#38bdf8";
        if (task.tag === "SPECIAL") tagColor = "#c084fc";
        if (task.tag === "CHAT") tagColor = "#34d399";        
        ctx.fillStyle = tagColor;
        ctx.font = "bold 11px 'Segoe UI', Roboto, sans-serif";
        ctx.fillText(`[${task.tag}]`, x + 16, y + 26);
        ctx.fillStyle = isClaimed ? "#94a3b8" : "#f8fafc";
        ctx.font = "bold 16px 'Segoe UI', Roboto, sans-serif";
        drawTextWithEmoji(ctx, `${task.id}. ${task.title}`, x + 72, y + 26, 16, "left");
        ctx.fillStyle = "#64748b";
        ctx.font = "12px 'Segoe UI', Roboto, sans-serif";
        ctx.fillText(task.sub, x + 16, y + 49);        
        const rWidth = 85;
        const rX = x + cardW - rWidth - 14;
        const rY = y + 14;
        drawCard(ctx, rX, rY, rWidth, 24, 7, "rgba(245, 158, 11, 0.12)", "rgba(245, 158, 11, 0.3)", 1);
        ctx.fillStyle = "#fbbf24";
        ctx.font = "bold 12px 'Segoe UI', Roboto, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`+${task.rewardTxt}`, rX + rWidth / 2, rY + 16);
        ctx.textAlign = "left";        
        const barX = x + 16;
        const barY = y + 78;
        const barW = cardW - 150;
        const barH = 7;
        drawCard(ctx, barX, barY, barW, barH, 4, "#172337");
        const percent = Math.min(prog / task.target, 1);
        if (percent > 0) {
          let progressGrad = ctx.createLinearGradient(barX, 0, barX + barW * percent, 0);
          if (isClaimed) {
            progressGrad.addColorStop(0, "#10b981");
            progressGrad.addColorStop(1, "#059669");
          } else if (isReady) {
            progressGrad.addColorStop(0, "#fbbf24");
            progressGrad.addColorStop(1, "#f59e0b");
          } else {
            progressGrad.addColorStop(0, "#0284c7");
            progressGrad.addColorStop(1, "#38bdf8");
          }
          drawCard(ctx, barX, barY, Math.max(8, barW * percent), barH, 4, progressGrad);
        }      
        const statusX = x + cardW - 120;
        const statusY = y + 68;
        if (isClaimed) {
          drawCard(ctx, statusX, statusY, 105, 27, 8, "rgba(16, 185, 129, 0.15)", "rgba(16, 185, 129, 0.4)", 1);
          ctx.fillStyle = "#34d399";
          ctx.font = "bold 11px 'Segoe UI', Roboto, sans-serif";
          drawTextWithEmoji(ctx, "CLAIMED ✔", statusX + 52, statusY + 13.5, 12, "center");
        } else if (isReady) {
          drawCard(ctx, statusX, statusY, 105, 27, 8, "#f59e0b");
          ctx.fillStyle = "#0f172a";
          ctx.font = "bold 11px 'Segoe UI', Roboto, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("CLAIM READY", statusX + 52, statusY + 18);
          ctx.textAlign = "left";
        } else {
          ctx.fillStyle = "#94a3b8";
          ctx.font = "bold 13px 'Segoe UI', Roboto, sans-serif";
          ctx.textAlign = "right";
          ctx.fillText(`${prog}/${task.target}`, x + cardW - 18, statusY + 18);
          ctx.textAlign = "left";
        }
      }      
      const footerY = 1360;
      drawCard(ctx, 40, footerY, 960, 54, 12, "rgba(15, 23, 42, 0.6)", "rgba(255, 255, 255, 0.05)", 1);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "13px 'Segoe UI', Roboto, sans-serif";
      drawTextWithEmoji(ctx, `🛡️ Group: ${shortThread}`, 60, footerY + 27, 14, "left");
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 13px 'Segoe UI', Roboto, sans-serif";
      drawTextWithEmoji(ctx, "💡 Tip: Use 'task claim all' to collect rewards", 980, footerY + 27, 14, "right");     
      const cacheDir = path.join(__dirname, "cache");
      fs.ensureDirSync(cacheDir);
      const cachePath = path.join(cacheDir, `task_${senderID}_${Date.now()}.png`);
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(cachePath, buffer);
      return message.reply({
        attachment: fs.createReadStream(cachePath)
      }, () => {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      });
    } catch (err) {
      console.error(err);
      return message.reply("• ❌ An error occurred while generating the daily mission board.");
    }
  }
};
function drawCard(ctx, x, y, width, height, radius, fillStyle, strokeStyle = null, lineWidth = 1) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arcTo(x + width, y, x + width, y + radius, radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
  ctx.lineTo(x + radius, y + height);
  ctx.arcTo(x, y + height, x, y + height - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }
  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
  ctx.restore();
}
function drawGlowCircle(ctx, x, y, radius, color) {
  ctx.save();
  const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
  grad.addColorStop(0, color);
  grad.addColorStop(1, "transparent");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
