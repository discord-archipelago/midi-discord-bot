import { getConfig, getUsers, saveUsers, getUser } from "./store.js";

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function formatCheckinTime(date) {
  const parts = new Intl.DateTimeFormat("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Seoul",
  }).formatToParts(date);
  const get = type => parts.find(p => p.type === type)?.value;
  return `${get("dayPeriod")} ${get("hour")}시 ${get("minute")}분`;
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
    const time = formatCheckinTime(new Date());
    channel.send(`${msg.author} ${time}에 출첵! (총 ${user.checkinCount}회)`).catch(() => {});
  }
}
