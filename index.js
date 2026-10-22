const express = require('express');
const app = express();


require('dotenv').config();

const {Client} = require("discord.js");
const client = new Client({
    intents: [129]
});

client.on("ready", () => {
    console.log("I'm ready!");
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});


client.login(process.env.DISCORD_TOKEN);