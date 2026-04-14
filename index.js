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

// --- Get real online member count (including bots) ---
async function getOnlineCount() {
  try {
    const guild = client.guilds.cache.first();
    if (!guild) return 0;

    // ✅ FIX: fetch with presences
    await guild.members.fetch({ withPresences: true });

    const onlineCount = guild.members.cache.filter(
      (member) => member.presence && member.presence.status !== 'offline'
    ).size;

    return onlineCount;
  } catch (err) {
    console.error('Error getting online count:', err);
    return 0;
  }
}

// --- Update bot status ---
async function updateStatus() {
  let toggle = false;

  setInterval(async () => {
    const online = await getOnlineCount();

    if (toggle) {
      await client.user.setPresence({
        activities: [
          {
            name: `Online: ${online} !`,
            type: 3, // Watching
          },
        ],
        status: 'online',
      });
    } else {
      await client.user.setPresence({
        activities: [
          {
            name: `By Y8LBI !`,
            type: 1, // Streaming
            url: 'https://twitch.tv/discord',
          },
        ],
        status: 'online',
      });
    }

    toggle = !toggle;
  }, 5000);
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  setTimeout(updateStatus, 2000);
});

client.login(process.env.BOT_TOKEN);
