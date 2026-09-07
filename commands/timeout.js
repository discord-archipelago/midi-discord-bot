import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

const UNIT_MS = { 분: 60 * 1000, 시간: 60 * 60 * 1000, 일: 24 * 60 * 60 * 1000 };
const MAX_MS = 28 * 24 * 60 * 60 * 1000;

export default {
  data: new SlashCommandBuilder()
    .setName("타임아웃")
    .setDescription("유저에게 타임아웃을 부여함")
    .addUserOption(opt => opt.setName("유저").setDescription("타임아웃 줄 유저").setRequired(true))
    .addIntegerOption(opt => opt.setName("기간").setDescription("기간 값").setRequired(true).setMinValue(1))
    .addStringOption(opt =>
      opt
        .setName("단위")
        .setDescription("기간 단위")
        .setRequired(true)
        .addChoices({ name: "분", value: "분" }, { name: "시간", value: "시간" }, { name: "일", value: "일" })
    )
    .addStringOption(opt => opt.setName("사유").setDescription("사유").setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: "멤버 조정 권한이 있어야 써!", ephemeral: true });
    }

    const target = interaction.options.getUser("유저");
    const amount = interaction.options.getInteger("기간");
    const unit = interaction.options.getString("단위");
    const reason = interaction.options.getString("사유");

    const ms = amount * UNIT_MS[unit];
    if (ms > MAX_MS) {
      return interaction.reply({ content: "타임아웃은 최대 28일까지만 가능해!", ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      return interaction.reply({ content: "그 유저를 서버에서 못 찾겠어.", ephemeral: true });
    }

    try {
      await member.timeout(ms, reason || undefined);
      await interaction.reply(`${target}에게 ${amount}${unit} 타임아웃 부여함${reason ? ` (사유: ${reason})` : ""}`);
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: "타임아웃 부여하다가 오류남 (권한 계층 문제일 수도 있음).", ephemeral: true });
    }
  },
};
