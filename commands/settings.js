import { SlashCommandBuilder } from "discord.js";
import { OWNER_ID } from "../utils/store.js";
import { buildSettingsMessage } from "../utils/settingsPanel.js";

export default {
  data: new SlashCommandBuilder().setName("settings").setDescription("봇 설정 관리 (오너 전용)"),

  async execute(interaction) {
    if (interaction.user.id !== OWNER_ID)
      return interaction.reply({ content: "이건 오너만 가능해!", ephemeral: true });

    await interaction.reply({ ...buildSettingsMessage(), ephemeral: true });
  },
};
