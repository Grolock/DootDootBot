require('dotenv').config()
const anilist = require('anilist-node');
const Anilist = new anilist();
// Load up the discord.js library
const Discord = require("discord.js");
const Ascii = require('ascii-pixels');
const fs = require('fs');
const AWS = require('aws-sdk')
let request = require(`request`);


var bucket = process.env.S3_BUCKET_NAME

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

let soundDict = {
    whatyouget : 'play.mp3'
}

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

  if(message.content.toLowerCase().includes('doot doot play')) {
      let keyword = message.content.substring(14, message.content.length).trim()
      let file = 'sound/' + keyword

      console.log(file)
      console.log(keyword)

      if (fs.existsSync(file)) {
         playFile(file, message)
      }
      else {
        readFromS3(file)
        if (fs.existsSync(file)) {
          playFile(file, message)
        }
      }


  }

  if(message.content.toLowerCase().includes('doot doot thanks')) {
      playFile('sound/welcome.mp3', message)
  }

  if(message.content.toLowerCase().includes('doot doot load')) {
      if (message.attachments.first()) {
        saveFile(message)
      }
      else {
        loadExisting(message)
      }
  }

  if (message.content.toLowerCase().includes('doot doot list')) {
    let returnMessage = 'Available Words:\n'
     Object.keys(soundDict).forEach(function (item) {
        returnMessage += item + " " + soundDict[item] + "\n"
     })

     return message.channel.send(returnMessage)
  }


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

       // if(message.attachments) {
       //   message.react(dootMoji);
       //   var test = message.attachments.first().proxyURL
       //   const fileUrl = 'file://' + test;
       //   var final = fs.readFileSync(fileUrl)
       //
       //   var imageData = jpeg.decode(final)
       //
       //   var ascii = Ascii(imageData)
       //
       //   return message.channel.send(imageData);
       // }


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

  // if(message.content.toLowerCase().includes('when does') && message.content.toLowerCase().includes('come out')) {
  //   let id = message.content.substring(10, 16).trim()
  //   console.log(id)
  //   getAnime(parseInt(id), message)
  // }

  if(message.content.toLowerCase().includes('food wars')) {
      getAnime(114043, message)
  }

  if(message.content.toLowerCase().includes('when does') && message.content.toLowerCase().includes('come out')) {
    let end = message.content.indexOf('please')
    let searchTerm = message.content.substring(10, end - 1).trim()
    getAnimeByName(searchTerm, message)
  }

});

function getAnimeByName(searchTerm, message) {
  Anilist.search('anime', searchTerm, 1, 1).then(data => {
    console.log(data.media[0].id)
    getAnime(data.media[0].id, message, data.media[0].title)
  });
}


function playFile(path, message) {
  if (message.member.voiceChannel) {
    // console.log(message.guild)
    // if (message.guild.voiceConnection) {
    //     console.log('connection')
        message.member.voiceChannel.join().then(connection => {
           console.log(path)
           let broadcast = client.createVoiceBroadcast()
           broadcast.playFile(path)
           connection.playBroadcast(broadcast, {volume: 1})

           broadcast.on('end', () => {
              broadcast.destroy()
              message.member.voiceChannel.leave()
           })
        })
    // }
  }
}

function saveFile(message) {
  if (message.attachments.first()) {
      let end = message.content.length
      let keyword = message.content.substring(15, end).trim()

      request.get(message.attachments.first().url).pipe(fs.createWriteStream('sound/' + keyword + '.mp3'))

      saveToS3('sound/' + keyword + '.mp3', 'sound/' + keyword + '.mp3')
  }
}

function loadExisting(message) {
    let end = message.content.length
    let keyword = message.content.substring(15, end).trim()
    soundDict[keyword] = keyword + '.mp3'
}

function saveToS3(fileUrl, fileName) {

    fs.readFile(fileUrl, (err, data) => {
        if (err) throw err

        const params = {
          Bucket: bucket,
          Key: fileName,
          Body: JSON.stringify(data, null, 2)
        }

        s3.upload(params, function (s3Err, data) {
          if (s3Err) throw s3
          console.log('maybe Uploaded')
        })
    })
}

function readFromS3(url) {
    const params = {
      Bucket: bucket,
      Key: url
    }

    s3.getObject(params).createReadStream().pipe(fs.createWriteStream(url))
}

function getAnime(ID, message, title) {
  Anilist.media.anime(ID).then(data => {
      let date = data.nextAiringEpisode.timeUntilAiring;
      let days = Math.floor(date / (60 * 60 * 24))
      date = date - (days * (60 * 60 * 24))
      let hours =  Math.floor(date / (60 * 60))
      date = date - (hours * (60 * 60))
      let minutes =  Math.floor(date / (60))
      date = date - (minutes * (60))
      let seconds = date

    if (title != undefined && title.length > 0) {
      return message.channel.send(`${title} Will release a new episode in\n${days} Days\n${hours} Hours\n${minutes} Minutes\n${seconds} Seconds`)
    }

    if (message.mentions.users.array().length > 0) {
      person = message.mentions.users.first()
      return person.send(`${days} Days\n${hours} Hours\n${minutes} Minutes\n${seconds} Seconds`)
    }

    if (days <= 1)
    return message.channel.send(`**${days} Days\n${hours} Hours\n${minutes} Minutes\n${seconds} Seconds**`)

    return message.channel.send(`${days} Days\n${hours} Hours\n${minutes} Minutes\n${seconds} Seconds`)
  });
}

client.on("messageUpdate", (message, newMessage) => {


 if (!(message.embeds.length == 0 && newMessage.embeds.length > 0))
  {
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
    if(JoshMode) {
      if(message.author.id == 230124931461939200) {
        return message.channel.send(`${message.author.username} tried to edit: ${message.content}`)
      }
    }
    if(specialTarget != "") {
      if(message.author.id == specialTarget) {
        return message.channel.send(`${message.author.username} tried to edit: ${message.content}`)
      }
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
