const { Client, GatewayIntentBits, Partials } = require('discord.js');
const express = require('express');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
  partials: [Partials.GuildMember],
});

// --- Web server for UptimeRobot ---
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`);
});

// --- Get real online member count ---
async function getOnlineCount() {
  try {
    const guild = client.guilds.cache.first(); // keep simple
    if (!guild) return 0;

    await guild.members.fetch({ withPresences: true });

    const onlineCount = guild.members.cache.filter(
      (m) => ['online', 'idle', 'dnd'].includes(m.presence?.status)
    ).size;

    return onlineCount;
  } catch (err) {
    console.error('Error getting online count:', err);
    return 0;
  }
}

// --- Update bot status (ONLY online count) ---
function updateStatus() {
  setInterval(async () => {
    const online = await getOnlineCount();

    await client.user.setPresence({
      activities: [
        {
          name: `Online: ${online} !`,
          type: 3, // Watching
        },
      ],
      status: 'online',
    });
  }, 5000);
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  setTimeout(updateStatus, 2000);
});

client.login(process.env.BOT_TOKEN);
