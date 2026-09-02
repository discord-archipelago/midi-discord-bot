import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
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

export function buildRegisterMenu() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("register_birthday").setLabel("생일 등록").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("register_dungjjal").setLabel("짤 등록").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("register_activity").setLabel("할거 등록").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("register_food").setLabel("음식 등록").setStyle(ButtonStyle.Secondary)
  );
}

export async function handleRegisterButton(interaction) {
  if (interaction.customId === "register_birthday") {
    const modal = new ModalBuilder().setCustomId("birthday_modal").setTitle("생일 등록");
    const input = new TextInputBuilder()
      .setCustomId("birthday_value")
      .setLabel("생일 (MM-DD 형식, 예: 03-14)")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
    modal.addComponents(new ActionRowBuilder().addComponents(input));
    return interaction.showModal(modal);
  }

  if (interaction.customId === "register_dungjjal") {
    const modal = new ModalBuilder().setCustomId("dungjjal_modal").setTitle("똥짤 등록");
    const input = new TextInputBuilder()
      .setCustomId("dungjjal_url")
      .setLabel("이미지/gif 링크")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
    modal.addComponents(new ActionRowBuilder().addComponents(input));
    return interaction.showModal(modal);
  }

  if (interaction.customId === "register_activity") {
    const modal = new ModalBuilder().setCustomId("activity_modal").setTitle("할거 등록");
    const input = new TextInputBuilder()
      .setCustomId("activity_value")
      .setLabel("추가할 '할거' 항목")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
    modal.addComponents(new ActionRowBuilder().addComponents(input));
    return interaction.showModal(modal);
  }

  if (interaction.customId === "register_food") {
    const modal = new ModalBuilder().setCustomId("food_modal").setTitle("음식 등록");
    const input = new TextInputBuilder()
      .setCustomId("food_value")
      .setLabel("추가할 음식 이름")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
    modal.addComponents(new ActionRowBuilder().addComponents(input));
    return interaction.showModal(modal);
  }
}

export async function handleRegisterModal(interaction) {
  if (interaction.customId === "birthday_modal") {
    const value = interaction.fields.getTextInputValue("birthday_value").trim();
    if (!/^\d{2}-\d{2}$/.test(value)) {
      return interaction.reply({ content: "MM-DD 형식으로 입력해줘! (예: 03-14)", ephemeral: true });
    }
    const users = getUsers();
    const user = getUser(users, interaction.user.id);
    user.birthday = value;
    saveUsers(users);
    return interaction.reply({ content: `생일을 ${value}로 등록함!`, ephemeral: true });
  }

  if (interaction.customId === "dungjjal_modal") {
    const url = interaction.fields.getTextInputValue("dungjjal_url").trim();
    if (!/^https?:\/\//i.test(url)) {
      return interaction.reply({ content: "http(s):// 로 시작하는 링크를 입력해줘!", ephemeral: true });
    }
    const data = getDungjjal();
    data.images.push({ url, addedBy: interaction.user.id });
    saveDungjjal(data);
    return interaction.reply({ content: "똥짤 등록 완료!", ephemeral: true });
  }

  if (interaction.customId === "activity_modal") {
    const value = interaction.fields.getTextInputValue("activity_value").trim();
    const list = getExtraActivities();
    list.push(value);
    saveExtraActivities(list);
    return interaction.reply({ content: `"${value}" 할거 목록에 추가함!`, ephemeral: true });
  }

  if (interaction.customId === "food_modal") {
    const value = interaction.fields.getTextInputValue("food_value").trim();
    const list = getExtraFoods();
    list.push(value);
    saveExtraFoods(list);
    return interaction.reply({ content: `"${value}" 음식 목록에 추가함!`, ephemeral: true });
  }
}
