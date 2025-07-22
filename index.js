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

async function getOnlineCount() {
  try {
    const guild = await client.guilds.fetch(SERVER_ID);
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
    const botMember = (await client.guilds.fetch(SERVER_ID)).members.cache.get(client.user.id);
    if (botMember) await botMember.setNickname('STATUS');

    let toggle = false;

    setInterval(async () => {
      const onlineCount = await getOnlineCount();

      if (toggle) {
        // Watching | Online: X !
        await client.user.setPresence({
          activities: [{ name: `Watching | Online: ${onlineCount} !`, type: 3 }],
          status: 'online',
        });
      } else {
        // Streaming Designed By Y8LBI !
        await client.user.setPresence({
          activities: [{ name: `Designed By Y8LBI !`, type: 4, url: 'https://twitch.tv/Y8LBI' }],
          status: 'online',
        });
      }

      toggle = !toggle;
    }, 5000); // Switch every 5 seconds
  } catch (error) {
    console.error('Error updating status:', error);
  }
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  setTimeout(updateStatus, 2000);
});

client.login(process.env.BOT_TOKEN);
