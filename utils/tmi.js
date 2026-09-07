import { getConfig, getTmiList } from "./store.js";

export async function handleTmi(msg) {
  const config = getConfig();
  if (!config.tmiChannelId) return;
  if (msg.channel.id !== config.tmiChannelId) return;

  const content = msg.content.trim();
  if (!content) return;

  const list = getTmiList();
  const match = list.find(t => t.keyword === content);
  if (!match) return;

  msg.channel.send(match.response).catch(() => {});
}
