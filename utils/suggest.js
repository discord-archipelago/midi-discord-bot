import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from "discord.js";

// 기능 제안을 받을 채널 ID (직접 채워 넣기)
const SUGGESTION_CHANNEL_ID = "여기에_채널ID_입력";

export function buildSuggestionModal() {
  const modal = new ModalBuilder().setCustomId("suggestion_modal").setTitle("기능 제안");
  const input = new TextInputBuilder()
    .setCustomId("suggestion_content")
    .setLabel("어떤 기능을 추가하면 좋을까?")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);
  modal.addComponents(new ActionRowBuilder().addComponents(input));
  return modal;
}

export async function handleSuggestionModal(interaction) {
  const content = interaction.fields.getTextInputValue("suggestion_content").trim();

  const channel = await interaction.client.channels.fetch(SUGGESTION_CHANNEL_ID).catch(() => null);
  if (channel) {
    channel.send(`💡 **기능 제안** (${interaction.user.tag})\n${content}`).catch(() => {});
  }

  await interaction.reply({ content: "제안 보냄! 고마워~", ephemeral: true });
}
