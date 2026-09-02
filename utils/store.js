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
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function saveJson(fileName, data) {
  fs.writeFileSync(path.join(dataDir, fileName), JSON.stringify(data, null, 2));
}

const defaultConfig = {
  sayEnabled: false,
  ownerOnly: false,
  checkinChannelId: null,
  birthdayChannelId: null,
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
      birthday: null,
    };
  }
  return users[userId];
}

export function getDungjjal() {
  return loadJson("dungjjal.json", { images: [] });
}

export function saveDungjjal(data) {
  saveJson("dungjjal.json", data);
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
