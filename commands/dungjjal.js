import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { getDungjjal } from "../utils/store.js";

export default {
  data: new SlashCommandBuilder().setName("짤공유").setDescription("등록된 짤 중 하나를 랜덤으로 보여줌"),

  async execute(interaction) {
    const data = getDungjjal();
    if (data.images.length === 0) {
      return interaction.reply("아직 등록된 짤이 없음. /개인설정 으로 먼저 등록해줘.");
    }

    const pick = data.images[Math.floor(Math.random() * data.images.length)];
    const embed = new EmbedBuilder().setImage(pick.url).setColor(0x8b4513);
    await interaction.reply({ embeds: [embed] });
  },
};
