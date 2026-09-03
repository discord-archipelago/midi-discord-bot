import { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagePath = path.join(__dirname, "..", "assets", "robo.png");

function rollDukdam() {
  const roll = Math.random() * 100;
  if (roll < 1) return { text: "멍", note: "1%" };
  if (roll < 11) return { text: "먕", note: "10%" };
  return { text: "냥", note: null };
}

export default {
  data: new SlashCommandBuilder().setName("로보덕담").setDescription("로보가 오늘의 덕담을 건네줌"),

  async execute(interaction) {
    const { text, note } = rollDukdam();
    const resultLine = note ? `# ${text}?! (${note})` : `# ${text}~`;

    const embed = new EmbedBuilder()
      .setDescription(`-# 로보의 덕담\n\n${resultLine}`)
      .setColor(0x9b59b6);

    const files = [];
    if (fs.existsSync(imagePath)) {
      files.push(new AttachmentBuilder(imagePath, { name: "robo.png" }));
      embed.setThumbnail("attachment://robo.png");
    }

    await interaction.reply({ embeds: [embed], files });
  },
};
