import { getConfig, getUsers, saveUsers, getUser } from "./store.js";

function todayString() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
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

  const time = formatCheckinTime(new Date());
  const config = getConfig();

  if (config.checkinChannelId) {
    const channel = msg.guild.channels.cache.get(config.checkinChannelId);
    if (channel) {
      const userLabel = user.mentionOnCheckin ? `${msg.author}` : `\`${msg.author.username}\``;
      channel.send(`${userLabel} ${time}에 출첵! (총 ${user.checkinCount}회)`).catch(() => {});
    }
  }

  if (user.replyCheckinEnabled) {
    msg.reply(`${time}에 출첵 완료! (총 ${user.checkinCount}회)`).catch(() => {});
  }
}
