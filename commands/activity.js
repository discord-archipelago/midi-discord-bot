import { SlashCommandBuilder } from "discord.js";
import { getExtraActivities } from "../utils/store.js";

// 할거 후보 목록 (직접 채워 넣기, /개인설정의 "할거 등록"으로 추가된 것도 합쳐짐)
const ACTIVITIES = ["산책하기", "낮잠 자기", "게임하기", "청소하기", "요리하기", "음악 듣기", "그림 그리기", "공부하기", "디코 끄기"];

export default {
  data: new SlashCommandBuilder().setName("뭐하지").setDescription("할게 없다고? 내가 추천해줄게!"),

  async execute(interaction) {
    const extras = getExtraActivities().map(e => (typeof e === "string" ? { value: e, addedBy: null } : e));
    const pool = [...ACTIVITIES.map(value => ({ value, addedBy: null })), ...extras];
    const pick = pool[Math.floor(Math.random() * pool.length)];

    let content = `**${pick.value}**는(은) 어때?`;
    if (pick.addedBy) {
      const user = await interaction.client.users.fetch(pick.addedBy).catch(() => null);
      if (user) content += `\n-# ${user.username}님이 추천해줬어!`;
    }

    await interaction.reply(content);
  },
};
