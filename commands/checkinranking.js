import { SlashCommandBuilder } from "discord.js";
import { buildRankingPage } from "../utils/checkinRanking.js";

export default {
  data: new SlashCommandBuilder().setName("출첵랭킹").setDescription("출첵 랭킹을 보여줌!"),

  async execute(interaction) {
    const rendered = await buildRankingPage(interaction.client, 0);
    await interaction.reply(rendered);
  },
};
