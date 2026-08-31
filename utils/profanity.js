import { getUsers, saveUsers, getUser } from "./store.js";

// 감지할 욕설 목록 (직접 채워 넣기)
const BANNED_WORDS = [];

export async function handleProfanity(msg) {
  if (BANNED_WORDS.length === 0) return;

  const content = msg.content.toLowerCase();
  const hit = BANNED_WORDS.some(word => content.includes(word));
  if (!hit) return;

  const users = getUsers();
  const user = getUser(users, msg.author.id);
  user.profanityCount += 1;
  saveUsers(users);
}
