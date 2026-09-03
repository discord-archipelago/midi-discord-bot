import { SlashCommandBuilder } from "discord.js";
import { buildUserSettingsMessage } from "../utils/userSettings.js";

export default {
  data: new SlashCommandBuilder().setName("유저설정").setDescription("내 개인 설정을 관리함 (출첵 DM 알림 등)"),

  async execute(interaction) {
    await interaction.reply({ ...buildUserSettingsMessage(interaction.user.id), ephemeral: true });
  },
};
