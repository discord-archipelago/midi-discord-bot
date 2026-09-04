import { getConfig, saveConfig, getUsers } from "./store.js";

function todayDateStringKST() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
}

function todayMMDDKST() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Seoul",
  }).formatToParts(new Date());
  const get = type => parts.find(p => p.type === type)?.value;
  return `${get("month")}-${get("day")}`;
}

export async function checkBirthdays(client) {
  const config = getConfig();
  if (!config.birthdayChannelId) return;

  const todayDate = todayDateStringKST();
  if (config.lastBirthdayCheck === todayDate) return;

  config.lastBirthdayCheck = todayDate;
  saveConfig(config);

  const todayMMDD = todayMMDDKST();
  const users = getUsers();
  const birthdayUserIds = Object.entries(users)
    .filter(([, user]) => user.birthday === todayMMDD)
    .map(([userId]) => userId);

  if (birthdayUserIds.length === 0) return;

  const channel = await client.channels.fetch(config.birthdayChannelId).catch(() => null);
  if (!channel) return;

  for (const userId of birthdayUserIds) {
    channel.send(`오늘은 <@${userId}>의 생일이야! 다들 축하해줘! 🎉`).catch(() => {});
  }
}
