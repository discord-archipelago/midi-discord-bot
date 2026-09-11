import {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import path from "path";

const IMAGE_EXTS = [".png", ".jpg", ".jpeg", ".webp"];

export default {
  data: new ContextMenuCommandBuilder()
    .setName("convert")
    .setNameLocalizations({ ko: "변환" })
    .setType(ApplicationCommandType.Message),

  async execute(interaction) {
    const message = interaction.targetMessage;
    const attachment = message.attachments.first();

    if (!attachment) {
      return interaction.reply({ content: "첨부파일이 없는 메시지야.", ephemeral: true });
    }

    const ext = path.extname(attachment.name || "").toLowerCase();

    if (IMAGE_EXTS.includes(ext)) {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`mediatools_conv:imggif:${message.channelId}:${message.id}`)
          .setLabel("GIF로 변환")
          .setStyle(ButtonStyle.Secondary)
      );
      return interaction.reply({ content: "이미지를 GIF로 변환할까?", components: [row], ephemeral: true });
    }

    if (ext === ".mp4") {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`mediatools_conv:mp3:${message.channelId}:${message.id}`)
          .setLabel("mp3로 변환")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`mediatools_conv:gif:${message.channelId}:${message.id}`)
          .setLabel("gif로 변환")
          .setStyle(ButtonStyle.Secondary)
      );
      return interaction.reply({ content: "형식을 골라줘.", components: [row], ephemeral: true });
    }

    await interaction.reply({
      content: "mp4나 이미지(png/jpg/jpeg/webp) 첨부파일만 변환 가능해.",
      ephemeral: true,
    });
  },
};
