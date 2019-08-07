//Init local files
//const Cards = require("./Cards.js");

//Init Discord
const Discord = require("discord.js");
const bot = new Discord.Client();

const token = "*************************************";

bot.login(token);

//Init Firebase
const firebase = require("firebase/app");
const FieldValue = require("firebase-admin").firestore.FieldValue;
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();

//Global Vars
const defPrefix = ".s";

bot.on("ready", () => {
  console.log("Online");
});

bot.on("guildCreate", async gData => {
  InitGuild(gData);
});

bot.on("message", msg => {
  db.collection("guilds")
    .doc(msg.guild.id)
    .get()
    .then(q => {
      if (q.exists) {
        prefix = q.data().prefix;
        let input = msg.content.toLowerCase().split(" ");
        let complexInput = msg.content.split(" /");
        if (input[0] === prefix) {
          switch (input[1]) {
            case "help":
              SendHelpMessage(msg);
              break;
            case "setprefix":
              SetPrefix(input, msg);
              break;
            default:
              //TODO: Send unknown command
              break;
          }
        }
      }
    });
});

function SetPrefix(input, msg) {
  if (input[2] != "" && input[2]) {
    db.collection("guilds")
      .doc(msg.guild.id)
      .update({ prefix: input[2] });
    msg.reply("The server's prefix is now '" + input[2] + "'");
  } else {
    msg.reply(
      new Discord.RichEmbed()
        .addField("Error", "To set a custom prefix follow the bellow syntax")
        .addField("Syntax: ", prefix + " setprefix <prefix>")
    );
  }
}

function SendHelpMessage(msg) {
  msg.reply(
    new Discord.RichEmbed().addField(
      "Set Prefix",
      prefix + " setprefix <prefix>"
    )
  );
}

function InitGuild(gData) {
  db.collection("guilds")
    .doc(gData.id)
    .set({
      guildID: gData.id,
      guildName: gData.name,
      guildOwner: gData.owner.user.username,
      guildOwnerID: gData.owner.user.id,
      prefix: defPrefix
    });
  gData.defaultChannel.send(
    new Discord.RichEmbed().addField(
      "Hello!",
      "Soullect has successfuly joined your server. Enter '" +
        defPrefix +
        " help to see bot commands."
    )
  );
}
