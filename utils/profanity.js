import { getUsers, saveUsers, getUser } from "./store.js";

// 감지할 욕설 목록
const BANNED_WORDS = ['시발', '씨발', '개새끼', '좆같네', '병신', '미친놈', '존나', '개같네', '좆', '개새끼야', '병신같은', '미친놈아', '존나게', '좆같이', '개같이', '씨발놈', '시발놈', '좆밥', '개새끼들', '병신새끼', '미친놈들', ];

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
