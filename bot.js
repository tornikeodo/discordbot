const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, ActivityType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages] });

const token = 'MTI2MTI0MjkyMjU1NzI0NzQ4OQ.GbCWBt.AFog8XdU_r4nbiYaVEzuru5EHXXtgj9NQWvJYs';
const clientId = '1261242922557247489'; // Your bot's client ID
const guildId = '1260910227155325010'; // The ID of your server

client.once('ready', () => {
    console.log('Ready!');
    client.user.setActivity('over VRS', { type: ActivityType.Watching });
});

const commands = [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    new SlashCommandBuilder()
        .setName('freeagent')
        .setDescription('Submit a free agent application.')
        .addStringOption(option => option.setName('username').setDescription('Your username').setRequired(true))
        .addStringOption(option => option.setName('position').setDescription('Position you are applying for').setRequired(true))
        .addStringOption(option => option.setName('about').setDescription('About you').setRequired(true)),
    new SlashCommandBuilder()
        .setName('sign')
        .setDescription('Sign a user to a team.')
        .addUserOption(option => option.setName('user').setDescription('The user to sign').setRequired(true))
        .addStringOption(option => option.setName('teamname').setDescription('The team name').setRequired(true)),
    new SlashCommandBuilder()
        .setName('request')
        .setDescription('Request to join the league.')
        .addStringOption(option => option.setName('username').setDescription('Your username').setRequired(true))
        .addStringOption(option => option.setName('past_experiences').setDescription('Your past experiences').setRequired(true))
        .addStringOption(option => option.setName('how_did_you_find_the_league').setDescription('How did you find the league').setRequired(true))
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'ping') {
        await interaction.reply('Pong!');
    } else if (commandName === 'freeagent') {
        const username = interaction.options.getString('username');
        const position = interaction.options.getString('position');
        const about = interaction.options.getString('about');

        const embed = {
            color: 0x0099ff,
            title: 'Free Agent Application',
            fields: [
                { name: 'Username', value: username },
                { name: 'Position', value: position },
                { name: 'About Me', value: about },
            ],
            timestamp: new Date(),
            footer: {
                text: 'Free Agent Application',
            },
        };

        const channel = client.channels.cache.get('1260910228031930455');
        if (channel) {
            await channel.send({ embeds: [embed] });
            await interaction.reply({ content: 'Application submitted!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'Failed to find the specified channel.', ephemeral: true });
        }
    } else if (commandName === 'sign') {
        const user = interaction.options.getUser('user');
        const teamName = interaction.options.getString('teamname');

        const embed = {
            color: 0x00ff00,
            title: 'New Signing!',
            description: `${user} has been signed to ${teamName}!`,
            timestamp: new Date(),
            footer: {
                text: 'Team Signing',
            },
        };

        const channel = client.channels.cache.get('1260910228031930455');
        if (channel) {
            await channel.send({ embeds: [embed] });
            await interaction.reply({ content: 'Sign message sent!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'Failed to find the specified channel.', ephemeral: true });
        }
    } else if (commandName === 'request') {
        const username = interaction.options.getString('username');
        const pastExperiences = interaction.options.getString('past_experiences');
        const howDidYouFindTheLeague = interaction.options.getString('how_did_you_find_the_league');

        await interaction.deferReply({ ephemeral: true });

        const embed = {
            color: 0x0000ff,
            title: 'League Request',
            fields: [
                { name: 'Username', value: username },
                { name: 'Past Experiences', value: pastExperiences },
                { name: 'How did you find the league?', value: howDidYouFindTheLeague },
            ],
            timestamp: new Date(),
            footer: {
                text: 'League Request',
            },
        };

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('accept')
                    .setLabel('✅')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('reject')
                    .setLabel('❌')
                    .setStyle(ButtonStyle.Danger)
            );

        const channel = client.channels.cache.get('1260910227696390192');
        if (channel) {
            const message = await channel.send({ embeds: [embed], components: [row] });
            await interaction.editReply({ content: 'Request sent!', ephemeral: true });

            const filter = i => i.customId === 'accept' || i.customId === 'reject';
            const collector = message.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async i => {
                if (i.customId === 'accept') {
                    await i.deferUpdate();
                    await interaction.user.send('You have been accepted to the group!');
                } else if (i.customId === 'reject') {
                    await i.deferUpdate();
                    await interaction.user.send('You have been rejected from the group!');
                }
            });

            collector.on('end', collected => {
                console.log(`Collected ${collected.size} interactions.`);
            });
        } else {
            await interaction.editReply({ content: 'Failed to find the specified channel.', ephemeral: true });
        }
    }
});

client.login(token);
