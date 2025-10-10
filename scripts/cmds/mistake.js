const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "mistake",
    version: "1.0",
    author: "Saimx69x",
    countDown: 5,
    role: 0,
    shortDescription: "mistake meme generator",
    longDescription: "Tag or reply to someone to create a mistake meme.",
    category: "fun",
    guide: {
      en: "{pn} @mention or reply to someone",
    },
  },

  onStart: async function ({ event, message, api }) {
    let targetID = Object.keys(event.mentions)[0];
    if (event.type === "message_reply" && !targetID) {
      targetID = event.messageReply.senderID;
    }

    if (!targetID) {
      return message.reply("Please tag or reply to someone to create a mistake meme!");
    }

    const API_URL = `https://xsaim8x-xxx-api.onrender.com/api/mistake?uid=${targetID}`;
    const tmp = path.join(__dirname, "..", "cache");
    await fs.ensureDir(tmp);
    const outputPath = path.join(tmp, `mistake_${targetID}_${Date.now()}.png`);

    try {
      const response = await axios.get(API_URL, { responseType: "arraybuffer" });
      const imageBuffer = Buffer.from(response.data);
      await fs.writeFile(outputPath, imageBuffer);

      const userInfo = await api.getUserInfo(targetID);
      const tagName = userInfo[targetID]?.name || "Someone";

      await message.reply({
        body: `@${tagName}`,
        mentions: [{ tag: `@${tagName}`, id: targetID }],
        attachment: fs.createReadStream(outputPath),
      });

      await fs.unlink(outputPath);
    } catch (err) {
      console.error("❌ Mistake Command Error:", err);
      message.reply("⚠️ An error occurred. Please try again later.");
    }
  },
};
