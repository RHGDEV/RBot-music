const Discord = require("discord.js");
const blacklist = require("./blacklist.json");
const YTDL = require("ytdl-core")
const FFMPEG = require("ffmpeg")
const prefix = process.env.PREFIX
const mastid = process.env.MASTER_ID


var bot = new Discord.Client();
var servers = {};

function play(connect, msg) {
  var server = servers[msg.guild.id];
  console.log(`[PLER] Now started playing music in ${msg.guild.name}`)
  server.dispatcher = connect.playStream(YTDL(server.queue[0], {filter: "audioonly"}));

  server.queue.shift();

  server.dispatcher.on("end", function() {
    if (server.queue[0]) play(connect, msg)
    else connect.disconnect();  console.log(`[PLER] Now stopped playing music in ${msg.guild.name}`)
  })
}
function removedat(msg) {
 if (msg.channel.type === "dm") return;
 if (!msg.deletable){
   console.log(`[DEL] Couldn't remove a message in ${msg.guild.name}`)
   return;
 }
 msg.delete();
  console.log(`[DEL] Removed a message in ${msg.guild.name}`)
}

function errorhandle(err){
  console.log(`[ERROR] ${err}`)
}

console.log(`Now loading RBot Music...`)

bot.on("message", function(message){
  if (message.author.equals(bot.user))  return;
 // if (message.author.equals(bot.user))  return;
  if (!message.author.id == mastid){
    if (message.channel.type === "dm") return;;
  }
  if (!message.content.startsWith(prefix)) return;

  var args = message.content.substring(prefix.length).split(" ");

  switch (args[0].toLowerCase()) {
    case "help":
        removedat(message)
        let em = new Discord.RichEmbed()
          .setColor("#FFFFFF")
          .setTitle("REAAALY Jeff? Really?")
          .setDescription("Fine I'm simply a simple musicbot by RHG#0822")
          .addField(`${prefix}help`, `Sends this message.`)
          .addField(`${prefix}play (Youtube link)`, `Plays a song in the current channel.`)
          .addField(`${prefix}skip`, `Skips the current song`)
          .addField(`${prefix}8ball (Question)`, `I just got bored okay..`)
          .setFooter("RBot Music | A simple music bot", bot.user.avatarURL)

          message.channel.send({embed: em});
        break;

 
    case "play":
        if (!args[1]) {
          removedat(message)
          message.channel.send(":x: Umm where's the link?")
          break;
        }
        if (!YTDL.validateLink(args[1])) {
          removedat(message)
          message.channel.send(":x: Are you sure thats a Youtube link?")
          break;
        };
        if (!message.member.voiceChannel) {
          removedat(message)
          message.channel.send(":x: Oh I forgot.. You need to be in a voice channel!")
          break;
        }
        if (!message.member.voiceChannel.joinable || message.member.voiceChannel.full){
          removedat(message)
          message.channel.send(":x: Looks like I cannot join that voice channel.")
          break;
        }
        if(!servers[message.guild.id]) servers[message.guild.id] = {
          queue: []
        };

        console.log(`[QUEUE] Added music to ${message.guild.name}'s queue!' `)

        var server = servers[message.guild.id]

        server.queue.push(args[1]);

        if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection) {
          play(connection, message);
        })
        removedat(message)
        break;
    case "skip":
        removedat(message)
        var server = servers[message.guild.id];
        if (server.dispatcher) server.dispatcher.end()
        break;
    case "stop":
        removedat(message)
        var server = servers[message.guild.id];
        if (message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
        break;
    case "leave":
        removedat(message)
        if (!message.member.voiceChannel) {
          message.channel.send(":x: Umm you need to join a channel to be able to use this command...")
          break;
        };;
        if (!message.guild.voiceConnection.channel.name == message.member.voiceChannel.name){
          message.channel.send(":x: Umm you need to join my channel to use this.")
          break;
        };
        if (message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
        break;
    case "join":
        removedat(message)

        if (!message.member.voiceChannel) {
          message.channel.send(":x: Umm you need to join a channel to be able to use this command...")
          break;
        };;
        if (!message.member.voiceChannel.joinable || message.member.voiceChannel.full){
          message.channel.send(":x: Looks like I cannot join that voice channel.")
          break;
        }
        message.member.voiceChannel.join()
        break;
     case "kill":
        if (!message.author.id == mastid){
          console.log(`[KILL ATTEMPT] ${message.author.username}#${message.author.discriminator} | ${message.guild.name} | ${message.channel.name}`);
          break;
        }
        removedat(message)
        let killem = new Discord.RichEmbed()
          .setColor("#FFFFFF")
          .setTitle(`${message.author.username}#${message.author.discriminator}`)
          .setDescription("RBot music will now shutdown until reopened")
          .setTimestamp()

          //message.channel.send({embed: killem});

          bot.destroy().then(function(){
            console.log(``)
            console.log(`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`);
            console.log(`~~~~~~~~~~~~~ OWNER SHUTDOWN ~~~~~~~~~~~~~`);
            console.log(`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`);
          })
          break;
     case "l":
          if (!message.author.id == mastid){
            console.log(`[LEAVE ATTEMPT] ${message.author.username}#${message.author.discriminator} | ${message.guild.name} | ${message.channel.name}`);
            break;
          }
          removedat(message)
          bot.guilds.forEach(async (guil, id) => {
              if(guil.id == args[1]){
                guil.leave()
                return;
              }
            });
          console.log(`[MANUAL LEAVE] Guild not found!`);
          message.channel.send("Guild wasn't found in my list!")
          break;
     default:
        removedat(message)
        message.channel.send(":x: Are you sure you typed that correctly?")
  };
  //message.delete();
});

bot.on("error", function(err){
  console.log(`[ERROR] ${err}`)
});

bot.on("ready", function(){
  // Main Print
  console.log(`~~~~~~~~~~~~~  RBOT MUSIC  ~~~~~~~~~~~~~~`);
  console.log(``);
  console.log(`~ Bot Name: ${bot.user.username}`);
  console.log(`~ Prefix: ${prefix}`);
  console.log(`~ Serving: ${bot.guilds.array().length} guild(s)`)
  console.log(`~ Creator id: ${mastid}`)
  console.log(``);
  console.log(`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`);
  console.log(`RBOT MUSIC IS READY!`);
  console.log(``);
  // Set game
  bot.user.setGame(prefix + "help");

  //blacklist helper
  bot.guilds.forEach(async (guild, id) => {
    blacklist.forEach(async (id) => {
      if (guild.id == id){
        console.log(`[LEFT] ${guild.name}, ${guild.id} due to blacklist`)
        guild.leave()
        return;
      };
    });
  });
});

bot.on('guildDelete', guild => {
  console.log(``)
  console.log(`[LEAVE] I have been kicked out of ${guild.name} | ${guild.id}`);
  console.log(`~~~~~~`);
  console.log(``)
});

bot.on('guildCreate', guild => {
  blacklist.forEach(async (id) => {
    if (guild.id == id){
      console.log(`[LEFT] ${guild.name}, ${guild.id} due to blacklist`)
      guild.leave()
      return;
    };
  });
  console.log(``)
  console.log(`[JOIN] I have been invited to ${guild.name} | ${guild.id}`);
  guild.channels.random().createInvite({"maxAge": 0, "maxUses": 1, "unique": true}).then(function(invite){
    console.log(`[INVITE] ${invite}`)
    console.log(`~~~~~~`);
    console.log(``)
    console.log(``)
  });

  guild.owner.user.createDM().then(function(){
    let joinem = new Discord.RichEmbed()
      .setColor("#FFFFFF")
      .setTitle(`${guild.owner.user.username}, I have been welcomed into ${guild.name}`)
      .setDescription("I'm simply a simple musicbot by RHG#0822")
      .addField(`${config.prefix}help`, `Sends a help message.`)
      .addField(`${config.prefix}play (Youtube link)`, `Plays a song in the current channel.`)
      .addField(`${config.prefix}skip`, `Skips the current song`)
      .addField(`${config.prefix}8ball (Question)`, `I just got bored okay..`)
      .setFooter("RBot Music | A simple music bot", bot.user.avatarURL)

    guild.owner.user.dmChannel.send({embed: joinem});
  });
});

bot.login(process.env.BOT_TOKEN)
