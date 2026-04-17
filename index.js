const { Client, GatewayIntentBits, Partials } = require('discord.js');
const express = require('express');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,   // <-- REQUIRED
    GatewayIntentBits.MessageContent,  // <-- REQUIRED
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

// --- Get stable online member count ---
async function getOnlineCount() {
  try {
    const guild = client.guilds.cache.first();
    if (!guild) return 0;

    if (guild.members.cache.size === 0) {
      await guild.members.fetch();
    }

    let onlineCount = 0;

    guild.members.cache.forEach((member) => {
      const status = member.presence?.status;

      if (status === 'online' || status === 'idle' || status === 'dnd') {
        onlineCount++;
      }
    });

    return onlineCount;
  } catch (err) {
    console.error('Error getting online count:', err);
    return 0;
  }
}

// --- Keep presence cache alive ---
client.on('presenceUpdate', () => {});

// --- Update bot status ---
function updateStatus() {
  setInterval(async () => {
    const online = await getOnlineCount();

    await client.user.setPresence({
      activities: [
        {
          name: `Online ${online} `,
          type: 3,
        },
      ],
      status: 'online',
    });
  }, 15000);
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  setTimeout(updateStatus, 3000);
});

// ------------------------------
// ADDING !online COMMAND BELOW
// ------------------------------

const REQUIRED_ROLE = "1437536343176773733";

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === "!online") {

    if (!message.member.roles.cache.has(REQUIRED_ROLE)) {
      return message.reply("You don't have permission.");
    }

    const count = await getOnlineCount();

    return message.channel.send(`Online Players **${count}**`);
  }
});

client.login(process.env.BOT_TOKEN);
