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

    // Debug logs
    const membersWithPresence = guild.members.cache.filter(m => m.presence).size;
    const onlineCount = guild.members.cache.filter(
      member =>
        member.presence && // ✅ ensure presence exists
        member.presence.status !== 'offline' &&
        !member.user.bot
    ).size;

    console.log(`Guild total members: ${guild.memberCount}`);
    console.log(`Fetched members: ${guild.members.cache.size}`);
    console.log(`Members with presence: ${membersWithPresence}`);
    console.log(`Online members (not offline): ${onlineCount}`);

    // Set bot nickname to "STATUS"
    const botMember = guild.members.cache.get(client.user.id);
    if (botMember) {
      await botMember.setNickname('STATUS');
    }

    // Set custom status to "Playing | Online: X"
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

  // Initial status update
  updateStatus();

  // Update every 30 seconds
  setInterval(updateStatus, 30 * 1000);
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
