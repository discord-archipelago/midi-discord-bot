import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("saymidi")
    .setDescription("미디가 대신 말해줌 (명령어 사용 표시 없이)")
    .addStringOption(opt =>
      opt.setName("메시지").setDescription("미디가 말할 문장").setRequired(true)
    ),

  async execute(interaction) {
    const message = interaction.options.getString("메시지");
    await interaction.reply({ content: "말해줬어!", ephemeral: true });
    await interaction.channel.send(message);
  },
};
