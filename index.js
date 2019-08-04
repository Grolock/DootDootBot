require('dotenv').config()
// Load up the discord.js library
const Discord = require("discord.js");

// This is your client. Some people call it `bot`, some people call it `self`,
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client();

// Here we load the config.json file that contains our token and our prefix values.
const config = require("./config.json");
// config.token contains the bot's token
// config.prefix contains the message prefix.

client.on("ready", () => {
  // This event will run if the bot starts, and logs in, successfully.
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
  // Example of changing the bot's playing game to something useful. `client.user` is what the
  // docs refer to as the "ClientUser".
  client.user.setActivity(`Ready to Doot`);
});

client.on("guildCreate", guild => {
  // This event triggers when the bot joins a guild.
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
});

client.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
});

var BaconMode = true;
var JoshMode = false;
var specialTarget = "";

client.on("message", async message => {
  // This event will run on every single message received, from any channel or DM.

  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if(message.author.bot) return;

    if(message.author.id == 230124931461939200) {

      if(message.content.includes('doot doot dingdance')) {
        var channel = message.channel
        message.delete()

        let dingdance = client.emojis.find(emoji => emoji.name ==='DingDance');

        return channel.send(`${dingdance}`)
      }

      if(message.content.includes('DemoMode toggle')) {
        JoshMode = !JoshMode;

        if(JoshMode) {
          return message.channel.send("DootDootBot has entered Demo Mode")
          client.user.setActivity('Running DemoMode')
        }
        else {
          return message.channel.send("DootDootBot has disabled Demo Mode")
          client.user.setActivity('Ready to Doot')
        }
      }

      if(message.content.includes('BaconMode toggle')) {
        BaconMode = !BaconMode;

        if(BaconMode) {
          return message.channel.send("DootDootBot has initiated Bacon Mode. Watch what you post!")
          client.user.setActivity('Terrorizing Bacon')
        }
        else {
          return message.channel.send("DootDootBot has disabled Bacon Mode. You may now post recklessly!")
          client.user.setActivity('Ready to Doot')
        }
      }

      var mentions = message.mentions;

      if(message.content.includes('doot doot attack')) {
        console.log(mentions)
        console.log(mentions["users"])
        specialTarget = mentions["users"].values().next()['value'].id
        console.log(specialTarget)
      }

      if(message.content.includes('doot doot stop')) {
        specialTarget = ""
      }
    }

  if(message.content.toUpperCase().includes('DOOT')) {
       let dootMoji = client.emojis.find(emoji => emoji.name ==='dootdoot');

       return message.react(dootMoji);
     }

  if(message.content.includes('@here')) {

    let dootMoji = client.emojis.find(emoji => emoji.name ==='dootdoot');

    return message.channel.send(`${dootMoji}${dootMoji}`);
  };

  if(message.content.includes('@everyone')) {

    let dootMoji = client.emojis.find(emoji => emoji.name ==='dootdoot');

    return message.channel.send(`${dootMoji}${dootMoji}${dootMoji}`);
  };

});

client.on("messageUpdate", (message, newMessage) => {

  if(message.embeds.length == 0 && newMessage.embeds.length > 0) {
    console.log("did it work")
  }

  console.log('')
  console.log('')
  console.log('')
  console.log('')
  console.log('')
  console.log('')
  console.log('')
  console.log('')
  console.log('')
  console.log('OLD MESSAGE')
  console.log(message)

  console.log('')
  console.log('')
  console.log('')
  console.log('')
  console.log('')
  console.log('')
  console.log('')
  console.log('')
  console.log('NEW MESSAGE')
  console.log(newMessage)

  if(BaconMode) {
    if(message.author.id == 147453766910607369 || message.author.id == 290193372688154624) {
      var fuckYou = ''
      var lowerMessage = message.author.lastMessage.content.toLowerCase()

      if (lowerMessage.includes('fuck you bot')) {
        fuckYou = '. Fuck you too Bacon'
      }

      return message.channel.send(`${message.author.username} tried to edit: ${message.content}` + fuckYou)
    }
  }
  if(!JoshMode) {
    if(message.author.id == 230124931461939200) {
      return message.channel.send(`${message.author.username} tried to edit: ${message.content}`)
    }
  }
  if(specialTarget != "") {
    if(message.author.id == specialTarget) {
      return message.channel.send(`${message.author.username} tried to edit: ${message.content}`)
    }
  }
})


client.on("messageDelete", (message) => {

  if(BaconMode) {
    if(message.author.id == 147453766910607369 || message.author.id == 290193372688154624) {
      return watchDelete(message);
    }
  }
  if(JoshMode) {
    if(message.author.id == 230124931461939200) {
      return watchDelete(message);
    }
  }
  if(specialTarget != "") {
    if(message.author.id == specialTarget) {
      return watchDelete(message);
    }
  }

});

function watchDelete(message) {
  files = [];

  if(message.attachments) {
    console.log(message.attachments)

    message.attachments.forEach((attachment) => {
      files.push(attachment.proxyURL);
    });
  }

  message.channel.send(`${message.author.username} tried to delete: ${message.content}`);
  return message.channel.send(files);
}

if (process.env.token) {
  client.login(process.env.token);
}
else {
  client.login(config.token)
}
