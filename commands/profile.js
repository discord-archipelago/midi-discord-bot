import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { getUsers, getUser } from "../utils/store.js";

export default {
  data: new SlashCommandBuilder()
    .setName("프로필")
    .setDescription("출첵/욕설/생일 등 정보를 보여줌!")
    .addUserOption(opt =>
      opt.setName("유저").setDescription("조회할 유저 (안 넣으면 본인)").setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser("유저") || interaction.user;
    const users = getUsers();
    const data = getUser(users, target.id);

    const member = interaction.guild.members.cache.get(target.id);
    const joinedAt = member?.joinedAt
      ? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:D>`
      : "알 수 없음";

    const embed = new EmbedBuilder()
      .setTitle(`${target.username}의 프로필`)
      .setThumbnail(target.displayAvatarURL())
      .addFields(
        { name: "출첵 횟수", value: `${data.checkinCount}회`, inline: true },
        { name: "욕설 횟수", value: `${data.profanityCount}회`, inline: true },
        { name: "생일", value: data.birthday || "미등록", inline: true },
        { name: "서버 가입일", value: joinedAt, inline: true }
      )
      .setColor(0x2ecc71);

    await interaction.reply({ embeds: [embed] });
  },
};
