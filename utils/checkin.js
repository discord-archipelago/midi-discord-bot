import { getConfig, getUsers, saveUsers, getUser } from "./store.js";

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export async function handleCheckin(msg) {
  const users = getUsers();
  const user = getUser(users, msg.author.id);
  const today = todayString();
  if (user.lastCheckin === today) return;

  user.checkinCount += 1;
  user.lastCheckin = today;
  saveUsers(users);

  const config = getConfig();
  if (!config.checkinChannelId) return;

  const channel = msg.guild.channels.cache.get(config.checkinChannelId);
  if (channel) {
    channel.send(`✅ ${msg.author} 출첵! (총 ${user.checkinCount}회)`).catch(() => {});
  }
}
