import { SlashCommandBuilder } from "discord.js";
import { buildSuggestionModal } from "../utils/suggest.js";

export default {
  data: new SlashCommandBuilder().setName("기능제안").setDescription("봇에 추가했으면 하는 기능을 제안함"),

  async execute(interaction) {
    await interaction.showModal(buildSuggestionModal());
  },
};
