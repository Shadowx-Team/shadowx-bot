const limit_hours = 12;
const plays = 40;
const bet = 10_000_000;
const min_bet = 1000;
const segments = [
  { label: "JACKPOT", multiplier: 25, probability: 0.015, type: "jackpot", emoji: "🏆", color: "🟨" },
  { label: "DIAMOND", multiplier: 10, probability: 0.025, type: "premium", emoji: "💎", color: "🟦" },
  { label: "MEGA WIN", multiplier: 7, probability: 0.04, type: "big", emoji: "🔥", color: "🟧" },
  { label: "GOLD", multiplier: 5, probability: 0.06, type: "medium", emoji: "⭐", color: "🟨" },
  { label: "SILVER", multiplier: 3, probability: 0.10, type: "small", emoji: "💰", color: "⬜" },
  { label: "BRONZE", multiplier: 2, probability: 0.15, type: "tiny", emoji: "🔔", color: "🟫" },
  { label: "LUCKY", multiplier: 1.5, probability: 0.20, type: "mini", emoji: "🍀", color: "🟩" },
  { label: "BREAK EVEN", multiplier: 1, probability: 0.15, type: "even", emoji: "➖", color: "⬛" },
  { label: "HALF LOSS", multiplier: 0.5, probability: 0.10, type: "loss", emoji: "😢", color: "🟥" },
  { label: "TOTAL LOSS", multiplier: 0, probability: 0.08, type: "loss", emoji: "💸", color: "🟥" },
  { label: "BANKRUPT", multiplier: 0, probability: 0.03, type: "bankrupt", emoji: "⚡", color: "🟪", fee: 0.15 }
];
const SPECIAL_EVENTS = [
  { name: "DOUBLE TROUBLE", trigger: 0.025, effect: (m) => m * 2 },
  { name: "TRIPLE THREAT", trigger: 0.008, effect: (m) => m * 3 },
  { name: "LUCKY CLOVER", trigger: 0.035, effect: (m) => m + 0.5 },
  { name: "GOLDEN SPIN", trigger: 0.015, effect: (m) => m * 1.5 }
];
module.exports = {
  config: {
    name: "wheel",
    version: "6.0",
    author: "NC-XNIL | NC-FAHAD",
    shortDescription: "🎡 Wheel of Fortune",
    longDescription: "Spin the wheel with progressive jackpots, special multiplier events, and exciting rewards!",
    category: "game",
    guide: {
      en: "{p}wheel <bet> | {p}wheel info | {p}wheel stats | {p}wheel leaderboard | {p}wheel jackpot"
    }
  },
  onStart: async function ({ api, event, args, usersData, commandName }) {
    const { senderID, threadID, messageID } = event;
    const subCommand = args[0]?.toLowerCase();
    const user = await usersData.get(senderID);
    if (!user) return;
    const userStats = user.data?.wheelStats || {
      totalSpins: 0,
      totalWon: 0,
      totalWagered: 0,
      biggestWin: 0,
      currentStreak: 0,
      highestStreak: 0,
      jackpotsWon: 0,
      lastSpins: []
    };
    if (subCommand === "info") {
      const infoMsg = `
🎡 ━━━━━━━━━━━━━━━━━━━━━ 🎡
      WHEEL OF FORTUNE
🎡 ━━━━━━━━━━━━━━━━━━━━━ 🎡

💰 Bet Range: ${bet.toLocaleString()} -${bet.toLocaleString()}
🎯 Max Limit: ${plays} spins every${limit_hours} hours

━━━━━━ WHEEL SEGMENTS ━━━━━━
${segments.map(s => `• ${s.emoji} ${s.label.padEnd(12)} x${s.multiplier} (${(s.probability * 100).toFixed(1)}%)`).join("\n")}

━━━━━━ COMMANDS ━━━━━━
• ${commandName} <amount>   - Spin the wheel
• ${commandName} info       - Show command details
• ${commandName} stats      - Your personal statistics
• ${commandName} leaderboard - Top fortune spinners
• ${commandName} jackpot    - Progressive jackpot status
`.trim();
      return api.sendMessage(infoMsg, threadID, messageID);
    }
    if (subCommand === "stats") {
      const winRate = userStats.totalSpins > 0 
        ? ((userStats.totalWon / (userStats.totalWagered || 1)) * 100).toFixed(2)
        : "0.00";

      const statsMsg = `
📊 ━━━━━━ YOUR WHEEL STATS ━━━━━━ 📊

🎡 Total Spins: ${userStats.totalSpins.toLocaleString()}
💰 Total Won: ${userStats.totalWon.toLocaleString()}
🎯 Total Wagered: ${(userStats.totalWagered || 0).toLocaleString()}
📈 Return Rate: ${winRate}%
🏆 Biggest Win: ${userStats.biggestWin.toLocaleString()}
🔥 Current Streak: ${userStats.currentStreak}
⚡ Highest Streak: ${userStats.highestStreak}
🎰 Jackpots Won: ${userStats.jackpotsWon || 0}
`.trim();
      return api.sendMessage(statsMsg, threadID, messageID);
    }
    if (subCommand === "leaderboard" || subCommand === "top") {
      const allUsers = await usersData.getAll();
      const leaderboardData = allUsers
        .filter(u => u.data?.wheelStats?.totalSpins > 0)
        .map(u => {
          const stats = u.data.wheelStats;
          const netProfit = (stats.totalWon || 0) - (stats.totalWagered || 0);
          return {
            name: u.name || "Anonymous",
            netProfit,
            totalWon: stats.totalWon || 0,
            spins: stats.totalSpins || 0,
            jackpots: stats.jackpotsWon || 0
          };
        })
        .sort((a, b) => b.netProfit - a.netProfit)
        .slice(0, 10);
      if (leaderboardData.length === 0) {
        return api.sendMessage("🎡 No players have spun the wheel yet! Be the first!", threadID, messageID);
      }
      let lbMsg = "🏆 ━━━━━━ WHEEL LEADERBOARD ━━━━━━ 🏆\n\n";
      const medals = ["🥇", "🥈", "🥉"];
      leaderboardData.forEach((u, i) => {
        const medal = medals[i] || `▫️ ${i + 1}.`;
        const profitSign = u.netProfit >= 0 ? "+" : "";
        lbMsg += `${medal}${u.name}\n`;
        lbMsg += `   💵 Net Profit: ${profitSign}${u.netProfit.toLocaleString()}\n`;
        lbMsg += `   🎡 Spins: ${u.spins} \vert{} 🎰 Jackpots: ${u.jackpots}\n\n`;
      });
      return api.sendMessage(lbMsg.trim(), threadID, messageID);
    }
    if (subCommand === "jackpot") {
      const allUsers = await usersData.getAll();
      let totalJackpot = 0;
      allUsers.forEach(u => {
        totalJackpot += u.data?.progressiveJackpot || 0;
      });
      const jackpotMsg = `
🎰 ━━━━━━ PROGRESSIVE JACKPOT ━━━━━━ 🎰

🏆 Current Pool: ${totalJackpot.toLocaleString()} coins
💰 Contribution: 2% of every spin bet

━━━━━━ HOW TO WIN ━━━━━━
• Land on 🏆 JACKPOT segment
• Win 50% - 150% of the entire global jackpot pool!
`.trim();
      return api.sendMessage(jackpotMsg, threadID, messageID);
    }
    if (!args[0]) {
      return api.sendMessage(
        `🎡 WHEEL OF FORTUNE\n\n` +
        `Usage: ${commandName} <bet amount>\n` +
        `Min Bet: ${min_bet.toLocaleString()} \vert{} Max Bet:${bet.toLocaleString()}\n\n` +
        `Subcommands:\n` +
        `• ${commandName} info\n` +
        `• ${commandName} stats\n` +
        `• ${commandName} leaderboard\n` +
        `• ${commandName} jackpot`,
        threadID, messageID
      );
    }
    const bet = parseInt(args[0].replace(/\D/g, ''));
    if (isNaN(bet) || bet <= 0) {
      return api.sendMessage("❌ Please enter a valid numeric bet amount.", threadID, messageID);
    }
    if (bet < bet) {
      return api.sendMessage(`❌ Minimum bet amount is ${bet.toLocaleString()} coins.`, threadID, messageID);
    }
    if (bet > bet) {
      return api.sendMessage(`❌ Maximum bet amount is ${bet.toLocaleString()} coins.`, threadID, messageID);
    }
    if (user.money < bet) {
      return api.sendMessage(
        `💸 Insufficient funds!\n` +
        `Current Balance: ${user.money.toLocaleString()} coins\n` +
        `Required: ${bet.toLocaleString()} coins`,
        threadID, messageID
      );
    }
    const now = Date.now();
    const validSpins = (userStats.lastSpins || []).filter(time => 
      typeof time === "number" && (now - time) < (limit_hours * 3600 * 1000)
    );
    if (validSpins.length >= plays) {
      const oldestSpin = validSpins[0];
      const nextAvailable = new Date(oldestSpin + (limit_hours * 3600 * 1000));
      return api.sendMessage(
        `⏰ Spin limit reached (${plays}/${plays})!\n` +
        `Next available spin: ${nextAvailable.toLocaleTimeString()}`,
        threadID, messageID
      );
    }
    await usersData.set(senderID, {
      money: user.money - bet,
      "data.wheelStats.totalWagered": (userStats.totalWagered || 0) + bet
    });
    const jackpotContrib = Math.floor(bet * 0.02);
    const currentJackpot = (user.data?.progressiveJackpot || 0) + jackpotContrib;
    validSpins.push(now);
    await usersData.set(senderID, {
      "data.progressiveJackpot": currentJackpot,
      "data.wheelStats.lastSpins": validSpins
    });
    let spinMsg;
    try {
      spinMsg = await api.sendMessage("🎮 Spinning the wheel... 🎮", threadID);
    } catch (err) {
      console.error("Error sending spin message:", err);
      return;
    }
    const animFrames = [
      "3️⃣ 3️⃣ 3️⃣",
      "2️⃣ 2️⃣ 2️⃣",
      "1️⃣ 1️⃣ 1️⃣",
      "0️⃣ 0️⃣ 0️⃣"
    ];
    for (const frame of animFrames) {
      await new Promise(res => setTimeout(res, 400));
      try {
        await api.editMessage(frame, spinMsg.messageID);
      } catch (e) {
      }
    }
    const rand = Math.random();
    let cumulative = 0;
    let selectedSegment = segments[segments.length - 1];
    for (const seg of segments) {
      cumulative += seg.probability;
      if (rand <= cumulative) {
        selectedSegment = { ...seg };
        break;
      }
    }
    let activeEvent = null;
    for (const ev of SPECIAL_EVENTS) {
      if (Math.random() < ev.trigger) {
        activeEvent = ev;
        selectedSegment.multiplier = ev.effect(selectedSegment.multiplier);
        break;
      }
    }
    let baseWinnings = Math.floor(bet * selectedSegment.multiplier);
    let jackpotWinnings = 0;
    let streakBonus = 0;
    if (selectedSegment.type === "jackpot") {
      jackpotWinnings = Math.floor(currentJackpot * (0.5 + Math.random()));
      await usersData.set(senderID, { "data.progressiveJackpot": 0 });
    }
    if (selectedSegment.type === "bankrupt") {
      baseWinnings = -Math.floor(bet * (selectedSegment.fee || 0.15));
    }
    let newStreak = selectedSegment.multiplier > 1 ? userStats.currentStreak + 1 : 0;
    if (newStreak >= 3) {
      streakBonus = Math.floor(bet * (newStreak - 2) * 0.2);
    }
    const totalWinnings = Math.max(0, baseWinnings) + jackpotWinnings + streakBonus;
    const finalBalance = (user.money - bet) + totalWinnings;
    const updatedStats = {
      totalSpins: (userStats.totalSpins || 0) + 1,
      totalWon: (userStats.totalWon || 0) + totalWinnings,
      totalWagered: (userStats.totalWagered || 0) + bet,
      biggestWin: Math.max(userStats.biggestWin || 0, totalWinnings),
      currentStreak: newStreak,
      highestStreak: Math.max(userStats.highestStreak || 0, newStreak),
      jackpotsWon: selectedSegment.type === "jackpot" ? (userStats.jackpotsWon || 0) + 1 : (userStats.jackpotsWon || 0),
      lastSpins: validSpins
    };
    await usersData.set(senderID, {
      money: finalBalance,
      "data.wheelStats": updatedStats
    });
    const resultCard = [
      `🎡 ━━━━━━ WHEEL RESULT ━━━━━━ 🎡`,
      ``,
      `🎯 Landed On: ${selectedSegment.emoji} ${selectedSegment.label}`,
      `💰 Bet Amount: ${bet.toLocaleString()}`,
      `📈 Multiplier: ${selectedSegment.multiplier.toFixed(2)}x`,
      `━━━━━━━━━━━━━━━━━━━━━━━━`
    ];
    if (baseWinnings > 0) resultCard.push(`🎉 Base Win: +${baseWinnings.toLocaleString()}`);
    if (jackpotWinnings > 0) resultCard.push(`🏆 JACKPOT BONUS: +${jackpotWinnings.toLocaleString()}!`);
    if (activeEvent) resultCard.push(`✨ Special Event: ${activeEvent.name}!`);
    if (streakBonus > 0) resultCard.push(`🔥 Streak Bonus (${newStreak}x): +${streakBonus.toLocaleString()}`);
    if (selectedSegment.type === "bankrupt") resultCard.push(`⚡ Bankrupt Penalty: -${Math.abs(baseWinnings).toLocaleString()}`);
    resultCard.push(
      `━━━━━━━━━━━━━━━━━━━━━━━━`,
      `💵 Net Outcome: ${totalWinnings >= bet ? '+' : ''}${(totalWinnings - bet).toLocaleString()}`,
      `💰 Balance: ${finalBalance.toLocaleString()}`,
      `🎡 Spins Remaining: ${plays - validSpins.length}/${plays}`
    );
    if (newStreak > 1) resultCard.push(`🔥 Win Streak: ${newStreak}`);
    try {
      await api.editMessage(resultCard.join("\n"), spinMsg.messageID);
    } catch (e) {
      await api.sendMessage(resultCard.join("\n"), threadID);
    }
  }
};
