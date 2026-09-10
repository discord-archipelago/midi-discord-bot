import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
} from "discord.js";
import {
  getUsers,
  saveUsers,
  getUser,
  getExtraActivities,
  saveExtraActivities,
  getExtraFoods,
  saveExtraFoods,
  getTmiList,
  saveTmiList,
} from "./store.js";

function normalizeEntry(entry) {
  return typeof entry === "string" ? { value: entry, addedBy: null } : entry;
}

function truncate(text, max = 90) {
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

export function buildUserSettingsMessage(userId) {
  const users = getUsers();
  const user = getUser(users, userId);

  const activities = getExtraActivities().map(normalizeEntry);
  const myActivities = activities.filter(a => a.addedBy === userId);

  const foods = getExtraFoods().map(normalizeEntry);
  const myFoods = foods.filter(f => f.addedBy === userId);

  const tmiList = getTmiList();
  const myTmi = tmiList.filter(t => t.addedBy === userId);

  const embed = new EmbedBuilder()
    .setTitle("내 설정")
    .addFields(
      { name: "생일", value: user.birthday || "미등록", inline: true },
      { name: "출첵 답장 알림", value: user.replyCheckinEnabled ? "켜짐" : "꺼짐", inline: true },
      { name: "출첵 멘션", value: user.mentionOnCheckin ? "켜짐" : "꺼짐", inline: true },
      { name: "등록한 할거", value: `${myActivities.length}개`, inline: true },
      { name: "등록한 음식", value: `${myFoods.length}개`, inline: true },
      { name: "등록한 TMI", value: `${myTmi.length}개`, inline: true }
    )
    .setColor(0x5865f2);

  const rows = [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("usersettings_register_birthday")
        .setLabel("생일 등록/수정")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("usersettings_register_activity")
        .setLabel("할거 등록")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("usersettings_register_food")
        .setLabel("음식 등록")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("usersettings_register_tmi")
        .setLabel("TMI 등록")
        .setStyle(ButtonStyle.Primary)
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("usersettings_toggle_reply")
        .setLabel(user.replyCheckinEnabled ? "출첵 답장 끄기" : "출첵 답장 켜기")
        .setStyle(user.replyCheckinEnabled ? ButtonStyle.Success : ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("usersettings_toggle_mention")
        .setLabel(user.mentionOnCheckin ? "출첵 멘션 끄기" : "출첵 멘션 켜기")
        .setStyle(user.mentionOnCheckin ? ButtonStyle.Success : ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("usersettings_delete_birthday")
        .setLabel("생일 삭제")
        .setStyle(ButtonStyle.Danger)
        .setDisabled(!user.birthday)
    ),
  ];

  const deleteOptions = [
    ...myActivities.map(a => ({ label: `[할거] ${truncate(a.value, 80)}`, value: `activity:${a.value}` })),
    ...myFoods.map(f => ({ label: `[음식] ${truncate(f.value, 80)}`, value: `food:${f.value}` })),
    ...myTmi.map(t => ({ label: `[TMI] ${truncate(t.keyword, 80)}`, value: `tmi:${t.keyword}` })),
  ];

  if (deleteOptions.length > 0) {
    rows.push(
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("usersettings_delete_entry")
          .setPlaceholder("삭제할 항목 선택 (할거/음식/TMI)")
          .addOptions(deleteOptions.slice(0, 25))
      )
    );
  }

  return { embeds: [embed], components: rows.slice(0, 5) };
}

export async function handleUserSettingsButton(interaction) {
  const { customId } = interaction;

  if (customId === "usersettings_register_birthday") {
    const modal = new ModalBuilder().setCustomId("usersettings_birthday_modal").setTitle("생일 등록");
    const input = new TextInputBuilder()
      .setCustomId("birthday_value")
      .setLabel("생일 (MM-DD 형식, 예: 03-14)")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
    modal.addComponents(new ActionRowBuilder().addComponents(input));
    return interaction.showModal(modal);
  }

  if (customId === "usersettings_register_activity") {
    const modal = new ModalBuilder().setCustomId("usersettings_activity_modal").setTitle("할거 등록");
    const input = new TextInputBuilder()
      .setCustomId("activity_value")
      .setLabel("추가할 '할거' 항목")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
    modal.addComponents(new ActionRowBuilder().addComponents(input));
    return interaction.showModal(modal);
  }

  if (customId === "usersettings_register_food") {
    const modal = new ModalBuilder().setCustomId("usersettings_food_modal").setTitle("음식 등록");
    const input = new TextInputBuilder()
      .setCustomId("food_value")
      .setLabel("추가할 음식 이름")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
    modal.addComponents(new ActionRowBuilder().addComponents(input));
    return interaction.showModal(modal);
  }

  if (customId === "usersettings_register_tmi") {
    const modal = new ModalBuilder().setCustomId("usersettings_tmi_modal").setTitle("TMI 등록");
    const keywordInput = new TextInputBuilder()
      .setCustomId("tmi_keyword")
      .setLabel("등록할 단어")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
    const responseInput = new TextInputBuilder()
      .setCustomId("tmi_response")
      .setLabel("답변 내용")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);
    modal.addComponents(
      new ActionRowBuilder().addComponents(keywordInput),
      new ActionRowBuilder().addComponents(responseInput)
    );
    return interaction.showModal(modal);
  }

  if (customId === "usersettings_toggle_reply") {
    const users = getUsers();
    const user = getUser(users, interaction.user.id);
    user.replyCheckinEnabled = !user.replyCheckinEnabled;
    saveUsers(users);
    return interaction.update(buildUserSettingsMessage(interaction.user.id));
  }

  if (customId === "usersettings_toggle_mention") {
    const users = getUsers();
    const user = getUser(users, interaction.user.id);
    user.mentionOnCheckin = !user.mentionOnCheckin;
    saveUsers(users);
    return interaction.update(buildUserSettingsMessage(interaction.user.id));
  }

  if (customId === "usersettings_delete_birthday") {
    const users = getUsers();
    const user = getUser(users, interaction.user.id);
    user.birthday = null;
    saveUsers(users);
    return interaction.update(buildUserSettingsMessage(interaction.user.id));
  }
}

export async function handleUserSettingsModal(interaction) {
  const { customId } = interaction;

  if (customId === "usersettings_birthday_modal") {
    const value = interaction.fields.getTextInputValue("birthday_value").trim();
    if (!/^\d{2}-\d{2}$/.test(value)) {
      return interaction.reply({ content: "MM-DD 형식으로 입력해줘! (예: 03-14)", ephemeral: true });
    }
    const users = getUsers();
    const user = getUser(users, interaction.user.id);
    user.birthday = value;
    saveUsers(users);
    return interaction.update(buildUserSettingsMessage(interaction.user.id));
  }

  if (customId === "usersettings_activity_modal") {
    const value = interaction.fields.getTextInputValue("activity_value").trim();
    const list = getExtraActivities();
    list.push({ value, addedBy: interaction.user.id });
    saveExtraActivities(list);
    return interaction.update(buildUserSettingsMessage(interaction.user.id));
  }

  if (customId === "usersettings_food_modal") {
    const value = interaction.fields.getTextInputValue("food_value").trim();
    const list = getExtraFoods();
    list.push({ value, addedBy: interaction.user.id });
    saveExtraFoods(list);
    return interaction.update(buildUserSettingsMessage(interaction.user.id));
  }

  if (customId === "usersettings_tmi_modal") {
    const keyword = interaction.fields.getTextInputValue("tmi_keyword").trim();
    const response = interaction.fields.getTextInputValue("tmi_response").trim();
    if (!keyword || !response) {
      return interaction.reply({ content: "키워드랑 응답 둘 다 입력해줘!", ephemeral: true });
    }
    const list = getTmiList();
    if (list.some(t => t.keyword === keyword)) {
      return interaction.reply({ content: "이미 등록된 단어야!", ephemeral: true });
    }
    list.push({ keyword, response, addedBy: interaction.user.id });
    saveTmiList(list);
    return interaction.update(buildUserSettingsMessage(interaction.user.id));
  }
}

export async function handleUserSettingsSelect(interaction) {
  if (interaction.customId !== "usersettings_delete_entry") return;

  const raw = interaction.values[0];
  const separatorIndex = raw.indexOf(":");
  const category = raw.slice(0, separatorIndex);
  const identifier = raw.slice(separatorIndex + 1);

  if (category === "activity") {
    const list = getExtraActivities();
    const idx = list.findIndex(e => {
      const n = normalizeEntry(e);
      return n.value === identifier && n.addedBy === interaction.user.id;
    });
    if (idx !== -1) {
      list.splice(idx, 1);
      saveExtraActivities(list);
    }
  } else if (category === "food") {
    const list = getExtraFoods();
    const idx = list.findIndex(e => {
      const n = normalizeEntry(e);
      return n.value === identifier && n.addedBy === interaction.user.id;
    });
    if (idx !== -1) {
      list.splice(idx, 1);
      saveExtraFoods(list);
    }
  } else if (category === "tmi") {
    const list = getTmiList();
    const idx = list.findIndex(t => t.keyword === identifier && t.addedBy === interaction.user.id);
    if (idx !== -1) {
      list.splice(idx, 1);
      saveTmiList(list);
    }
  }

  return interaction.update(buildUserSettingsMessage(interaction.user.id));
}
