require('dotenv').config();
const { Client, GatewayIntentBits, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { REST } = require('@discordjs/rest');
const express = require('express');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = '1389383683361996800'; // your bot's client ID
const GUILD_ID = '1386044830290804938';  // your server ID
const OWNER_ID = '849685727721422858';   // your Discord ID

// Slash command setup
const commands = [
  new SlashCommandBuilder()
    .setName('say')
    .setDescription('Send a message to a channel with optional file or gif')
    .addStringOption(option =>
      option.setName('content')
        .setDescription('📝 The content of the message you want to send.')
        .setRequired(false))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('📍 The channel where you want to send the message.')
        .setRequired(false))
    .addAttachmentOption(option =>
      option.setName('file')
        .setDescription('📎 A file you want to attach (image/video).')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('gif')
        .setDescription('🎞️ A GIF link to include.')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

// Register slash commands
(async () => {
  try {
    console.log('Registering slash commands...');
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log('✅ Commands registered!');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
})();

client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'say') return;

  const content = interaction.options.getString('content') || '';
  const channel = interaction.options.getChannel('channel') || interaction.channel;
  const file = interaction.options.getAttachment('file');
  const gif = interaction.options.getString('gif');

  const messageOptions = {};
  if (content) messageOptions.content = content;
  if (file) messageOptions.files = [file.url];
  if (gif) messageOptions.content = (messageOptions.content || '') + `\n${gif}`;

  try {
    await channel.send(messageOptions);
    await interaction.reply({ content: `✅ Message sent in ${channel}`, ephemeral: true });

    // DM owner with simple format
    const ownerUser = await client.users.fetch(OWNER_ID);
    const userTag = interaction.user.tag;
    const channelName = channel.name || 'unknown';

    await ownerUser.send(
      `User ${userTag} used /say in #${channelName} with content: "${content || 'None'}"`
    );
  } catch (error) {
    console.error('Failed to send message or DM:', error);
    if (!interaction.replied) {
      await interaction.reply({ content: '❌ Failed to send the message.', ephemeral: true });
    }
  }
});

client.login(TOKEN);

// Express server for uptime (Render + UptimeRobot)
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot is running!'));
app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});
