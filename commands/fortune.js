import { SlashCommandBuilder } from "discord.js";

// 오늘의 운세 후보 목록 (직접 채워 넣기, 나사 좀 빠진 걸로)
const FORTUNES = [
  "오늘은 계단에서 조심해.",
  "생각지도 못한 곳에서 돈을 주울 수도?",
  "오늘 하루 무난하게 흘러감.",
  "누군가 네 얘기를 하고 있음.",
  "커피 마시면 운이 좋아짐.",
];

export default {
  data: new SlashCommandBuilder().setName("운세").setDescription("오늘의 운세를 봐줌!"),

  async execute(interaction) {
    const fortune = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
    await interaction.reply(`🔮 오늘의 운세: ${fortune}`);
  },
};
