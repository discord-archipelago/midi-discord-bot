import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { getUsers } from "./store.js";

const PAGE_SIZE = 10;
const MEDALS = ["🥇", "🥈", "🥉"];

function getFullRanking() {
  const users = getUsers();
  return Object.entries(users)
    .filter(([, data]) => data.checkinCount > 0)
    .sort(([, a], [, b]) => b.checkinCount - a.checkinCount);
}

export async function buildRankingPage(client, page) {
  const ranking = getFullRanking();

  if (ranking.length === 0) {
    return { content: "아직 출첵한 사람이 없음!", components: [] };
  }

  const totalPages = Math.max(1, Math.ceil(ranking.length / PAGE_SIZE));
  const clampedPage = Math.min(Math.max(page, 0), totalPages - 1);
  const start = clampedPage * PAGE_SIZE;
  const pageItems = ranking.slice(start, start + PAGE_SIZE);

  const lines = await Promise.all(
    pageItems.map(async ([userId, data], i) => {
      const rank = start + i;
      const rankLabel = MEDALS[rank] || `${rank + 1}.`;
      const user = await client.users.fetch(userId).catch(() => null);
      const name = user ? user.username : `(알 수 없는 유저: ${userId})`;
      return `${rankLabel} ${name} — ${data.checkinCount}회`;
    })
  );

  const content = `**출첵 랭킹** (${clampedPage + 1}/${totalPages}페이지)\n${lines.join("\n")}`;

  const components =
    totalPages > 1
      ? [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`checkinranking_page:${clampedPage - 1}`)
              .setLabel("◀")
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(clampedPage === 0),
            new ButtonBuilder()
              .setCustomId(`checkinranking_page:${clampedPage + 1}`)
              .setLabel("▶")
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(clampedPage >= totalPages - 1)
          ),
        ]
      : [];

  return { content, components };
}

export async function handleCheckinRankingButton(interaction) {
  const page = Number(interaction.customId.split(":")[1]);
  const rendered = await buildRankingPage(interaction.client, page);
  return interaction.update(rendered);
}
