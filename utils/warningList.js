import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { getUsers } from "./store.js";

const PAGE_SIZE = 10;

function getFullWarningList() {
  const users = getUsers();
  return Object.entries(users)
    .filter(([, data]) => data.warningCount > 0)
    .sort(([, a], [, b]) => b.warningCount - a.warningCount);
}

export async function buildWarningPage(client, page) {
  const list = getFullWarningList();

  if (list.length === 0) {
    return { content: "지금 경고 있는 사람이 없음!", components: [] };
  }

  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const clampedPage = Math.min(Math.max(page, 0), totalPages - 1);
  const start = clampedPage * PAGE_SIZE;
  const pageItems = list.slice(start, start + PAGE_SIZE);

  const lines = await Promise.all(
    pageItems.map(async ([userId, data], i) => {
      const rank = start + i + 1;
      const user = await client.users.fetch(userId).catch(() => null);
      const name = user ? user.username : `(알 수 없는 유저: ${userId})`;
      return `${rank}. ${name} — 경고 ${data.warningCount}회`;
    })
  );

  const content = `**경고 현황** (${clampedPage + 1}/${totalPages}페이지)\n${lines.join("\n")}`;

  const components =
    totalPages > 1
      ? [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`serverinfo_page:${clampedPage - 1}`)
              .setLabel("◀")
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(clampedPage === 0),
            new ButtonBuilder()
              .setCustomId(`serverinfo_page:${clampedPage + 1}`)
              .setLabel("▶")
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(clampedPage >= totalPages - 1)
          ),
        ]
      : [];

  return { content, components };
}

export async function handleWarningListButton(interaction) {
  const page = Number(interaction.customId.split(":")[1]);
  const rendered = await buildWarningPage(interaction.client, page);
  return interaction.update(rendered);
}
