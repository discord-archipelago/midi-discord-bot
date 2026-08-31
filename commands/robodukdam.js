import { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagePath = path.join(__dirname, "..", "assets", "robo.png");

// 로보가 건넬 덕담 목록 (직접 채워 넣기)
const COMPLIMENTS = ["오늘도 잘하고 있어!", "너는 존재만으로도 충분해.", "오늘 하루도 수고했어."];

function rollTag() {
  const roll = Math.random() * 100;
  if (roll < 1) return { tag: "멍", note: "1% 초레어" };
  if (roll < 11) return { tag: "먕", note: "10% 레어" };
  return { tag: "냥", note: null };
}

export default {
  data: new SlashCommandBuilder().setName("로보덕담").setDescription("로보가 오늘의 덕담을 건네줌!"),

  async execute(interaction) {
    const compliment = COMPLIMENTS[Math.floor(Math.random() * COMPLIMENTS.length)];
    const { tag, note } = rollTag();
    const tagLine = note ? `**${tag}?!** (${note})` : `${tag}~`;

    const embed = new EmbedBuilder()
      .setDescription(`-# 로보가 오늘의 덕담을 건넴\n\n# ${compliment}\n\n${tagLine}`)
      .setColor(0x9b59b6);

    const files = [];
    if (fs.existsSync(imagePath)) {
      files.push(new AttachmentBuilder(imagePath, { name: "robo.png" }));
      embed.setThumbnail("attachment://robo.png");
    }

    await interaction.reply({ embeds: [embed], files });
  },
};
