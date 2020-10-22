// Part that says that this is a Discord bot
const Discord = require('discord.js');
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
var mysql = require('mysql');

// gets credentials
//const config = require('./config.json'); // uncomment this line
const config = require('./config.private.json'); // comment out this line

var serverConfigs = [];
function getServerConfs(){
  // establishes connection to database
  var con = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
  });
  con.connect();
  con.query("SELECT * FROM sudo_server_configs", (error, results, fields) => {
    //console.log(results);
    serverConfigs = results;
  });


  // return new Promise(function(resolve, reject) {
  //   con.query("SELECT * FROM sudo_server_configs", function(error, results, fields) {
  //     if (error){
  //       resolve("SQL_ERROR");
  //     };
  //     resolve(results);
  //     // if (results.length > 0){
  //     //
  //     //   resolve(results);
  //     // } else {
  //     //   resolve("NO_BOARD");
  //     // }
  //   });
  // });


  con.end();
}
function getServerConf(serverId){
  getServerConfs();
  for (var i = 0; i < serverConfigs.length; i++) {
    if (serverConfigs[i].server_id == serverId) {
      return serverConfigs[i];
    }
  }


  // getServerConfs() // checks database collected for machine learning
  // .then((result) => {
  //   for (var i = 0; i < result.length; i++) {
  //     if (result[i].server_id == serverId) {
  //       return result[i];
  //     }
  //   }
  // });


}
//call getServerConfs() every five seconds
const interval = setInterval(function() {
  getServerConfs();
}, 5000);

client.on('ready', () => {
  console.log("Connected as " + client.user.tag);
  client.user.setActivity("sudo [command]", {type: "WATCHING"});
  // List servers the bot is connected to
  console.log("Servers:");
  client.guilds.cache.forEach( (guild) => { console.log(" - " + guild.name) } );
})

client.on('messageDelete', function(message, channel){
  if (!message.partial) {
    //console.log(`It had content: "${message.content}"`);
    var server = getServerConf(message.guild.id);
    //make sure there is an entry for this server before using array or it will crash the bot
    if(server){
      //need to add check for log_channel_id
      console.log(server.log_channel_id);
      client.channels.cache.get(server.log_channel_id).send(`<@${message.member.id}>'s message was deleted from \`${message.channel.name}\`. Message content: \`\`\`${message.content}\`\`\``);
    } else {
      //make a config
    }
  } else {
    //client.channels.cache.get('753649763911729232').send(`A undifined message was deleted`);
  }
});
// console.log(rr.emojiid);
// //var rrindex = "1";
// client.on("messageReactionAdd", (reaction, user) => {
//   if (user && !user.bot && reaction.message.channel.guild && reaction.message.id == rr.messageid){
//     if (reaction.emoji.name == rr.emojiid) {
//       //let i = reaction.message.guild.roles.find(reaction => reaction.name == rolename[]);
//       reaction.message.guild.member(user).roles.add(rr.roleid).catch(console.error);
//     }
//   }
// });
// client.on("messageReactionRemove", (reaction, user) => {
//   if (user && !user.bot && reaction.message.channel.guild && reaction.message.id == rr.messageid){
//     if (reaction.emoji.id == rr.emojiid) {
//       //let i = reaction.message.guild.roles.find(reaction => reaction.name == rolename[]);
//       reaction.message.guild.member(user).roles.remove(rr.roleid).catch(console.error);
//     }
//   }
// });


client.on('message', (receivedMessage) => {
    if (receivedMessage.author == client.user) { // Prevent bot from responding to its own messages
      return;
    }
    if (receivedMessage.content.includes('discord.gg/'||'discordapp.com/invite/')) { //if it contains an invite link
      if(!receivedMessage.member.hasPermission("KICK_MEMBERS")) {
        receivedMessage.delete() //delete the message
        return;
      }
    }
    var messageSplit = receivedMessage.content.split(" "); // Split the message up in to pieces for each space
    messageSplit[0] = messageSplit[0].toLowerCase();
    if (messageSplit[0] == "sudo") { //check if message starts with sudo or Sudo
      processCommand(receivedMessage);
    }
})

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
    case '-rr':
    case 'reactionroles':
    case 'reactionrole':
      ReactionRolesCommand(arguments, receivedMessage);
    break;
    case 'softban':
      softBanCommand(arguments, receivedMessage);
    break;
    case 'ban':
      banCommand(arguments, receivedMessage);
    break;
    case 'kick':
      kickCommand(arguments, receivedMessage);
    break;
    case 'mod':
      modCommand(arguments, receivedMessage);
    break;
    case '-p':
    case 'purge':
      purgeCommand(arguments, receivedMessage);
    break;
    case 'log':
     logCommand(arguments, receivedMessage);
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
        receivedMessage.channel.send("404 ERROR: COMMAND NOT FOUND!");
    }
  } else {
    var helpMessage = "**About:**\n";
    helpMessage += "This bot was made by ``Michael2#1343`` \n";
    helpMessage += "It was made to be a very simple and lightweight moderation bot with only the most important commands \n";
    helpMessage += "**Commands:**\n";
    helpMessage += "Use `sudo list` to list all commands\n";
    helpMessage += "Use `sudo mod` to list all mod commands\n";
    helpMessage += "`sudo help` or `sudo -h` Help Message (This Message)\n";
    //helpMessage += "`sudo -h [command]` Help Message For Command\n";
    //helpMessage += "`sudo list` or `sudo -l` List Commands\n";

    var helpEmbed = new Discord.MessageEmbed()
      .setColor('#577a9a')
      .setTitle("Help")
      .setDescription(helpMessage)
      .setTimestamp()
      .setFooter('This bot was made by Michael2#1343', 'https://discord.com/oauth2/authorize?client_id=747475521302036571&permissions=8&scope=bot');
    receivedMessage.channel.send(helpEmbed);
  }
}

function listCommand(arguments, receivedMessage) {
  var listMessage = "Commands:\n";
  listMessage += "`sudo help` or `sudo -h` Help Message\n";
  //listMessage += "`sudo -h [command]` Help Message For Command\n";
  listMessage += "`sudo list` or `sudo -l` List Commands (This Message)\n";
  listMessage += "`sudo ping` Ping The Bot\n";
  listMessage += "**Mod Commands:**\n";
  listMessage += "Use `sudo mod` to list all mod commands\n";

  var listEmbed = new Discord.MessageEmbed()
    .setColor('#577a9a')
    .setTitle("Help")
    .setDescription(listMessage)
    .setTimestamp()
    .setFooter('This bot was made by Michael2#1343', 'https://weatherstationproject.com/');
  receivedMessage.channel.send(listEmbed);
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
  message += "`sudo -p [number]` or `sudo purge [number]` Delete X number of messages in current channel. Need `DELETE_MESSAGES` permission\n";
  message += "`sudo log set` or `sudo log -s` Set bot mod log channel. Run command in the channel you want to set as log channel. Need `ADMINISTRATOR` permission\n";
  message += "`sudo log disable` or `sudo log -d` Disable bot mod log. Need `ADMINISTRATOR` permission\n";
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
    receivedMessage.channel.send("You do not have permissions to softban " + receivedMessage.mentions.members.first() );
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
      receivedMessage.channel.send("I do not have permissions to ban " + userToBan + " or something else went wrong");
      console.error;
    }
  }
  else {
    receivedMessage.channel.send("You do not have permissions to ban " + receivedMessage.mentions.members.first());
  }
}

function kickCommand(arguments, receivedMessage) {
  if (receivedMessage.member.hasPermission("KICK_MEMBERS")) {
    try {
      var reason = " ";
      for (var i = 1; i < arguments.length; i++) {
        reason += arguments[i];
        reason += " ";
      }
      var userToKick = receivedMessage.mentions.members.first();
      userToKick.send("You were kicked from " + receivedMessage.guild.name + "\n**Reason:**\n```" + reason + "```");
      userToKick.kick();
      receivedMessage.channel.send("Successfully kicked <@" + userToKick + ">");
    } catch {
      receivedMessage.channel.send("I do not have permissions to kick " + userToKick + " or something else went wrong");
      console.error;
    }
  }
  else {
    receivedMessage.channel.send("You do not have permissions to kick " + receivedMessage.mentions.members.first());
  }
}

function purgeCommand(arguments, receivedMessage){
  if (receivedMessage.member.hasPermission("MANAGE_MESSAGES")) {
    var messagecount =+ arguments[0];
    messagecount++;
    let messagecountstr = messagecount.toString();
    receivedMessage.channel.messages.fetch({ limit: messagecountstr })
     .then(messages => {
       receivedMessage.channel.bulkDelete(messages);
       // Logging the number of messages deleted on both the channel and console.
       receivedMessage.channel.send("Total messages deleted including command: " + messagecount).then(message => message.delete(5000));
       console.log("Deletion of messages successful. \n Total messages deleted including command: " + messagecount);
     })
     .catch(err => {
       console.log("Error while doing Bulk Delete");
       console.log(err);
     });
  }
}

function logCommand(arguments, receivedMessage){
  if(arguments[0] == "set" || arguments[0] == "-s"){
    if (receivedMessage.member.hasPermission("ADMINISTRATOR")) {
      var con = mysql.createConnection({
        host: config.host,
        user: config.user,
        password: config.password,
        database: config.database
      });

      let server = receivedMessage.guild.id; // ID of the guild the message was sent in
      let channel = receivedMessage.channel.id; // ID of the channel the message was sent in
      console.log(channel + "  " + server);

      con.connect();
      console.log(getServerConf(server));
      if(!getServerConf(server)){
        //console.log("set");
        con.query("INSERT INTO `sudo_server_configs` (`server_id`, `log_channel_id`) VALUES ('" + server + "', '" + channel + "')", (error, results, fields) => {
          console.log(error);
          receivedMessage.channel.send("Set log channel!").then(message => message.delete(5000));
        });
      }
      else {
        // console.log("UPDATE sudo_server_configs SET log_channel_id='" + channel + "' WHERE server_id='" + server + "')");
        //console.log("update");
        con.query("UPDATE `sudo_server_configs` SET `log_channel_id`='" + channel + "' WHERE `server_id`='" + server + "'", (error, results, fields) => {
          console.log(error);
          receivedMessage.channel.send("Updated log channel!").then(message => message.delete(5000));
        });
      }
      con.end();
    }
  }


  if(arguments[0] == "disable" || arguments[0] == "-d"){
    if (receivedMessage.member.hasPermission("ADMINISTRATOR")) {
      var con = mysql.createConnection({
        host: config.host,
        user: config.user,
        password: config.password,
        database: config.database
      });

      let server = receivedMessage.guild.id; // ID of the guild the message was sent in
      let channel = receivedMessage.channel.id; // ID of the channel the message was sent in
      console.log(channel + "  " + server);

      con.connect();
      //console.log(getServerConf(server));
      // console.log("clear");
      con.query("DELETE FROM `sudo_server_configs` WHERE `server_id` = '" + server + "'", (error, results, fields) => {
        console.log(error);
        receivedMessage.channel.send("Removed log channel!").then(message => message.delete(5000));
      });
      con.end();
    }
  }

}

client.login(config.token);
