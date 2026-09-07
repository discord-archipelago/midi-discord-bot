import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("슬로우모드")
    .setDescription("이 채널의 슬로우모드를 설정함")
    .addIntegerOption(opt =>
      opt
        .setName("초")
        .setDescription("슬로우모드 간격(초), 0이면 해제")
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(21600)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ content: "채널 관리 권한이 있어야 써!", ephemeral: true });
    }

    const seconds = interaction.options.getInteger("초");

    try {
      await interaction.channel.setRateLimitPerUser(seconds);
      await interaction.reply(seconds === 0 ? "슬로우모드 해제함!" : `이 채널 슬로우모드 ${seconds}초로 설정함!`);
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: "슬로우모드 설정하다가 오류남.", ephemeral: true });
    }
  },
};
