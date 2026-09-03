import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("말하기")
    .setDescription("입력한 문장을 미디가 말해줌!!")
    .addStringOption(option =>
      option.setName("message").setDescription("미디가 말할 문장").setRequired(true)
    ),
  async execute(interaction) {
    const message = interaction.options.getString("message");
    await interaction.reply({ content: message });
  },
};
