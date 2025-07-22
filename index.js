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

async function getOnlineCount() {
  try {
    // Get the first guild the bot is in (adjust if needed)
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

async function updateStatus() {
  try {
    let toggle = false;

    setInterval(async () => {
      const onlineCount = await getOnlineCount();

      if (toggle) {
        // Status: Watching - Online: X !
        await client.user.setPresence({
          activities: [{ name: `Watching - Online: ${onlineCount} !`, type: 3 }], // Watching
          status: 'online',
        });
      } else {
        // Status: Streaming - Designed By Y8LBI !
        await client.user.setPresence({
          activities: [{ name: `Streaming - Designed By Y8LBI !`, type: 3 }], // Streaming
          status: 'online',
        });
      }
      toggle = !toggle;
    }, 5000);
  } catch (error) {
    console.error('Error updating status:', error);
  }
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);

  setTimeout(updateStatus, 2000);
});

client.login(process.env.BOT_TOKEN);

// EXPRESS SERVER FOR PORT BINDING
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

app.listen(PORT, () => {
  console.log(`Webserver running on port ${PORT}`);
});
