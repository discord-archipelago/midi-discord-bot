import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");

export const OWNER_ID = "968837432617365564";

function loadJson(fileName, defaultValue) {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
  const filePath = path.join(dataDir, fileName);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
    return JSON.parse(JSON.stringify(defaultValue));
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    console.error(`${fileName} 파싱 실패, 기본값으로 복구함:`, err.message);
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
    return JSON.parse(JSON.stringify(defaultValue));
  }
}

function saveJson(fileName, data) {
  fs.writeFileSync(path.join(dataDir, fileName), JSON.stringify(data, null, 2));
}

const defaultConfig = {
  sayEnabled: false,
  ownerOnly: false,
  checkinChannelId: null,
  birthdayChannelId: null,
  lastBirthdayCheck: null,
  tmiChannelId: null,
};

export function getConfig() {
  return loadJson("config.json", defaultConfig);
}

export function saveConfig(config) {
  saveJson("config.json", config);
}

export function getUsers() {
  return loadJson("users.json", {});
}

export function saveUsers(users) {
  saveJson("users.json", users);
}

export function getUser(users, userId) {
  if (!users[userId]) {
    users[userId] = {
      checkinCount: 0,
      lastCheckin: null,
      profanityCount: 0,
      warningCount: 0,
      birthday: null,
      replyCheckinEnabled: false,
      mentionOnCheckin: true,
    };
  }
  if (users[userId].replyCheckinEnabled === undefined) {
    users[userId].replyCheckinEnabled = false;
  }
  if (users[userId].mentionOnCheckin === undefined) {
    users[userId].mentionOnCheckin = true;
  }
  if (users[userId].warningCount === undefined) {
    users[userId].warningCount = 0;
  }
  return users[userId];
}

export function resetAllCheckinTimes() {
  const users = getUsers();
  for (const user of Object.values(users)) {
    user.lastCheckin = null;
  }
  saveUsers(users);
}

export function resetAllProfanityCounts() {
  const users = getUsers();
  for (const user of Object.values(users)) {
    user.profanityCount = 0;
  }
  saveUsers(users);
}

export function getExtraActivities() {
  return loadJson("activities.json", []);
}

export function saveExtraActivities(list) {
  saveJson("activities.json", list);
}

export function getExtraFoods() {
  return loadJson("foods.json", []);
}

export function saveExtraFoods(list) {
  saveJson("foods.json", list);
}

export function getTmiList() {
  return loadJson("tmi.json", []);
}

export function saveTmiList(list) {
  saveJson("tmi.json", list);
}
