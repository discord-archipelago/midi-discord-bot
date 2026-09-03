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
  getDungjjal,
  saveDungjjal,
  getExtraActivities,
  saveExtraActivities,
  getExtraFoods,
  saveExtraFoods,
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

  const dungjjal = getDungjjal();
  const myDungjjal = dungjjal.images.filter(img => img.addedBy === userId);

  const activities = getExtraActivities().map(normalizeEntry);
  const myActivities = activities.filter(a => a.addedBy === userId);

  const foods = getExtraFoods().map(normalizeEntry);
  const myFoods = foods.filter(f => f.addedBy === userId);

  const embed = new EmbedBuilder()
    .setTitle("내 설정")
    .addFields(
      { name: "생일", value: user.birthday || "미등록", inline: true },
      { name: "출첵 답장 알림", value: user.replyCheckinEnabled ? "켜짐" : "꺼짐", inline: true },
      { name: "등록한 짤", value: `${myDungjjal.length}개`, inline: true },
      { name: "등록한 할거", value: `${myActivities.length}개`, inline: true },
      { name: "등록한 음식", value: `${myFoods.length}개`, inline: true }
    )
    .setColor(0x5865f2);

  const rows = [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("usersettings_register_birthday")
        .setLabel("생일 등록/수정")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("usersettings_register_dungjjal")
        .setLabel("짤 등록")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("usersettings_register_activity")
        .setLabel("할거 등록")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("usersettings_register_food")
        .setLabel("음식 등록")
        .setStyle(ButtonStyle.Primary)
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("usersettings_toggle_reply")
        .setLabel(user.replyCheckinEnabled ? "출첵 답장 끄기" : "출첵 답장 켜기")
        .setStyle(user.replyCheckinEnabled ? ButtonStyle.Success : ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("usersettings_delete_birthday")
        .setLabel("생일 삭제")
        .setStyle(ButtonStyle.Danger)
        .setDisabled(!user.birthday)
    ),
  ];

  if (myDungjjal.length > 0) {
    rows.push(
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("usersettings_delete_dungjjal")
          .setPlaceholder("삭제할 짤 선택")
          .addOptions(
            myDungjjal.slice(0, 25).map(img => ({
              label: truncate(img.url),
              value: String(dungjjal.images.indexOf(img)),
            }))
          )
      )
    );
  }

  if (myActivities.length > 0) {
    rows.push(
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("usersettings_delete_activity")
          .setPlaceholder("삭제할 할거 선택")
          .addOptions(myActivities.slice(0, 25).map(a => ({ label: truncate(a.value), value: a.value })))
      )
    );
  }

  if (myFoods.length > 0) {
    rows.push(
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("usersettings_delete_food")
          .setPlaceholder("삭제할 음식 선택")
          .addOptions(myFoods.slice(0, 25).map(f => ({ label: truncate(f.value), value: f.value })))
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

  if (customId === "usersettings_register_dungjjal") {
    const modal = new ModalBuilder().setCustomId("usersettings_dungjjal_modal").setTitle("똥짤 등록");
    const input = new TextInputBuilder()
      .setCustomId("dungjjal_url")
      .setLabel("이미지/gif 링크")
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

  if (customId === "usersettings_toggle_reply") {
    const users = getUsers();
    const user = getUser(users, interaction.user.id);
    user.replyCheckinEnabled = !user.replyCheckinEnabled;
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

  if (customId === "usersettings_dungjjal_modal") {
    const url = interaction.fields.getTextInputValue("dungjjal_url").trim();
    if (!/^https?:\/\//i.test(url)) {
      return interaction.reply({ content: "http(s):// 로 시작하는 링크를 입력해줘!", ephemeral: true });
    }
    const data = getDungjjal();
    data.images.push({ url, addedBy: interaction.user.id });
    saveDungjjal(data);
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
}

export async function handleUserSettingsSelect(interaction) {
  const { customId } = interaction;
  const selected = interaction.values[0];

  if (customId === "usersettings_delete_dungjjal") {
    const data = getDungjjal();
    const index = Number(selected);
    if (data.images[index] && data.images[index].addedBy === interaction.user.id) {
      data.images.splice(index, 1);
      saveDungjjal(data);
    }
    return interaction.update(buildUserSettingsMessage(interaction.user.id));
  }

  if (customId === "usersettings_delete_activity") {
    const list = getExtraActivities();
    const idx = list.findIndex(e => {
      const n = normalizeEntry(e);
      return n.value === selected && n.addedBy === interaction.user.id;
    });
    if (idx !== -1) {
      list.splice(idx, 1);
      saveExtraActivities(list);
    }
    return interaction.update(buildUserSettingsMessage(interaction.user.id));
  }

  if (customId === "usersettings_delete_food") {
    const list = getExtraFoods();
    const idx = list.findIndex(e => {
      const n = normalizeEntry(e);
      return n.value === selected && n.addedBy === interaction.user.id;
    });
    if (idx !== -1) {
      list.splice(idx, 1);
      saveExtraFoods(list);
    }
    return interaction.update(buildUserSettingsMessage(interaction.user.id));
  }
}
