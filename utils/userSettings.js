import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { getUsers, saveUsers, getUser } from "./store.js";

export function buildUserSettingsMessage(userId) {
  const users = getUsers();
  const user = getUser(users, userId);

  const embed = new EmbedBuilder()
    .setTitle("내 설정")
    .addFields({ name: "출첵 DM 알림", value: user.dmCheckinEnabled ? "켜짐" : "꺼짐" })
    .setColor(0x5865f2);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("usersettings_toggle_dm")
      .setLabel(user.dmCheckinEnabled ? "출첵 DM 끄기" : "출첵 DM 켜기")
      .setStyle(user.dmCheckinEnabled ? ButtonStyle.Success : ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [row] };
}

export async function handleUserSettingsButton(interaction) {
  if (interaction.customId !== "usersettings_toggle_dm") return;

  const users = getUsers();
  const user = getUser(users, interaction.user.id);
  user.dmCheckinEnabled = !user.dmCheckinEnabled;
  saveUsers(users);

  return interaction.update(buildUserSettingsMessage(interaction.user.id));
}
