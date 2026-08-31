import { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagePath = path.join(__dirname, "..", "assets", "soragodong.png");

const ANSWERS = [
  "아니.",
  "다시 물어봐.",
  "왜 나한테 물어봐.",
  "그럴 수도, 아닐 수도.",
  "지금은 대답 안 함.",
  "예스.",
  "노.",
  "그냥 하지 마.",
  "확실해.",
  "잘 모르겠는데.",
  "이미 답은 네 안에 있어.",
  "다음에 다시 물어봐.",
  "안 알려줌.",
  "당연하지.",
  "절대 아니야.",
  "흠... 아니.",
  "오늘은 컨디션이 안 좋음.",
  "그건 비밀이야.",
];

export default {
  data: new SlashCommandBuilder()
    .setName("소라고동")
    .setDescription("마법의 소라고동에게 물어봄")
    .addStringOption(opt =>
      opt.setName("질문").setDescription("소라고동에게 물어볼 질문").setRequired(true)
    ),

  async execute(interaction) {
    const question = interaction.options.getString("질문");
    const answer = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];

    const embed = new EmbedBuilder()
      .setDescription(`-# ${question}\n\n# ${answer}`)
      .setColor(0x1e90ff);

    const files = [];
    if (fs.existsSync(imagePath)) {
      files.push(new AttachmentBuilder(imagePath, { name: "soragodong.png" }));
      embed.setThumbnail("attachment://soragodong.png");
    }

    await interaction.reply({ embeds: [embed], files });
  },
};
