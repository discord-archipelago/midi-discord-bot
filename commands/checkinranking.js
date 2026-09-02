import { SlashCommandBuilder } from "discord.js";
import { getUsers } from "../utils/store.js";

export default {
  data: new SlashCommandBuilder().setName("출첵랭킹").setDescription("출첵 랭킹을 보여줌!"),

  async execute(interaction) {
    const users = getUsers();
    const ranking = Object.entries(users)
      .filter(([, data]) => data.checkinCount > 0)
      .sort(([, a], [, b]) => b.checkinCount - a.checkinCount)
      .slice(0, 10);

    if (ranking.length === 0) {
      return interaction.reply("아직 출첵한 사람이 없음!");
    }

    const medals = ["🥇", "🥈", "🥉"];
    const lines = await Promise.all(
      ranking.map(async ([userId, data], i) => {
        const rank = medals[i] || `${i + 1}.`;
        const user = await interaction.client.users.fetch(userId).catch(() => null);
        const name = user ? user.username : `(알 수 없는 유저: ${userId})`;
        return `${rank} ${name} — ${data.checkinCount}회`;
      })
    );

    await interaction.reply(`**출첵 랭킹**\n${lines.join("\n")}`);
  },
};
