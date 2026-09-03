import { SlashCommandBuilder } from "discord.js";
import { getVoiceConnection } from "@discordjs/voice";

export default {
  data: new SlashCommandBuilder().setName("퇴장").setDescription("미디를 음챗에서 내보냄!"),
  async execute(interaction) {
    const connection = getVoiceConnection(interaction.guild.id);
    if (!connection)
      return interaction.reply({ content: "지금 아무 음성 채널에도 없는데??", ephemeral: true });
    connection.destroy();
    await interaction.reply({ content: "ㅂㅂ" });
  },
};
