const { Client, GatewayIntentBits, Partials } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.GuildMember],
});

const SERVER_ID = '1386044830290804938'; // Your server ID

async function updateStatus() {
  try {
    const guild = await client.guilds.fetch(SERVER_ID);
    if (!guild) {
      console.error('Guild not found');
      return;
    }

    await guild.members.fetch(); // Fetch all members

    // ✅ Count ONLY online (green) users, not idle or dnd
    const onlineOnlyCount = guild.members.cache.filter(
      member =>
        member.presence?.status === 'online' && !member.user.bot
    ).size;

    console.log(`Online users (green dot only): ${onlineOnlyCount}`);

    // ✅ Update bot nickname
    const botMember = guild.members.cache.get(client.user.id);
    if (botMember) {
      await botMember.setNickname('STATUS');
    }

    // ✅ Update bot status
    await client.user.setPresence({
      activities: [{ name: `| Online: ${onlineOnlyCount}`, type: 0 }],
      status: 'online',
    });

    console.log(`Status updated: | Online: ${onlineOnlyCount}`);
  } catch (error) {
    console.error('Error updating status:', error);
  }
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  updateStatus();
  setInterval(updateStatus, 30 * 1000); // Update every 30 seconds
});

client.login(process.env.BOT_TOKEN);

// --- Express server for uptime robot ---
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

app.listen(PORT, () => {
  console.log(`Webserver running on port ${PORT}`);
});
