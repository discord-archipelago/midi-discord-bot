import { SlashCommandBuilder, ChannelType } from "discord.js";
import { getConfig, saveConfig, getUsers, saveUsers, getUser, OWNER_ID } from "../utils/store.js";

export default {
  data: new SlashCommandBuilder()
    .setName("settings")
    .setDescription("봇 설정 관리 (오너 전용)")
    .addSubcommand(sub =>
      sub
        .setName("say")
        .setDescription("SAY 채팅 대리 기능 켜고 끄기")
        .addStringOption(opt =>
          opt
            .setName("상태")
            .setDescription("on 또는 off")
            .setRequired(true)
            .addChoices({ name: "on", value: "on" }, { name: "off", value: "off" })
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("owneronly")
        .setDescription("오너만 명령어 사용 가능하게 켜고 끄기")
        .addStringOption(opt =>
          opt
            .setName("상태")
            .setDescription("on 또는 off")
            .setRequired(true)
            .addChoices({ name: "on", value: "on" }, { name: "off", value: "off" })
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("출첵채널")
        .setDescription("출첵 로그를 보낼 채널 지정")
        .addChannelOption(opt =>
          opt
            .setName("채널")
            .setDescription("출첵 로그 채널")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("생일채널")
        .setDescription("생일 알림을 보낼 채널 지정")
        .addChannelOption(opt =>
          opt
            .setName("채널")
            .setDescription("생일 알림 채널")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("출첵마이그레이션")
        .setDescription("유저의 출첵 횟수를 수동으로 설정 (예전 봇 기록 이전용)")
        .addUserOption(opt => opt.setName("유저").setDescription("대상 유저").setRequired(true))
        .addIntegerOption(opt =>
          opt.setName("횟수").setDescription("설정할 출첵 횟수").setRequired(true).setMinValue(0)
        )
    ),

  async execute(interaction) {
    if (interaction.user.id !== OWNER_ID)
      return interaction.reply({ content: "이건 오너만 가능해!", ephemeral: true });

    const sub = interaction.options.getSubcommand();
    const config = getConfig();

    if (sub === "say") {
      config.sayEnabled = interaction.options.getString("상태") === "on";
      saveConfig(config);
      return interaction.reply({ content: `SAY 기능 ${config.sayEnabled ? "켜짐" : "꺼짐"}!` });
    }

    if (sub === "owneronly") {
      config.ownerOnly = interaction.options.getString("상태") === "on";
      saveConfig(config);
      return interaction.reply({ content: `오너 전용 모드 ${config.ownerOnly ? "켜짐" : "꺼짐"}!` });
    }

    if (sub === "출첵채널") {
      const channel = interaction.options.getChannel("채널");
      config.checkinChannelId = channel.id;
      saveConfig(config);
      return interaction.reply({ content: `출첵 로그 채널을 ${channel}로 설정함!` });
    }

    if (sub === "생일채널") {
      const channel = interaction.options.getChannel("채널");
      config.birthdayChannelId = channel.id;
      saveConfig(config);
      return interaction.reply({ content: `생일 알림 채널을 ${channel}로 설정함!` });
    }

    if (sub === "출첵마이그레이션") {
      const target = interaction.options.getUser("유저");
      const count = interaction.options.getInteger("횟수");
      const users = getUsers();
      const user = getUser(users, target.id);
      user.checkinCount = count;
      saveUsers(users);
      return interaction.reply({ content: `${target.username}의 출첵 횟수를 ${count}회로 설정함!` });
    }
  },
};
