const { createCanvas } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const GIFEncoder = require('gif-encoder-2');
const symbols = ["🍒", "🍋", "🍇", "💎", "7⃣", "🍉", "⭐", "🔔"];
const colors = {
  red: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36],
  black: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35]
};
const suits = ["♠", "♥", "♦", "♣"];
const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const rouletteNumbers = [
  0, 28, 9, 26, 30, 11, 7, 20, 32, 17, 5, 22, 34, 15, 3, 24, 36, 13, 1,
  0, 27, 10, 25, 29, 12, 8, 19, 31, 18, 6, 21, 33, 16, 4, 23, 35, 14, 2
];
if (!global.blackjackData) global.blackjackData = new Map();
function registerReplyListener(botContext, messageID, data) {
  const replyMap =
    (global.GoatBot && global.GoatBot.onReply) ||
    (global.SizuBot && global.SizuBot.onReply) ||
    (global.client && global.client.handleReply);
  if (replyMap && typeof replyMap.set === 'function') {
    replyMap.set(messageID, data);
  }
}
function drawRoundedRect(ctx, x, y, width, height, radius = 10) {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}
function drawCardCanvas(ctx, card, x, y, width, height) {
  const suit = card.slice(-1);
  const value = card.slice(0, -1);
  const isRed = (suit === '♥' || suit === '♦');
  const cardColor = isRed ? '#DC2626' : '#111827';
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = '#FFFFFF';
  drawRoundedRect(ctx, x, y, width, height, 10);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#D1D5DB';
  ctx.lineWidth = 1.5;
  drawRoundedRect(ctx, x, y, width, height, 10);
  ctx.stroke();
  ctx.fillStyle = cardColor;
  ctx.font = `bold ${Math.floor(width / 3.4)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x + width * 0.28, y + height * 0.26);
  ctx.font = `${Math.floor(width / 2.6)}px Arial`;
  ctx.fillText(suit, x + width * 0.5, y + height * 0.62);
}
async function createBlackjackCanvas(playerHand, dealerHand, status, betAmount = 0) {
  const canvas = createCanvas(800, 520);
  const ctx = canvas.getContext('2d');
  const grd = ctx.createRadialGradient(400, 260, 50, 400, 260, 550);
  grd.addColorStop(0, '#065F46');
  grd.addColorStop(0.7, '#044E37');
  grd.addColorStop(1, '#022C22');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 800, 520);
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 6;
  drawRoundedRect(ctx, 10, 10, 780, 500, 20);
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = 'bold 22px Arial';
  ctx.fillText("DEALER'S HAND", 400, 45);
  const cardWidth = 85, cardHeight = 125, cardGap = 16;
  const dealerStartX = 400 - (dealerHand.length * (cardWidth + cardGap) - cardGap) / 2;
  dealerHand.forEach((card, i) => {
    const cardX = dealerStartX + i * (cardWidth + cardGap);
    if (card === 'facedown') {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#991B1B';
      drawRoundedRect(ctx, cardX, 65, cardWidth, cardHeight, 10);
      ctx.fill();
      ctx.strokeStyle = '#FCA5A5';
      ctx.lineWidth = 2;
      drawRoundedRect(ctx, cardX + 5, 70, cardWidth - 10, cardHeight - 10, 6);
      ctx.stroke();
      ctx.restore();
    } else {
      drawCardCanvas(ctx, card, cardX, 65, cardWidth, cardHeight);
    }
  });
  if (betAmount > 0) {
    ctx.fillStyle = '#FBBF24';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`CURRENT BET: $${betAmount.toLocaleString()}`, 400, 240);
  }
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = 'bold 22px Arial';
  ctx.fillText("YOUR HAND", 400, 280);
  const playerStartX = 400 - (playerHand.length * (cardWidth + cardGap) - cardGap) / 2;
  playerHand.forEach((card, i) => {
    drawCardCanvas(ctx, card, playerStartX + i * (cardWidth + cardGap), 305, cardWidth, cardHeight);
  });
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 30px Arial';
  ctx.fillText(status, 400, 475);
  const cacheDir = path.join(__dirname, 'cache');
  await fs.ensureDir(cacheDir);
  const outputPath = path.join(cacheDir, `bj_${Date.now()}_${Math.floor(Math.random() * 1000)}.png`);
  await fs.writeFile(outputPath, canvas.toBuffer("image/png"));
  return outputPath;
}
async function createRouletteGif(winningNumber, winningColor) {
  const canvasWidth = 500, canvasHeight = 500;
  const encoder = new GIFEncoder(canvasWidth, canvasHeight);
  const cacheDir = path.join(__dirname, 'cache');
  await fs.ensureDir(cacheDir);
  const gifPath = path.join(cacheDir, `roulette_${Date.now()}.gif`);
  const gifStream = fs.createWriteStream(gifPath);
  encoder.createReadStream().pipe(gifStream);
  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(60);
  encoder.setQuality(10);
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d');
  const centerX = 250, centerY = 250, radius = 215;
  const frameCount = 65;
  const slotIndex = rouletteNumbers.indexOf(winningNumber);
  const finalAngle = (slotIndex === -1 ? 0 : slotIndex) * (360 / 38);
  const spinEndFrame = 48;
  for (let i = 0; i < frameCount; i++) {
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    const progress = Math.min(i, spinEndFrame) / spinEndFrame;
    const easedProgress = 1 - Math.pow(1 - progress, 4);
    const wheelRotation = easedProgress * (360 * 3 + finalAngle);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((wheelRotation * Math.PI) / 180);
    for (let j = 0; j < 38; j++) {
      const angle = j * ((2 * Math.PI) / 38);
      const num = rouletteNumbers[j];
      const color = (num === 0) ? '#059669' : colors.red.includes(num) ? '#DC2626' : '#1E293B';
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, angle - Math.PI / 38, angle + Math.PI / 38);
      ctx.closePath();
      ctx.fill();
      ctx.save();
      ctx.rotate(angle + Math.PI / 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 15px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(num.toString(), 0, -radius + 24);
      ctx.restore();
    }
    ctx.restore();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 35, 0, Math.PI * 2);
    ctx.fillStyle = '#F59E0B';
    ctx.fill();
    const ballEased = 1 - Math.pow(1 - progress, 5);
    const ballRotation = -(360 * 5 * (1 - ballEased));
    let ballRadius = radius * (0.8 - 0.65 * ballEased);
    if (progress > 0.6) {
      const clatter = (progress - 0.6) / 0.4;
      ballRadius += Math.sin(clatter * Math.PI * 10) * (8 * (1 - clatter));
    }
    const ballX = centerX + ballRadius * Math.cos((ballRotation * Math.PI) / 180);
    const ballY = centerY + ballRadius * Math.sin((ballRotation * Math.PI) / 180);
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(ballX, ballY, 8, 0, Math.PI * 2);
    ctx.fill();
    if (i === frameCount - 1) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.fillStyle = winningColor === "red" ? '#EF4444' : winningColor === "black" ? '#F3F4F6' : '#10B981';
      ctx.font = 'bold 85px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(winningNumber.toString(), 250, 230);
      ctx.font = 'bold 28px Arial';
      ctx.fillText(winningColor.toUpperCase(), 250, 290);
    }
    encoder.addFrame(ctx);
  }
  encoder.finish();
  await new Promise(res => gifStream.on('finish', res));
  return gifPath;
}
function drawCard() {
  const suit = suits[Math.floor(Math.random() * suits.length)];
  const value = values[Math.floor(Math.random() * values.length)];
  return `${value}${suit}`;
}
function handValue(hand) {
  let total = 0, aces = 0;
  for (const card of hand) {
    if (typeof card !== 'string' || card === 'facedown') continue;
    const value = card.slice(0, -1);
    if (value === "A") { aces++; total += 11; }
    else if (["K", "Q", "J"].includes(value)) { total += 10; }
    else { total += parseInt(value); }
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}
module.exports = {
  config: {
    name: "casino",
    version: "3.0.0",
    author: "Mahi-- | Fahad Islam",
    shortDescription: { en: "Casino: slot, blackjack, roulette" },
    longDescription: { en: "High-roller casino with live graphics for Slot, Blackjack (Hit/Stand/Double), and Roulette (GIF)." },
    category: "game",
    guide: {
      en: "{pn} slot <amount>\n{pn} blackjack <amount>\n{pn} roulette <red|black> <amount>"
    }
  },
  onStart: async function ({ message, event, args, usersData }) {
    const { senderID } = event;
    const user = (await usersData.get(senderID)) || { money: 0 };
    const game = (args[0] || "").toLowerCase();
    if (!["slot", "blackjack", "roulette"].includes(game)) {
      return message.reply(
        "🎰 𝗖𝗔𝗦𝗜𝗡𝗢 𝗥𝗢𝗬𝗔𝗟𝗘 🎲\n━━━━━━━━━━━━━━━━\n" +
        "• casino slot <bet>\n" +
        "• casino blackjack <bet>\n" +
        "• casino roulette <red|black> <bet>\n\n" +
        `💰 Current Balance: $${(user.money || 0).toLocaleString()}`
      );
    }
    if (game === "slot") {
      const bet = parseInt(args[1]);
      if (isNaN(bet) || bet <= 0) return message.reply("⚠️ Please enter a valid bet amount.");
      if (user.money < bet) return message.reply(`⚠️ Insufficient balance! You have $${user.money.toLocaleString()}.`);
      const s1 = symbols[Math.floor(Math.random() * symbols.length)];
      const s2 = symbols[Math.floor(Math.random() * symbols.length)];
      const s3 = symbols[Math.floor(Math.random() * symbols.length)];
      let multiplier = 0;
      if (s1 === s2 && s2 === s3) {
        multiplier = (s1 === "💎" || s1 === "7⃣") ? 10 : 5;
      } else if (s1 === s2 || s2 === s3 || s1 === s3) {
        multiplier = 2;
      } else {
        multiplier = -1;
      }
      const outcome = multiplier > 0 ? bet * multiplier : -bet;
      user.money += outcome;
      await usersData.set(senderID, { money: user.money });
      return message.reply(
        `🎰 𝗦𝗟𝗢𝗧 𝗠𝗔𝗖𝗛𝗜𝗡𝗘 🎰\n` +
        `━━━━━━━━━━━━━━━\n` +
        `[  ${s1}  |  ${s2}  |  ${s3}  ]\n` +
        `━━━━━━━━━━━━━━━\n` +
        `${multiplier > 0 ? `🎉 𝗪𝗜𝗡! Payout: +$${outcome.toLocaleString()}` : `😢 𝗟𝗢𝗦𝗧: -$${bet.toLocaleString()}`}\n` +
        `💳 Balance: $${user.money.toLocaleString()}`
      );
    }
    if (game === "blackjack") {
      const bet = parseInt(args[1]);
      if (isNaN(bet) || bet <= 0) return message.reply("⚠️ Enter a valid bet amount.");
      if (user.money < bet) return message.reply(`⚠️ Insufficient funds! You only have $${user.money.toLocaleString()}.`);
      user.money -= bet;
      await usersData.set(senderID, { money: user.money });
      const playerHand = [drawCard(), drawCard()];
      const dealerHand = [drawCard(), drawCard()];
      const playerTotal = handValue(playerHand);
      if (playerTotal === 21) {
        const winAmount = Math.floor(bet * 2.5);
        user.money += winAmount;
        await usersData.set(senderID, { money: user.money });
        const canvasPath = await createBlackjackCanvas(playerHand, dealerHand, "NATURAL BLACKJACK! (21)", bet);
        return message.reply(
          {
            body: `🌟 𝗕𝗟𝗔𝗖𝗞𝗝𝗔𝗖𝗞! You scored 21!\n🎉 Payout: +$${winAmount.toLocaleString()}\n💳 Balance: $${user.money.toLocaleString()}`,
            attachment: fs.createReadStream(canvasPath)
          },
          () => fs.unlink(canvasPath).catch(() => {})
        );
      }
      global.blackjackData.set(senderID, {
        bet,
        playerHand,
        dealerHand,
        state: "playing",
        originalBet: bet
      });
      const canvasPath = await createBlackjackCanvas(playerHand, [dealerHand[0], 'facedown'], `Your Total: ${playerTotal}`, bet);
      return message.reply(
        {
          body: `🃏 𝗕𝗟𝗔𝗖𝗞𝗝𝗔𝗖𝗞 𝗧𝗔𝗕𝗟𝗘\nReply:\n• "hit" (or "h") to take a card\n• "stand" (or "s") to end turn\n• "double" (or "d") to double bet & draw 1`,
          attachment: fs.createReadStream(canvasPath)
        },
        (err, info) => {
          fs.unlink(canvasPath).catch(() => {});
          if (!err && info) {
            registerReplyListener(this, info.messageID, {
              commandName: this.config.name,
              messageID: info.messageID,
              author: senderID
            });
          }
        }
      );
    }
    if (game === "roulette") {
      const color = (args[1] || "").toLowerCase();
      const betRoulette = parseInt(args[2]);
      if (!["red", "black"].includes(color)) return message.reply("🎡 Choose a valid color: 'red' or 'black'.\nExample: casino roulette red 500");
      if (isNaN(betRoulette) || betRoulette <= 0) return message.reply("🎡 Enter a valid bet amount.");
      if (user.money < betRoulette) return message.reply(`🎡 You don't have enough money! Balance: $${user.money.toLocaleString()}`);
      const spinMsg = await message.reply("🎡 Spinning the roulette wheel... Please wait!");
      const ball = Math.floor(Math.random() * 37);
      const ballColor = colors.red.includes(ball) ? "red" : colors.black.includes(ball) ? "black" : "green";
      const won = ballColor === color;
      const payout = won ? betRoulette : -betRoulette;
      user.money += payout;
      await usersData.set(senderID, { money: user.money });
      const gifPath = await createRouletteGif(ball, ballColor);
      if (spinMsg && spinMsg.messageID) {
        message.unsend(spinMsg.messageID).catch(() => {});
      }
      return message.reply(
        {
          body: `🎡 𝗥𝗢𝗨𝗟𝗘𝗧𝗧𝗘 𝗥𝗘𝗦𝗨𝗟𝗧\n━━━━━━━━━━━━━━━━\nBall landed on: ${ball} (${ballColor.toUpperCase()})\n` +
                `${won ? `🎉 YOU WON: +$${betRoulette.toLocaleString()}` : `😢 YOU LOST: -$${betRoulette.toLocaleString()}`}\n` +
                `💳 Balance: $${user.money.toLocaleString()}`,
          attachment: fs.createReadStream(gifPath)
        },
        () => fs.unlink(gifPath).catch(() => {})
      );
    }
  },
  onReply: async function ({ message, event, usersData, Reply }) {
    const { senderID, body } = event;
    if (Reply && Reply.author && senderID !== Reply.author) return;
    const data = global.blackjackData.get(senderID);
    if (!data || data.state !== "playing") return;
    const rawMove = (body || "").trim().toLowerCase();
    let move = "";
    if (["hit", "h"].includes(rawMove)) move = "hit";
    else if (["stand", "s", "stay"].includes(rawMove)) move = "stand";
    else if (["double", "d", "dd"].includes(rawMove)) move = "double";
    else return; 
    if (Reply && Reply.messageID) {
      message.unsend(Reply.messageID).catch(() => {});
    }
    const user = (await usersData.get(senderID)) || { money: 0 };
    if (move === "double") {
      if (user.money < data.bet) {
        return message.reply(`⚠️ You need another $${data.bet.toLocaleString()} to double down! Reply 'hit' or 'stand'.`);
      }
      user.money -= data.bet;
      data.bet *= 2;
      data.playerHand.push(drawCard());
      const playerTotal = handValue(data.playerHand);
      if (playerTotal > 21) {
        global.blackjackData.delete(senderID);
        await usersData.set(senderID, { money: user.money });
        const canvasPath = await createBlackjackCanvas(data.playerHand, data.dealerHand, `BUSTED! Total: ${playerTotal}`, data.bet);
        return message.reply(
          {
            body: `💥 BUST! You went over 21.\n😢 Lost: -$${data.bet.toLocaleString()}\n💳 Balance: $${user.money.toLocaleString()}`,
            attachment: fs.createReadStream(canvasPath)
          },
          () => fs.unlink(canvasPath).catch(() => {})
        );
      }
      move = "stand";
    }
    if (move === "hit") {
      data.playerHand.push(drawCard());
      const playerTotal = handValue(data.playerHand);
      if (playerTotal > 21) {
        global.blackjackData.delete(senderID);
        const canvasPath = await createBlackjackCanvas(data.playerHand, data.dealerHand, `BUST! (${playerTotal})`, data.bet);
        return message.reply(
          {
            body: `💥 BUST! You drew over 21!\n😢 Lost: -$${data.bet.toLocaleString()}\n💳 Balance: $${user.money.toLocaleString()}`,
            attachment: fs.createReadStream(canvasPath)
          },
          () => fs.unlink(canvasPath).catch(() => {})
        );
      }
      global.blackjackData.set(senderID, data);
      const canvasPath = await createBlackjackCanvas(data.playerHand, [data.dealerHand[0], 'facedown'], `Your Total: ${playerTotal}`, data.bet);
      return message.reply(
        {
          body: `Total: ${playerTotal}. Reply 'hit' or 'stand'.`,
          attachment: fs.createReadStream(canvasPath)
        },
        (err, info) => {
          fs.unlink(canvasPath).catch(() => {});
          if (!err && info) {
            registerReplyListener(this, info.messageID, {
              commandName: this.config.name,
              messageID: info.messageID,
              author: senderID
            });
          }
        }
      );
    }
    if (move === "stand") {
      const dealerDraw = [...data.dealerHand];
      while (handValue(dealerDraw) < 17) {
        dealerDraw.push(drawCard());
      }
      const playerTotal = handValue(data.playerHand);
      const dealerTotal = handValue(dealerDraw);
      let resultText = "";
      let deltaMoney = 0;
      if (dealerTotal > 21) {
        deltaMoney = data.bet * 2;
        resultText = `DEALER BUSTED! YOU WIN! (+$${data.bet.toLocaleString()})`;
      } else if (playerTotal > dealerTotal) {
        deltaMoney = data.bet * 2;
        resultText = `YOU WIN! (${playerTotal} vs ${dealerTotal})`;
      } else if (playerTotal === dealerTotal) {
        deltaMoney = data.bet; 
        resultText = `PUSH! (${playerTotal} vs ${dealerTotal}) - Bet Returned`;
      } else {
        deltaMoney = 0; 
        resultText = `DEALER WINS! (${dealerTotal} vs ${playerTotal})`;
      }
      user.money += deltaMoney;
      await usersData.set(senderID, { money: user.money });
      global.blackjackData.delete(senderID);
      const canvasPath = await createBlackjackCanvas(data.playerHand, dealerDraw, resultText, data.bet);
      return message.reply(
        {
          body: `🏁 𝗚𝗔𝗠𝗘 𝗢𝗩𝗘𝗥\n${resultText}\n💳 Current Balance: $${user.money.toLocaleString()}`,
          attachment: fs.createReadStream(canvasPath)
        },
        () => fs.unlink(canvasPath).catch(() => {})
      );
    }
  }
};
