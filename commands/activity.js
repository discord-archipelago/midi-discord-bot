import { SlashCommandBuilder } from "discord.js";
import { getExtraActivities } from "../utils/store.js";

// 할거 후보 목록 (직접 채워 넣기, /개인설정의 "할거 등록"으로 추가된 것도 합쳐짐)
const ACTIVITIES = ["산책하기", "낮잠 자기", "영화 보기", "게임하기", "청소하기", "요리하기", "책 읽기", "음악 듣기", "운동하기", "그림 그리기", "사진 찍기", "글쓰기", "퍼즐 맞추기", "명상하기", "친구에게 연락하기", "새로운 취미 배우기", "노래방 가기", "공부하기", "디코 끄기"];

export default {
  data: new SlashCommandBuilder().setName("할거추천").setDescription("할게 없다고? 내가 추천해줄게!"),

  async execute(interaction) {
    const extras = getExtraActivities().map(e => (typeof e === "string" ? e : e.value));
    const pool = [...ACTIVITIES, ...extras];
    const activity = pool[Math.floor(Math.random() * pool.length)];
    await interaction.reply(`**${activity}**는(은) 어때?`);
  },
};
