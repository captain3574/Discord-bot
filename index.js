require('dotenv').config();

const {client} = require("discord.js");
const client = new Client({
    intents: [129]
});

client.on("ready", () => {
    console.log("I'm ready!");
});

client.login(process.env.DISCORD_TOKEN);