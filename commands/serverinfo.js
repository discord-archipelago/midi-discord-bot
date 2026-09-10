import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { buildWarningPage } from "../utils/warningList.js";

export default {
  data: new SlashCommandBuilder()
    .setName("서버정보")
    .setDescription("지금 누가 경고를 몇 개 받았는지 보여줌")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: "멤버 조정 권한이 있어야 써!", ephemeral: true });
    }

    const rendered = await buildWarningPage(interaction.client, 0);
    await interaction.reply(rendered);
  },
};
