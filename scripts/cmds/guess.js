const fs = require("fs-extra");
const path = require("path");
const guessOptions = ["🐣", "🙂", "🍀", "🌸", "🌼", "🐟", "🍎", "🍪", "🦄", "🌈", "⭐", "🎮", "🎯", "🎲", "🎁", "💎", "⚡", "🔥", "✨", "🌟"];
const limit_hours = 12;
const plays = 50;
const chi_file = path.join(__dirname, "data", "guess_leaderboard.json");
if (!fs.existsSync(path.join(__dirname, "data"))) {
  fs.mkdirSync(path.join(__dirname, "data"), { recursive: true });
}
module.exports = {
  config: {
    name: "guess",
    version: "2.1",
    author: "XNil | NC-FAHAD",
    countDown: 5,
    role: 0,
    category: "game",
    shortDescription: {
      en: "Guess the emoji and win coins!"
    },
    longDescription: {
      en: "A fun guessing game where you bet coins and try to guess the correct emoji. Win 3x your bet!"
    },
    guide: {
      en: "{pn} <amount> - Play the guessing game\n{pn} top - View leaderboard\n{pn} stats - View your statistics\n{pn} rules - View game rules"
    }
  },
  onStart: async function ({ args, event, message, usersData, prefix }) {
    const senderID = event.senderID;
    const command = args[0]?.toLowerCase();
    if (command === "top" || command === "leaderboard") {
      try {
        let leaderboard = [];
        if (fs.existsSync(chi_file)) {
          leaderboard = JSON.parse(fs.readFileSync(chi_file, "utf8"));
        }
        if (leaderboard.length === 0) {
          return message.reply("🚫 No winners yet! Be the first to play!");
        }
        const topList = leaderboard
          .slice(0, 15)
          .map((entry, index) =>
            `${index + 1}. ${entry.name} - 🏆 ${entry.wins} wins | 💰 ${entry.totalWon} coins`
          ).join("\n");
        return message.reply(
          `🏆 GUESS GAME LEADERBOARD 🏆\n\n` +
          `${topList}\n\n` +
          `✨ Top players earn special rewards!`
        );
      } catch (error) {
        console.error("Error reading leaderboard:", error);
        return message.reply("❌ Error loading leaderboard. Please try again later.");
      }
    }
    if (command === "stats" || command === "stat") {
      const user = await usersData.get(senderID);
      const wins = user.data?.guessWin || 0;
      const gamesPlayed = (user.data?.guessPlayHistory?.length || 0);
      const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;
      const totalWon = user.data?.guessTotalWon || 0;
      return message.reply(
        `📊 YOUR GUESS GAME STATS 📊\n\n` +
        `🎮 Games Played: ${gamesPlayed}\n` +
        `🏆 Games Won: ${wins}\n` +
        `📈 Win Rate: ${winRate}%\n` +
        `💰 Total Coins Won: ${totalWon}\n` +
        `💵 Current Balance: ${user.money}`
      );
    }
    if (command === "rules" || command === "help") {
      return message.reply(
        `📖 GUESS GAME RULES 📖\n\n` +
        `1️⃣ Bet coins and guess the correct emoji\n` +
        `2️⃣ Three emojis will appear - pick 1, 2, or 3\n` +
        `3️⃣ Win: Get 3x your bet amount!\n` +
        `4️⃣ Lose: Lose your bet amount\n\n` +
        `🎯 Commands:\n` +
        `• ${prefix}guess <amount> - Play game\n` +
        `• ${prefix}guess top - View leaderboard\n` +
        `• ${prefix}guess stats - View your stats\n` +
        `• ${prefix}guess rules - View this help\n\n` +
        `⚠️ Limits: ${plays} games per ${limit_hours} hours\n` +
        `⏰ Time to guess: 30 seconds`
      );
    }
    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount <= 0) {
      return message.reply(
        `⚠️ Please enter a valid positive amount to bet.\n` +
        `Example: ${prefix}guess 100`
      );
    }
    if (amount < 10) {
      return message.reply("💰 Minimum bet is 10 coins!");
    }
    if (amount > 2000000000) {
      return message.reply("🚫 Maximum bet is 2,000,000,000 coins!");
    }
    const user = await usersData.get(senderID);
    if (user.money < amount) {
      return message.reply(
        `💸 You don't have enough money!\n` +
        `Your balance: ${user.money} coins\n` +
        `Bet amount: ${amount} coins`
      );
    }
    const now = Date.now();
    const intervalMs = limit_hours * 60 * 60 * 1000;
    let playHistory = user.data?.guessPlayHistory || [];
    playHistory = playHistory.filter(time => (now - time) <= intervalMs);
    if (playHistory.length >= plays) {
      const oldestPlay = Math.min(...playHistory);
      const nextReset = oldestPlay + intervalMs;
      const hoursLeft = Math.ceil((nextReset - now) / (1000 * 60 * 60));
      return message.reply(
        `⛔ You've reached the limit of ${plays} plays!\n\n` +
        `⏳ Next play available in: ~${hoursLeft} hour(s)`
      );
    }
    playHistory.push(now);
    await usersData.set(senderID, {
      money: user.money - amount,
      "data.guessPlayHistory": playHistory
    });
    const shuffledPool = [...guessOptions].sort(() => Math.random() - 0.5);
    const options = shuffledPool.slice(0, 3);
    const correctEmoji = options[Math.floor(Math.random() * 3)];
    const correctIndex = options.indexOf(correctEmoji) + 1;
    const remaining = plays - playHistory.length;
    const msg = await message.reply(
      `🎮 GUESS THE EMOJI 🎮\n\n` +
      `💰 Bet Amount: ${amount} coins\n` +
      `🎯 Prize Pool: ${amount * 3} coins\n\n` +
      `1️⃣ ${options[0]}    2️⃣ ${options[1]}    3️⃣ ${options[2]}\n\n` +
      `⏰ Reply with 1, 2, or 3 within 30 seconds!\n` +
      `📊 Games left: ${remaining}/${plays}`
    );
    const timeout = setTimeout(async () => {
      try {
        global.GoatBot.onReply.delete(msg.messageID);
        const currentUser = await usersData.get(senderID);
        const updatedHistory = (currentUser.data?.guessPlayHistory || []).filter(t => t !== now);
        await usersData.set(senderID, {
          money: currentUser.money + amount,
          "data.guessPlayHistory": updatedHistory
        });
        message.reply(`⌛ Time's up! You didn't reply in time. Your bet of ${amount} coins has been refunded.`);
      } catch (error) {
        console.error("Timeout error:", error);
      }
    }, 30 * 1000);
    global.GoatBot.onReply.set(msg.messageID, {
      commandName: this.config.name,
      author: senderID,
      correct: correctIndex,
      bet: amount,
      emoji: correctEmoji,
      options: options,
      messageID: msg.messageID,
      timeout,
      playTime: now
    });
  },
  onReply: async function ({ event, message, Reply, usersData }) {
    const senderID = event.senderID;
    const guessInput = event.body?.trim();
    if (senderID !== Reply.author) {
      return message.reply("❌ This game session is not yours!");
    }
    if (!["1", "2", "3"].includes(guessInput)) {
      return message.reply("⚠️ Please reply with only 1, 2, or 3.");
    }
    clearTimeout(Reply.timeout);
    global.GoatBot.onReply.delete(Reply.messageID);
    const user = await usersData.get(senderID);
    const guess = parseInt(guessInput);
    const isCorrect = guess === Reply.correct;
    const winAmount = Reply.bet * 3;
    let resultMessage = "";
    const updatePayload = {};
    if (isCorrect) {
      const newBalance = user.money + winAmount;
      const wins = (user.data?.guessWin || 0) + 1;
      const totalWon = (user.data?.guessTotalWon || 0) + winAmount;
      updatePayload.money = newBalance;
      updatePayload["data.guessWin"] = wins;
      updatePayload["data.guessTotalWon"] = totalWon;
      resultMessage =
        `✅ CORRECT! The emoji was ${Reply.emoji}\n\n` +
        `💰 You won: ${winAmount} coins!\n` +
        `💵 New balance: ${newBalance} coins\n` +
        `🎉 Congratulations!`;
      try {
        let leaderboard = [];
        if (fs.existsSync(chi_file)) {
          leaderboard = JSON.parse(fs.readFileSync(chi_file, "utf8"));
        }
        const userName = (await usersData.getName(senderID)) || "Unknown";
        const existingIndex = leaderboard.findIndex(entry => entry.id === senderID);
        if (existingIndex !== -1) {
          leaderboard[existingIndex].wins = wins;
          leaderboard[existingIndex].totalWon = totalWon;
          leaderboard[existingIndex].name = userName;
        } else {
          leaderboard.push({
            id: senderID,
            name: userName,
            wins: wins,
            totalWon: totalWon,
            lastWin: Date.now()
          });
        }
        leaderboard.sort((a, b) => {
          if (b.wins !== a.wins) return b.wins - a.wins;
          return b.totalWon - a.totalWon;
        });
        leaderboard = leaderboard.slice(0, 50);
        fs.writeFileSync(chi_file, JSON.stringify(leaderboard, null, 2));
      } catch (error) {
        console.error("Error updating leaderboard:", error);
      }
    } else {
      const losses = (user.data?.guessLoss || 0) + 1;
      updatePayload["data.guessLoss"] = losses;
      resultMessage =
        `❌ WRONG! Correct answer was option ${Reply.correct} (${Reply.emoji})\n\n` +
        `💸 You lost: ${Reply.bet} coins\n` +
        `💵 Current balance: ${user.money} coins\n\n` +
        `😢 Better luck next time!`;
    }
    await usersData.set(senderID, updatePayload);
    const now = Date.now();
    const intervalMs = limit_hours * 60 * 60 * 1000;
    const activeHistory = (user.data?.guessPlayHistory || []).filter(t => (now - t) <= intervalMs);
    const remaining = plays - activeHistory.length;
    const statsFooter =
      `\n\n📊 GAME STATS 📊\n` +
      `🎮 Plays used: ${activeHistory.length}/${plays}\n` +
      `🕹️ Remaining: ${remaining} game(s)`;
    return message.reply(`${resultMessage}${statsFooter}`);
  }
};
