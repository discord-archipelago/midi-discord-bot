import { SlashCommandBuilder } from "discord.js";

// 할거 후보 목록 (직접 채워 넣기)
const ACTIVITIES = ["산책하기", "낮잠 자기", "영화 보기", "게임하기", "청소하기"];

export default {
  data: new SlashCommandBuilder().setName("할거추천").setDescription("지금 뭐 할지 추천해줌!"),

  async execute(interaction) {
    const activity = ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)];
    await interaction.reply(`지금은 **${activity}** 어때?`);
  },
};
