import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  ChannelType,
  UserSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
} from "discord.js";
import { getConfig, saveConfig, getUsers, saveUsers, getUser } from "./store.js";

export function buildSettingsMessage() {
  const config = getConfig();

  const embed = new EmbedBuilder()
    .setTitle("봇 설정")
    .addFields(
      { name: "SAY 기능", value: config.sayEnabled ? "켜짐" : "꺼짐", inline: true },
      { name: "오너 전용 모드", value: config.ownerOnly ? "켜짐" : "꺼짐", inline: true },
      {
        name: "출첵 채널",
        value: config.checkinChannelId ? `<#${config.checkinChannelId}>` : "미설정",
        inline: true,
      },
      {
        name: "생일 채널",
        value: config.birthdayChannelId ? `<#${config.birthdayChannelId}>` : "미설정",
        inline: true,
      }
    )
    .setColor(0x5865f2);

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("settings_toggle_say")
      .setLabel(config.sayEnabled ? "SAY 끄기" : "SAY 켜기")
      .setStyle(config.sayEnabled ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("settings_toggle_owneronly")
      .setLabel(config.ownerOnly ? "오너전용 끄기" : "오너전용 켜기")
      .setStyle(config.ownerOnly ? ButtonStyle.Success : ButtonStyle.Secondary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("settings_pick_checkinchannel")
      .setLabel("출첵채널 설정")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("settings_pick_birthdaychannel")
      .setLabel("생일채널 설정")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("settings_pick_migrate_user")
      .setLabel("출첵 마이그레이션")
      .setStyle(ButtonStyle.Secondary)
  );

  return { content: "", embeds: [embed], components: [row1, row2] };
}

export async function handleSettingsButton(interaction) {
  if (interaction.customId === "settings_toggle_say") {
    const config = getConfig();
    config.sayEnabled = !config.sayEnabled;
    saveConfig(config);
    return interaction.update(buildSettingsMessage());
  }

  if (interaction.customId === "settings_toggle_owneronly") {
    const config = getConfig();
    config.ownerOnly = !config.ownerOnly;
    saveConfig(config);
    return interaction.update(buildSettingsMessage());
  }

  if (interaction.customId === "settings_pick_checkinchannel") {
    const row = new ActionRowBuilder().addComponents(
      new ChannelSelectMenuBuilder()
        .setCustomId("settings_channelselect_checkin")
        .setPlaceholder("출첵 로그를 보낼 채널 선택")
        .addChannelTypes(ChannelType.GuildText)
    );
    return interaction.update({ content: "출첵 로그를 보낼 채널을 골라줘.", embeds: [], components: [row] });
  }

  if (interaction.customId === "settings_pick_birthdaychannel") {
    const row = new ActionRowBuilder().addComponents(
      new ChannelSelectMenuBuilder()
        .setCustomId("settings_channelselect_birthday")
        .setPlaceholder("생일 알림을 보낼 채널 선택")
        .addChannelTypes(ChannelType.GuildText)
    );
    return interaction.update({ content: "생일 알림을 보낼 채널을 골라줘.", embeds: [], components: [row] });
  }

  if (interaction.customId === "settings_pick_migrate_user") {
    const row = new ActionRowBuilder().addComponents(
      new UserSelectMenuBuilder()
        .setCustomId("settings_userselect_migrate")
        .setPlaceholder("출첵 횟수를 바꿀 유저 선택")
    );
    return interaction.update({ content: "출첵 횟수를 바꿀 유저를 골라줘.", embeds: [], components: [row] });
  }
}

export async function handleSettingsChannelSelect(interaction) {
  const channel = interaction.channels.first();
  const config = getConfig();

  if (interaction.customId === "settings_channelselect_checkin") {
    config.checkinChannelId = channel.id;
    saveConfig(config);
    return interaction.update(buildSettingsMessage());
  }

  if (interaction.customId === "settings_channelselect_birthday") {
    config.birthdayChannelId = channel.id;
    saveConfig(config);
    return interaction.update(buildSettingsMessage());
  }
}

export async function handleSettingsUserSelect(interaction) {
  if (interaction.customId !== "settings_userselect_migrate") return;

  const targetUser = interaction.users.first();
  const modal = new ModalBuilder()
    .setCustomId(`settings_migrate_modal:${targetUser.id}`)
    .setTitle(`${targetUser.username}의 출첵 횟수 설정`);
  const input = new TextInputBuilder()
    .setCustomId("migrate_count")
    .setLabel("설정할 출첵 횟수")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);
  modal.addComponents(new ActionRowBuilder().addComponents(input));
  return interaction.showModal(modal);
}

export async function handleSettingsModal(interaction) {
  const targetId = interaction.customId.split(":")[1];
  const countStr = interaction.fields.getTextInputValue("migrate_count").trim();
  const count = Number(countStr);

  if (!Number.isInteger(count) || count < 0) {
    return interaction.reply({ content: "숫자(0 이상)로 입력해줘!", ephemeral: true });
  }

  const users = getUsers();
  const user = getUser(users, targetId);
  user.checkinCount = count;
  saveUsers(users);

  return interaction.reply({ content: `<@${targetId}>의 출첵 횟수를 ${count}회로 설정함!`, ephemeral: true });
}
