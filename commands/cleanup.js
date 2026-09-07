import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("청소")
    .setDescription("메시지를 지정한 개수만큼 삭제함")
    .addIntegerOption(opt =>
      opt.setName("개수").setDescription("삭제할 메시지 개수 (1~100)").setRequired(true).setMinValue(1).setMaxValue(100)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: "메시지 관리 권한이 있어야 써!", ephemeral: true });
    }

    const count = interaction.options.getInteger("개수");
    await interaction.deferReply({ ephemeral: true });

    try {
      const deleted = await interaction.channel.bulkDelete(count, true);
      await interaction.editReply(`${deleted.size}개 삭제함! (14일 지난 메시지는 자동으로 제외됨)`);
    } catch (err) {
      console.error(err);
      await interaction.editReply("삭제하다가 오류남.");
    }
  },
};
