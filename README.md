<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0D001A,50:7000FF,100:00D9FF&height=260&section=header&text=SHADOWX-BOT&fontSize=74&fontColor=FFFFFF&animation=fadeIn&fontAlignY=40&desc=Not%20Coded%20to%20Impress%20Coded%20to%20Express&descSize=20&descAlignY=62&descColor=FFD700" width="100%"/>

```console
  🤖 SHADOWX-BOT `v1.5.35`

> Facebook Messenger Automation Engine  
> 🛠️ Modified by: MUEID MURSALIN RIFAT  
> 🟢 Status: Online | ⚡ Engine: `shadowx-fca`
> 🐘 Database: MongoDB · Neon · SQLite · JSON 
```
<p align="center">
  <img src="./dashboard/images/shadowx.svg" alt="Mueid Mursalin Rifat" width="100%"/>
</p>
---

**A full-stack, event-driven Messenger engine built for scale, speed, and control.**

> *"Not coded to impress, coded to express."*

<br>

<a href="https://github.com/Shadowx-Team/shadowx-bot.git"><img src="https://img.shields.io/github/stars/Shadowx-Team/shadowx-bot?style=for-the-badge&logo=github&label=STARS&color=7000FF" alt="Stars"></a>
<a href="https://github.com/Shadowx-Team/shadowx-bot.git"><img src="https://img.shields.io/github/last-commit/Shadowx-Team/shadowx-bot?style=for-the-badge&logo=github&label=LAST%20UPDATE&color=FFD700" alt="Last Commit"></a>
<a href="https://github.com/Shadowx-Team/shadowx-bot/blob/main/LICENSE"><img src="https://img.shields.io/badge/LICENSE-MIT-7000FF?style=for-the-badge" alt="License"></a>
<img src="https://img.shields.io/badge/NODE-22.x-00D9FF?style=for-the-badge&logo=node.js&logoColor=white" alt="Node 22">
<img src="https://img.shields.io/badge/ENGINE-shadowx--fca-7000FF?style=for-the-badge" alt="shadowx-fca">

📦 [Repository](https://github.com/Shadowx-Team/shadowx-bot)

</div>
---

## 📑 Contents

```console
root@shadowx:~$ ./shadowx-bot --help
[ OK ] loading table of contents...
```

- 🧭 [About](#-about)
- ⭐ [Highlights](#-highlights)
- 🚀 [Features](#-features)
- 🔐 [Approval system](#-approval-system)
- 🏗️ [Architecture](#-architecture)
- 🔐 [Roles](#-roles)
- ⚙️ [Configuration](#-configuration)
- 📥 [Install](#-install)
- ▶️ [Run](#-run)
- 🔧 [Native fix](#-native-fix)
- 📋 [Requirements](#-requirements)
- 🤖 [Auto systems](#-auto-systems)
- 🖼️ [Profile avatars](#-profile-avatars)
- 🆕 [Recent updates](#-recent-updates)
- 🛠️ [Troubleshooting](#-troubleshooting)
- 🤝 [Contributing](#-contributing)
- 🌟 [Connect](#-connect)
- 🎨 [Identity](#-identity)

---

## 🧭 About

```console
root@shadowx:~$ ./shadowx-bot --describe
[ OK ] account link   : personal facebook
[ OK ] listener       : shadowx-fca realtime events
[ OK ] pipeline       : command + event router
[ OK ] boot complete  : ready to serve
```

SHADOWX-BOT links a personal Facebook account through `shadowx-fca`, listens to real-time events, and pushes every message through a fast command and event pipeline.

Three ideas guide the build.

| Goal | Meaning |
|---|---|
| 🛡️ Reliability | Auto reconnect, MQTT supervision, session backup, and optional uptime pings keep the process alive. |
| 🎛️ Control | Permission tiers, approval mode, whitelist mode, admin-only mode, per-thread settings, and a web dashboard. |
| 🧩 Extensibility | Modular commands and events, live script loading, and a clean data layer. |

The result is a compact command library with economy, games, fun, social, group management, owner tools, and utilities.

---

## ⭐ Highlights

```console
root@shadowx:~$ ./shadowx-bot --highlights
[1/8] 🎨 identity and banner rebuilt
[2/8] 🐘 mongodb database attached
[3/8] ⚡ shadowx-fca session online
[4/8] 🚀 command library verified
[5/8] 🔐 approval mode available
[6/8] 🖥️ dashboard reachable
[7/8] 🔧 native modules healthy
[8/8] 🟢 node 22 runtime locked
[ OK ] all systems nominal
```

- 🎨 Rebuilt identity, banner, and documentation
- 🐘 MongoDB by default, with Neon PostgreSQL, SQLite, and JSON available
- ⚡ `shadowx-fca` login with E2EE bootstrap and appstate backup
- 🚀 **35 commands** across eight categories — explore them with `#help` in chat
- 🔐 Approval mode with permanent and temporary group approvals
- 💎 Premium membership with expiry tracking
- 🖥️ Dashboard with verification codes and account controls
- 🔧 Self-healing native modules for `canvas`, `sqlite3`, and `bcrypt`
- 🟢 Node 22 runtime with a repeatable build flow
- 🖼️ Reliable profile avatars with session and token fallbacks

---

## 🚀 Features

```console
root@shadowx:~$ ./shadowx-bot --commands
[ OK ] scanning command registry...
[ OK ] 8 categories loaded
[ OK ] 35 commands mounted
[ OK ] permissions attached
[ READY ] use #help in chat to explore
```

### 🧠 Other systems

Premium gating, whitelist mode, admin-only mode, typing indicator, reaction mirror, event logging, and failure alerts through Gmail, Telegram, or Discord.

---

## 🏗️ Architecture

```console
root@shadowx:~$ ./shadowx-bot --topology
```

```mermaid
graph TD
    A["Messenger User"] --> B["shadowx-fca Listener"]
    B --> C["Event Router"]
    C --> D["Command Engine"]
    C --> E["Event Handlers"]
    D --> F["Permission Guard"]
    F --> G["Command Modules"]
    G --> H["MongoDB"]
    G --> I["Media and AI APIs"]
    E --> H
    E --> J["Welcome Leave Logs"]
    E --> K["Economy and Premium"]
```

A message arrives through the MQTT listener. The router resolves the prefix, thread settings, and sender role. Commands pass cooldown, approval, and permission checks. Data is read or written. Media commands call external APIs. Greeting, warning, and expiry events run in parallel.

```console
root@shadowx:~$ ./shadowx-bot --trace
[1/6] 📡 event received from mqtt listener
[2/6] 🧭 prefix, thread, and role resolved
[3/6] 🔐 cooldown, approval, and permission checks passed
[4/6] 🗄️ database read and write
[5/6] 🎨 external api call and attachment
[6/6] ⚙️ parallel event handlers fired
[ OK ] pipeline complete
```

---

## 🔐 Roles

```console
root@shadowx:~$ ./shadowx-bot --roles
[ 4 ] 👑 developer    <- devUsers
[ 3 ] 💎 premium      <- premiumUsers
[ 2 ] 🛡️ bot admin    <- adminBot
[ 1 ] 🧑‍💼 group admin  <- thread admin list
[ 0 ] 👤 member       <- default
```

| Tier | Level | Source |
|---|:---:|---|
| 👑 Developer | **4** | `devUsers` |
| 💎 Premium | **3** | `premiumUsers` |
| 🛡️ Bot Admin | **2** | `adminBot` |
| 🧑‍💼 Group Admin | **1** | Thread admin list |
| 👤 Member | **0** | Default |

Commands declare the minimum tier they need. Higher tiers inherit lower-tier access.

---

## ⚙️ Configuration

```console
root@shadowx:~$ cat config.json | ./shadowx-bot --keys
[ OK ] prefix, usePrefix
[ OK ] adminBot, devUsers, premiumUsers
[ OK ] approval, adminOnly, whiteListMode
[ OK ] database.type, database.uriMongodb
[ OK ] dashBoard, serverUptime
[ OK ] autoRestart, autoUptime, autoLoadScripts
[ OK ] logEvents, optionsFca
```

Everything lives in `config.json`. These keys matter most.

| Key | Purpose |
|---|---|
| `prefix` | Default command prefix, `.` in the current config |
| `usePrefix` | Prefix mode, including admin prefix rules |
| `adminBot`, `devUsers`, `premiumUsers` | Account IDs per tier |
| `approval` | Enable approved-groups-only command access |
| `adminOnly` | Limit command use to bot admins |
| `whiteListMode` | Limit usage to approved IDs |
| `database.type` | `mongodb`, `neon`, `sqlite`, or `json` |
| `database.uriMongodb` | MongoDB connection string |
| `database.uriNeon` | Neon connection string |
| `dashBoard` | Enable, port (`5000`), admin key, code expiry |
| `serverUptime` | External uptime reporting and socket |
| `autoRestart` | Interval or cron expression |
| `autoUptime` | Self-ping to stay awake |
| `autoLoadScripts` | Reload changed files |
| `autoRefreshFbstate` | Refresh the session |
| `restartListenMqtt` | Listener restart interval |
| `notiWhenListenMqttError` | Failure alert channels |
| `hideNotiMessage` | Silence chosen warnings |
| `logEvents` | Per-type event logging |
| `optionsFca` | Engine flags such as force login and presence |

Credentials load from `account.txt`, `account2.txt`, and `account3.txt`. The bot tries each until one succeeds.

---

## 📥 Install

```console
git clone https://github.com/Shadowx-Team/shadowx-bot.git
cd shadowx-bot
npm install
```

The install step checks `canvas`, `sqlite3`, and `bcrypt` against the current Node build and rebuilds anything that fails.

---

## ▶️ Run

```console
node index.js
# or
npm start
```

The web service listens on `process.env.PORT` or port `3000`. The dashboard uses `dashBoard.port`, which is `5000` in the current config.

---

## 🔧 Native fix

Automatic on every install. Manual when needed:

```console
npm run fix:canvas
```

It loads each native module, rebuilds failures with `npm rebuild <module> --foreground-scripts`, then loads them again to confirm. This clears the classic mismatch:

```console
Error: The module '.../canvas/build/Release/canvas.node'
was compiled against a different Node.js version using
NODE_MODULE_VERSION 127. This version of Node.js requires
NODE_MODULE_VERSION 137.
```

---

## 📋 Requirements

| Item | Version |
|---|---|
| Node.js | 22.x |
| npm | 9+ |
| Git | Latest |
| Build tools | `python3`, `make`, `g++` |
| Messenger account | Required |

```console
apt-get update
apt-get install -y python3 make g++
```

---

## 🤖 Auto systems

```console
root@shadowx:~$ ./shadowx-bot --auto
[ armed ] 🔌 auto reconnect
[ armed ] 📡 mqtt supervision
[ armed ] 💾 session backup
[ armed ] 🔄 scheduled restart
[ armed ] 🧩 script reload
[ armed ] ⏳ premium expiry
[ armed ] 👋 welcome + leave
[ armed ] ⚠️ warning system
```

Reconnect handles network drops. MQTT supervision restarts the listener on a timer. Session backup saves appstate and cookies. Scheduled restart follows a cron or interval. Script loading reloads changed files. Expiry checks clear lapsed premium. Greeting events fire on join and leave. The warning system tracks and acts.

---

## 🛠️ Troubleshooting

| Symptom | Fix |
|---|---|
| Canvas version mismatch | `npm run fix:canvas` |
| Bot exits at once | Check console output and validate `config.json` |
| Login loop | Refresh the session, confirm the account is not blocked |
| Database offline | Check `database.type` and the matching URI |
| Command missing | Confirm the file loaded and the prefix matches |
| Native build fails | Install build tools, then rebuild |
| Port in use | Change `PORT` or `dashBoard.port` |
| Profile picture blank | Check the token has the trailing `2`, then restart the bot |
| Approval blocks a group | Approve it with `#approve on` as a bot admin |
| Push rejected by GitHub | `git pull --rebase origin main` then `git push -u origin main` |

```console
tail -n 100 logs/bot.log
```

---

## 🤝 Contributing

```console
git checkout -b feature/my-change
git add .
git commit -m "feat: describe the change"
git push -u origin feature/my-change
```

Open a pull request with a clear title, the reason for the change, and test notes.

---

## 🌟 Connect

```console
root@shadowx:~$ ./shadowx-bot --connect
[ OK ] connecting to repository...
[ OK ] all connections established
```

## 🎨 Identity

```console
root@shadowx:~$ ./shadowx-bot --version

  ⚡ SHADOWX-BOT
  🛠️ modified by MUEID MURSALIN RIFAT
  🟢 runtime  Node.js 22.x
  🐘 database MongoDB
  ⚡ engine   shadowx-fca
  📜 license  MIT
```

**Not coded to impress, coded to express.**

*Mueid Mursalin Rifat*

<a href="https://github.com/Shadowx-Team/shadowx-bot"><img src="https://img.shields.io/badge/GITHUB-7000FF?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"></a>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:00D9FF,50:7000FF,100:0D001A&height=140&section=footer" width="100%">

</div>
