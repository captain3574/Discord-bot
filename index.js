const express = require('express');
const app = express();

// Load environment variables from .env file
require('dotenv').config();
const { Client } = require("discord.js");

// Import voice tools from @discordjs/voice library
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
// Import play-dl for fetching YouTube audio streams
const play = require('play-dl');

// Define command prefix
const PREFIX = '!';

// Initialize Discord Client with intents
const client = new Client({
    intents: [129]
});

// Event listener: Triggered when the bot is online and ready
client.on("ready", () => {
    console.log("พร้อมใช้งานแล้วครับ!");
});

// Event listener: Handles incoming messages and commands
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    // Separate commands from the text.
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Command: play
    if (command === 'play') {
        const query = args.join(' ');
        if (!query) {
            return message.reply('กรุณาใส่ชื่อเพลงหรือลิงก์ YouTube ด้วยครับ!');
        }

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.reply('คุณต้องเข้าห้องเสียง(Voice Channel) ก่อนใช้งานคำสั่งนี้!');
        }

        try {
            let streamData;
            if (play.yt_validate(query) === 'video') {
                streamData = await play.stream(query);
            } else {
                const searched = await play.search(query, { limit: 1 });
                if (!searched.length) return message.reply('ไม่พบเพลงที่คุณค้นหาครับ');
                streamData = await play.stream(searched[0].url);
                message.channel.send(`🎶 กำลังเล่น: **{searched[0].title}**`);
            }

            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });

            const player = createAudioPlayer();
            const resource = createAudioResource(streamData.stream, {
                inputType: streamData.type
            });

            connection.subscribe(player);
            player.play(resource);

        } catch (error) {
            console.error(error);
            message.reply('เกิดข้อผิดพลาดในการประมวลผลคำสั่งครับ');
        }
    }

    // Command: stop
    else if (command === 'stop') {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.reply('คุณต้องอยู่ในห้องเสียงเดียวกับบอทครับ!');
        }

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });

        connection.destroy();
        message.channel.send('หยุดเพลงและออกจากห้องแล้วครับ');
    }
});

// Express server setup for keeping the app alive
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

// Log in the bot using the token from environment variables
client.login(process.env.DISCORD_TOKEN);