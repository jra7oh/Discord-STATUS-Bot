const { Client, GatewayIntentBits, Partials } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
  partials: [Partials.GuildMember],
});

const SERVER_ID = '1386044830290804938'; // Your server ID

async function updateStatus() {
  try {
    const guild = await client.guilds.fetch(SERVER_ID);
    await guild.members.fetch(); // Fetch all members to cache

    // Count all members (bots + users) whose presence status is not offline
    const onlineCount = guild.members.cache.filter(member => 
      member.presence?.status && member.presence.status !== 'offline'
    ).size;

    // Set bot nickname to "STATUS"
    const botMember = guild.members.cache.get(client.user.id);
    if (botMember) {
      await botMember.setNickname('STATUS');
    }

    // Set bot presence status with the count
    await client.user.setPresence({
      activities: [{ name: `| Online: ${onlineCount}`, type: 0 }], // Playing
      status: 'online',
    });

    console.log(`Status updated: | Online: ${onlineCount}`);
  } catch (error) {
    console.error('Error updating status:', error);
  }
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);

  updateStatus();
  setInterval(updateStatus, 30 * 1000);
});

client.login(process.env.BOT_TOKEN);
