const Discord = require('discord.js')
const client = new Discord.Client()
const config = require('./config.json')
const grades = require('./grade.json')
const uwuifier = require('uwuify')
const uwuify = new uwuifier()
const prefix = config.prefix

client.on('ready', async () => {
  console.log(`Logged in as: ${client.user.tag}`)
  await client.user.setActivity('for reactions', { type: 'WATCHING' })

  await config.reactions.forEach(async obj => {
    await client.guilds.cache
      .get(obj.guild)
      .channels.cache.get(obj.channel)
      .messages.fetch(obj.message)
      .then(async message => message.react(obj.reaction))
      .catch(err => {
        console.error(err)
      })
  })
})

config.reactions.forEach(reactionListener => {
  listener(reactionListener)
})

async function listener(obj) {
  client.on('messageReactionAdd', async (reaction, user) => {
    if (
      (reaction.emoji.name == obj.reaction || reaction.emoji.id == obj.reaction) &&
      reaction.message.id == obj.message &&
      !user.bot
    ) {
      reaction.message.guild.members.fetch(user.id).then(async member => {
        await obj.roles.forEach(role => {
          member.roles.add(role).catch(err => {
            console.error(err)
            reaction.message.guild.roles
              .fetch(obj.role)
              .then(role =>
                client.users.cache.get(member.id).send(`Failed to add \`${role.name}\` role\nContact Mebrooks01#3354`)
              )
          })
        })
        reaction.message.guild.roles
          .fetch(obj.roles[0])
          .then(role => client.users.cache.get(member.id).send(`Added \`${role.name}\``))
      })
    }
  })

  client.on('messageReactionRemove', async (reaction, user) => {
    if (
      (reaction.emoji.name == obj.reaction || reaction.emoji.id == obj.reaction) &&
      reaction.message.id == obj.message &&
      !user.bot
    ) {
      reaction.message.guild.members.fetch(user.id).then(async member => {
        await obj.roles.forEach(role => {
          member.roles.remove(role).catch(err => {
            console.error(err)
            reaction.message.guild.roles
              .fetch(obj.role)
              .then(role =>
                client.users.cache
                  .get(member.id)
                  .send(`Failed to remove \`${role.name}\` role\nContact Mebrooks01#3354`)
              )
          })
        })

        reaction.message.guild.roles
          .fetch(obj.roles[0])
          .then(role => client.users.cache.get(member.id).send(`Removed \`${role.name}\``))
      })
    }
  })
}

// Commands
const clean = text => {
  if (typeof text === 'string')
    return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203))
  else return text
}
client.on('message', message => {
  if (message.author.bot) return
  msg = message.content.toLowerCase()

  if (msg === 'uwu' || msg === 'owo') {
    message.reply('OWO I wuv youwu')
  }

  if (!message.content.startsWith(prefix)) return
  const args = message.content.slice(prefix.length).trim().split(/ +/)
  const command = args.shift().toLowerCase()

  if (command === 'help') {
    message.channel.send({
      embed: {
        title: 'Help',
        description: '**Ping:** Ping the bot and see how bad its ping is\n**UWUify:** Convert normal text to uwu text',
        timestamp: new Date(),
        thumbnail: {
          url: 'https://cdn.discordapp.com/emojis/815660709320589313.png?v=1'
        }
      }
    })
  }

  if (command === 'eval' && message.author.id == '496463728661889026') {
    try {
      const code = message.content.slice(command.length + 1)
      let evaled = eval(code)

      if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)

      message.channel.send(clean(evaled), { code: 'xl' })
    } catch (err) {
      message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``)
    }
  }

  if (command === 'ping') {
    message.channel.send(
      `🏓Latency is ${Date.now() - message.createdTimestamp} ms. API Latency is ${Math.round(client.ws.ping)}ms`
    )
  }

  if (command === 'uwuify') {
    toUWU = message.content.slice(command.length + 1)
    if (toUWU == '') return message.channel.send('Pwease pwovide something t-to uwuify owo')

    let UWU = uwuify.uwuify(toUWU)
    message.channel.send(UWU, { allowedMentions: { parse: [] } })
  }

  if (command === 'grade' || command === 'convert') {
    if (args[0] == 'sport' || args[0] == 'rope' || args[0] == 'trad') {
      grades.sport.forEach(grade => {
        if (grade.includes(args[1])) {
          return message.reply(`Grade Conversion\n\`YDS\`: ${grade[0]}\n\`Sport FR\`: ${grade[1]}`)
        }
      })
      return
    }
    if (args[0] == 'boulder' || args[0] == 'bouldering') {
      grades.boulder.forEach(grade => {
        if (grade.includes(args[1])) {
          return message.reply(`Grade Conversion\n\`Hueco\`: ${grade[0]}\n\`Bouldering FR\`: ${grade[1]}`)
        }
      })
      return
    }
  }
})

client.login(config.token)
