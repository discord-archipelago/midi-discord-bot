import { SlashCommandBuilder } from "discord.js";
import { buildRegisterMenu } from "../utils/register.js";

export default {
  data: new SlashCommandBuilder().setName("등록").setDescription("생일 또는 똥짤을 등록함"),

  async execute(interaction) {
    await interaction.reply({
      content: "뭘 등록할지 골라줘!",
      components: [buildRegisterMenu()],
      ephemeral: true,
    });
  },
};
