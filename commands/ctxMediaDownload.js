import {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { extractUrl, detectSite } from "../utils/mediaTools.js";

export default {
  data: new ContextMenuCommandBuilder()
    .setName("download")
    .setNameLocalizations({ ko: "미디 다운로드" })
    .setType(ApplicationCommandType.Message),

  async execute(interaction) {
    const message = interaction.targetMessage;
    const url = extractUrl(message.content);

    if (!url) {
      return interaction.reply({ content: "메시지에서 링크를 못 찾았어.", ephemeral: true });
    }
    if (detectSite(url) === "unknown") {
      return interaction.reply({
        content: "지원 안 하는 링크야. 유튜브, 트위터(X), 핀터레스트만 돼.",
        ephemeral: true,
      });
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`mediatools_dl:mp3:${message.channelId}:${message.id}`)
        .setLabel("mp3로 다운로드")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`mediatools_dl:mp4:${message.channelId}:${message.id}`)
        .setLabel("mp4로 다운로드")
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({ content: "형식을 골라줘.", components: [row], ephemeral: true });
  },
};
