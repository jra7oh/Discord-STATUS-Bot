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

// ---- Webserver for Uptime Robot ----
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

app.listen(PORT, () => {
  console.log(`Webserver running on port ${PORT}`);
});

// ---- Get online members (not offline) ----
async function getOnlineCount() {
  try {
    const guild = client.guilds.cache.first();
    if (!guild) return 0;

    await guild.members.fetch();

    const onlineCount = guild.members.cache.filter(member =>
      member.presence?.status && member.presence.status !== 'offline'
    ).size;

    return onlineCount;
  } catch (error) {
    console.error('Error fetching online count:', error);
    return 0;
  }
}

// ---- Bot status updater ----
async function updateStatus() {
  try {
    let toggle = false;

    setInterval(async () => {
      const onlineCount = await getOnlineCount();

      if (toggle) {
        await client.user.setPresence({
          activities: [{ name: `Online: ${onlineCount} !`, type: 3 }], // Type 3 = Watching
          status: 'online',
        });
      } else {
        await client.user.setPresence({
          activities: [{ name: `Designed By Y8LBI !`, type: 0 }], // Type 0 = Playing (but you control the text)
          status: 'online',
        });
      }

      toggle = !toggle;
    }, 5000); // Update every 5 seconds
  } catch (error) {
    console.error('Error updating status:', error);
  }
}

// ---- When bot is ready ----
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  setTimeout(updateStatus, 2000);
});

client.login(process.env.BOT_TOKEN);
