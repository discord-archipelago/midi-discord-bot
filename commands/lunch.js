import { SlashCommandBuilder } from "discord.js";

// 점심메뉴 후보 목록 (직접 채워 넣기)
const MENUS = ["김치찌개", "돈까스", "짜장면", "샐러드", "라멘"];

export default {
  data: new SlashCommandBuilder().setName("점심메뉴").setDescription("오늘의 점심메뉴를 추천해줌!"),

  async execute(interaction) {
    const menu = MENUS[Math.floor(Math.random() * MENUS.length)];
    await interaction.reply(`오늘 점심은 **${menu}** 어때?`);
  },
};
