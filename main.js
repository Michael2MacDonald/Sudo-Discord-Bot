// Part that says that this is a Discord bot
const Discord = require('discord.js');
const client = new Discord.Client({ partials: ['MESSAGE', 'REACTION'] });

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

client.on("messageReactionAdd", (reaction, user) => {//729743124079050807 addRole('729393625246597192')
  console.log("clicked");
  if (user && !user.bot && reaction.message.channel.guild && reaction.message.id == "729743124079050807"){
    console.log("clicked");
    if (reaction.emoji.name == '🌦️') {
      //let i = reaction.message.guild.roles.find(reaction => reaction.name == rolename[]);
      reaction.message.guild.member(user).roles.add('729393625246597192').catch(console.error);
      console.log("clicked");
    }
  }
});

client.on("messageReactionRemove", (reaction, user) => {//729743124079050807 addRole('729393625246597192')
  console.log("clicked");
  if (user && !user.bot && reaction.message.channel.guild && reaction.message.id == "729743124079050807"){
    console.log("clicked");
    if (reaction.emoji.name == '🌦️') {
      //let i = reaction.message.guild.roles.find(reaction => reaction.name == rolename[]);
      reaction.message.guild.member(user).roles.remove('729393625246597192').catch(console.error);
      console.log("clicked");
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
    case 'softban':
      softBanCommand(arguments, receivedMessage);
    break;
    case 'ban':
      banCommand(arguments, receivedMessage);
    break;
    case 'mod':
      modCommand(arguments, receivedMessage);
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
      .setColor('#577a9a')
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
    .setColor('#577a9a')
    .setTitle("Help")
    .setDescription(helpMessage)
    .setTimestamp()
    .setFooter('This bot was made by Michael2#1343', 'https://weatherstationproject.com/');
  receivedMessage.channel.send(helpEmbed);
}

function pingCommand(arguments, receivedMessage) {
  var embed = new Discord.MessageEmbed()
    .setTitle('Retrieving your pong...')
    .setColor('#577a9a')
    .setTimestamp(new Date());
    //.setFooter(client.footer, icon)
  receivedMessage.channel.send(embed).then(m => {
    embed.setTitle(`🏓 Pong! Round-trip latency is ${m.createdTimestamp - receivedMessage.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms.`);
    m.edit(embed);
  })
}

function modCommand(arguments, receivedMessage) {
  var message = "Commands:\n";
  message += "`sudo mod` Mod Message (This Message)\n";
  message += "`sudo softban [@user] [reason]` ban then unban to delete all users messages. Need KICK_MEMBERS permission\n";
  message += "`sudo ban [@user] [reason]` ban. Need BAN_MEMBERS permission\n";
  var embed = new Discord.MessageEmbed()
    .setColor('#577a9a')
    .setTitle("Help")
    .setDescription(message)
    .setTimestamp()
    .setFooter('This bot was made by Michael2#1343', 'https://weatherstationproject.com/');
  receivedMessage.channel.send(embed);
}

function softBanCommand(arguments, receivedMessage) {
  if (receivedMessage.member.hasPermission("KICK_MEMBERS")) {
    try {
      var reason = " ";
      for (var i = 1; i < arguments.length; i++) {
        reason += arguments[i];
        reason += " ";
      }
      var userToSoftBan = receivedMessage.mentions.members.first();
      userToSoftBan.ban();
      receivedMessage.guild.members.unban(userToSoftBan);
      userToSoftBan.send("You were banned from " + receivedMessage.guild.name + "\n**Reason:**\n```" + reason + "```");
      receivedMessage.channel.send("Successfully Soft Banned <@" + userToSoftBan + ">");
    } catch {
      receivedMessage.channel.send("I do not have permissions to softban " + userToSoftBan + " or something else went wrong");
      console.error;
    }
  }
  else {
    receivedMessage.channel.send("You do not have permissions to soft ban " + receivedMessage.mentions.members.first() );
  }
}

function banCommand(arguments, receivedMessage) {
  if (receivedMessage.member.hasPermission("BAN_MEMBERS")) {
    try {
      var reason = " ";
      for (var i = 1; i < arguments.length; i++) {
        reason += arguments[i];
        reason += " ";
      }
      var userToBan = receivedMessage.mentions.members.first();
      userToBan.ban();
      userToBan.send("You were banned from " + receivedMessage.guild.name + "\n**Reason:**\n```" + reason + "```");
      receivedMessage.channel.send("Successfully Banned <@" + userToBan + ">");
    } catch {
      receivedMessage.channel.send("I do not have permissions to softban " + userToBan + " or something else went wrong");
      console.error;
    }
  }
  else {
    receivedMessage.channel.send("You do not have permissions to soft ban " + receivedMessage.mentions.members.first());
  }
}

client.login(config.token);
