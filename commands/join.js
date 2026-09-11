import { SlashCommandBuilder } from "discord.js";
import { joinVoiceChannel } from "@discordjs/voice";

export default {
  data: new SlashCommandBuilder()
    .setName("join")
    .setNameLocalizations({ ko: "입장" })
    .setDescription("미디를 음챗으로 부름!"),
  async execute(interaction) {
    const channel = interaction.member.voice.channel;
    if (!channel)
      return interaction.reply({ content: "먼저 음성 채널에 들어가줘!", ephemeral: true });
    joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });
    await interaction.reply({ content: `🎧 ${channel.name} 에 미디 입장!` });
  },
};
