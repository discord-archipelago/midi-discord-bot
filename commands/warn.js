import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { getUsers, saveUsers, getUser } from "../utils/store.js";

export default {
  data: new SlashCommandBuilder()
    .setName("경고")
    .setDescription("유저에게 경고를 부여함")
    .addUserOption(opt => opt.setName("유저").setDescription("경고 줄 유저").setRequired(true))
    .addStringOption(opt => opt.setName("사유").setDescription("경고 사유").setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: "멤버 조정 권한이 있어야 써!", ephemeral: true });
    }

    const target = interaction.options.getUser("유저");
    const reason = interaction.options.getString("사유");

    const users = getUsers();
    const user = getUser(users, target.id);
    user.warningCount += 1;
    saveUsers(users);

    const reasonText = reason ? ` (사유: ${reason})` : "";
    await interaction.reply(`${target}에게 경고 부여함. 현재 ${user.warningCount}회${reasonText}`);
  },
};
