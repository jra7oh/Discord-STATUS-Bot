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

    // Count online members (excluding offline)
    const onlineCount = guild.members.cache.filter(
      member => member.presence?.status !== 'offline' && !member.user.bot
    ).size;

    // Set bot nickname
    const botMember = guild.members.cache.get(client.user.id);
    if (botMember) {
      await botMember.setNickname('69 STATUS');
    }

    // Set custom status to "Online: X"
    await client.user.setPresence({
      activities: [{ name: `Online: ${onlineCount}`, type: 0 }], // type 0 = Playing
      status: 'online',
    });

    console.log(`Status updated: Online: ${onlineCount}`);
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