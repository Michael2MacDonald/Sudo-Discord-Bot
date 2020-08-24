// Part that says that this is a Discord bot
const Discord = require('discord.js');
const client = new Discord.Client();

const config = require('./config.json'); // gets credentials

client.on('ready', () => {
    console.log("Connected as " + client.user.tag);
    client.user.setActivity("sudo [command]", {type: "WATCHING"});
    // List servers the bot is connected to
    console.log("Servers:");
    client.guilds.cache.forEach( (guild) => { console.log(" - " + guild.name) } );
})

client.on('message', (receivedMessage) => {
    if (receivedMessage.author == client.user) { // Prevent bot from responding to its own messages
      return;
    }

    var messageSplit = receivedMessage.content.split(" "); // Split the message up in to pieces for each space
    messageSplit[0] = messageSplit[0].toLowerCase();
    if (messageSplit[0] == "sudo") { //check if message starts with sudo or Sudo
      processCommand(receivedMessage);
    }
})

client.on('messageReactionAdd', async (reaction, user) => {
	// When we receive a reaction we check if the reaction is partial or not
	if (reaction.partial) {
		// If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
		try {
			await reaction.fetch();
		} catch (error) {
			console.log('Something went wrong when fetching the message: ', error);
			// Return as `reaction.message.author` may be undefined/null
			return;
		}
  }

  var reactionMade = reaction.emoji.name;

  if (user.bot) { // checks if the reaction was to one of the messages made by a bot
    return;
  } else {
    if (reaction.message.embeds[0].length > 0) { // checks if the message that is being reacted to is an embed
      if (reaction.message.embeds[0].title.startsWith("Suggestion")) { // checks if the message being reacted to is a suggestion
        switchSuggestion(reaction, user, reactionMade);
      }
    }
  }
});

function processCommand(receivedMessage) { // gets the command and processes what needs to be done
  var fullCommand = receivedMessage.content.substr(5); // Remove the leading exclamation mark
  var splitCommand = fullCommand.split(" "); // Split the message up in to pieces for each space
  var primaryCommand = splitCommand[0] // The first word directly after the exclamation is the command
  var arguments = splitCommand.slice(1) // All other words are arguments/parameters/options for the command

  primaryCommand = primaryCommand.toLowerCase(); // makes primary command lowercase so that we can detect if someone makes a command lIkE tHiS

  console.log("Command received: " + primaryCommand);
  console.log("Arguments: " + arguments); // There may not be any arguments

  switch (primaryCommand) {
    case '-h':
    case 'help':
      helpCommand(arguments, receivedMessage);
    break;
    case '-l':
    case 'list':
      listCommand(arguments, receivedMessage);
    break;
    case 'ping':
      pingCommand(arguments, receivedMessage);
    break;
    default:
      receivedMessage.channel.send("I don't understand the command. Try `sudo help`, `sudo -h` or `sudo -h [command]`")
  }
}

function helpCommand(arguments, receivedMessage) {
  if (arguments.length > 0) {
    var difficultArgument = arguments[0];
    switch (difficultArgument) {
      case 'help':
        receivedMessage.channel.send("`sudo help`, `sudo -h`, or `sudo -h [command]`");
      break;
      case 'list':
        receivedMessage.channel.send("`sudo list` or `sudo -l`");
      break;
      case 'ping':
        receivedMessage.channel.send("`sudo ping`");
      break;
      default:
        receivedMessage.channel.send("I do not know this command.");
    }
  } else {
    var helpMessage = "**About:**\n";
    helpMessage += "This bot was made by ``Michael2#13431`` \n";
    helpMessage += "**Commands:**\n";
    helpMessage += "`sudo help` or `sudo -h` Help Message (This Message)\n";
    helpMessage += "`sudo -h [command]` Help Message For Command\n";
    helpMessage += "`sudo list` or `sudo -l` List Commands\n";
    helpMessage += "`sudo ping` Ping The Bot";
    var helpEmbed = new Discord.MessageEmbed()
      .setColor('#5a7c82')
      .setTitle("Help")
      .setDescription(helpMessage)
      .setTimestamp()
      .setFooter('This bot was made by Michael2#1343', 'https://weatherstationproject.com/');
    receivedMessage.channel.send(helpEmbed);
  }
}

function listCommand(arguments, receivedMessage) {
  var helpMessage = "Commands:\n";
  helpMessage += "`sudo help` or `sudo -h` Help Message\n";
  helpMessage += "`sudo -h [command]` Help Message For Command\n";
  helpMessage += "`sudo list` or `sudo -l` List Commands (This Message)\n";
  helpMessage += "`sudo ping` Ping The Bot\n";
  var helpEmbed = new Discord.MessageEmbed()
    .setColor('#5a7c82')
    .setTitle("Help")
    .setDescription(helpMessage)
    .setTimestamp()
    .setFooter('This bot was made by Michael2#1343', 'https://weatherstationproject.com/');
  receivedMessage.channel.send(helpEmbed);
}

function pingCommand(arguments, receivedMessage) {
  // var placeMessage = "Pong";
  // var placeEmbed = new Discord.MessageEmbed()
  //   .setColor('#90ee90')
  //   .setTitle("Ping")
  //   .setDescription(placeMessage);
  // receivedMessage.channel.send(placeEmbed);

  var embed = new Discord.MessageEmbed()
    .setTitle('Retrieving your pong...')
    .setColor('#5a7c82')
    .setTimestamp(new Date())
    //.setFooter(client.footer, icon)
  receivedMessage.channel.send(embed).then(m => {
    embed.setTitle(`🏓 Pong! Round-trip latency is ${m.createdTimestamp - receivedMessage.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms.`)
    m.edit(embed)
  })
}
client.login(config.token);
