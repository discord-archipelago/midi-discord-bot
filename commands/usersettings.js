import { SlashCommandBuilder } from "discord.js";
import { buildUserSettingsMessage } from "../utils/userSettings.js";

export default {
  data: new SlashCommandBuilder().setName("개인설정").setDescription("내 개인 설정을 관리함 (생일/짤/할거/음식 등록, 출첵 답장 알림 등)"),

  async execute(interaction) {
    await interaction.reply({ ...buildUserSettingsMessage(interaction.user.id), ephemeral: true });
  },
};
