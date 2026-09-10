import fs from "fs";
import os from "os";
import path from "path";
import { AttachmentBuilder } from "discord.js";
import fetch from "node-fetch";
import { downloadMedia, convertToMp3, convertToGif, convertImageToGif, extractUrl } from "./mediaTools.js";

const MAX_FILE_SIZE = 24 * 1024 * 1024;

async function sendFile(interaction, filePath, filename) {
  const size = fs.statSync(filePath).size;
  if (size > MAX_FILE_SIZE) {
    await interaction.editReply(`파일이 너무 큼 (${Math.floor(size / 1024 / 1024)}MB). 디코 업로드 한계 초과`);
    return;
  }
  await interaction.editReply({
    content: "완료!",
    files: [new AttachmentBuilder(filePath, { name: filename })],
  });
}

async function downloadToFile(url, destPath) {
  const res = await fetch(url);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destPath, buffer);
}

export async function handleMediaDownloadButton(interaction) {
  const [, format, channelId, messageId] = interaction.customId.split(":");
  await interaction.update({ content: `${format}로 다운로드 중...`, components: [] });

  const channel = await interaction.client.channels.fetch(channelId).catch(() => null);
  const message = channel ? await channel.messages.fetch(messageId).catch(() => null) : null;
  const url = message ? extractUrl(message.content) : null;

  if (!url) {
    await interaction.editReply("원본 메시지를 찾을 수 없어졌어.");
    return;
  }

  const base = path.join(os.tmpdir(), `mediadl_${interaction.id}`);
  let dl;

  try {
    dl = await downloadMedia(url, format, base);
    if (!dl.ok) {
      await interaction.editReply(`다운로드 실패 :(\n\`\`\`${dl.error}\`\`\``);
      return;
    }
    await sendFile(interaction, dl.path, `result.${format}`);
  } catch (err) {
    console.error(err);
    await interaction.editReply(`오류 발생 :(\n\`\`\`${err.message}\`\`\``).catch(() => {});
  } finally {
    if (dl && dl.ok && fs.existsSync(dl.path)) fs.unlinkSync(dl.path);
  }
}

export async function handleMediaConvertButton(interaction) {
  const [, mode, channelId, messageId] = interaction.customId.split(":");
  await interaction.update({ content: "변환 중...", components: [] });

  const channel = await interaction.client.channels.fetch(channelId).catch(() => null);
  const message = channel ? await channel.messages.fetch(messageId).catch(() => null) : null;
  const attachment = message ? message.attachments.first() : null;

  if (!attachment) {
    await interaction.editReply("원본 메시지나 첨부파일을 찾을 수 없어졌어.");
    return;
  }

  const ext = path.extname(attachment.name || "").toLowerCase();
  const base = path.join(os.tmpdir(), `mediaconv_${interaction.id}`);
  const inputPath = `${base}${ext}`;
  const cleanup = [inputPath];

  try {
    await downloadToFile(attachment.url, inputPath);

    let outPath;
    let conv;
    let filename;

    if (mode === "imggif") {
      outPath = `${base}_out.gif`;
      conv = await convertImageToGif(inputPath, outPath);
      filename = "result.gif";
    } else if (mode === "mp3") {
      outPath = `${base}_out.mp3`;
      conv = await convertToMp3(inputPath, outPath);
      filename = "result.mp3";
    } else if (mode === "gif") {
      outPath = `${base}_out.gif`;
      conv = await convertToGif(inputPath, outPath);
      filename = "result.gif";
    } else {
      await interaction.editReply("알 수 없는 변환 요청이야.");
      return;
    }

    cleanup.push(outPath);

    if (!conv.ok) {
      await interaction.editReply(`변환 실패 :(\n\`\`\`${conv.error}\`\`\``);
      return;
    }

    await sendFile(interaction, outPath, filename);
  } catch (err) {
    console.error(err);
    await interaction.editReply(`오류 발생 :(\n\`\`\`${err.message}\`\`\``).catch(() => {});
  } finally {
    for (const p of cleanup) {
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
  }
}
