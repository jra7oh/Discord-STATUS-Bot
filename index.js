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

    // Fetch all members to get updated presence info
    await guild.members.fetch();

    // Count online members: presence exists, status not offline, and not bots
    const onlineCount = guild.members.cache.filter(
      member =>
        member.presence &&
        member.presence.status !== 'offline' &&
        !member.user.bot
    ).size;

    console.log(`Online members (not offline): ${onlineCount}`);

    // Change bot's nickname to "STATUS"
    const botMember = guild.members.cache.get(client.user.id);
    if (botMember) {
      await botMember.setNickname('STATUS');
    }

    // Set bot presence: Playing | Online: X
    await client.user.setPresence({
      activities: [{ name: `| Online: ${onlineCount}`, type: 0 }], // type 0 = Playing
      status: 'online',
    });

    console.log(`Status updated: | Online: ${onlineCount}`);
  } catch (error) {
    console.error('Error updating status:', error);
  }
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);

  // Initial update
  updateStatus();

  // Update every 30 seconds
  setInterval(updateStatus, 30 * 1000);
});

client.login(process.env.BOT_TOKEN);

// Express server for uptime monitoring
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

app.listen(PORT, () => {
  console.log(`Webserver running on port ${PORT}`);
});
