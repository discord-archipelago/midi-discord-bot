import { SlashCommandBuilder, AttachmentBuilder } from "discord.js";
import fs from "fs";
import os from "os";
import path from "path";
import fetch from "node-fetch";
import { detectSite, downloadMedia, convertToMp3, convertToGif, convertImageToGif } from "../utils/mediaTools.js";

const MAX_FILE_SIZE = 24 * 1024 * 1024;
const IMAGE_EXTS = [".png", ".jpg", ".jpeg", ".webp"];

async function downloadToFile(url, destPath) {
  const res = await fetch(url);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destPath, buffer);
}

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

export default {
  data: new SlashCommandBuilder()
    .setName("변환")
    .setDescription("링크 다운로드 또는 파일 변환 (mp3/mp4/gif)")
    .addStringOption(opt => opt.setName("url").setDescription("유튜브/트위터/핀터레스트 링크").setRequired(false))
    .addAttachmentOption(opt => opt.setName("파일").setDescription("변환할 mp4 또는 이미지 파일").setRequired(false))
    .addStringOption(opt =>
      opt
        .setName("형식")
        .setDescription("원하는 결과 형식")
        .setRequired(true)
        .addChoices(
          { name: "mp3", value: "mp3" },
          { name: "mp4", value: "mp4" },
          { name: "gif", value: "gif" }
        )
    ),

  async execute(interaction) {
    const url = interaction.options.getString("url");
    const file = interaction.options.getAttachment("파일");
    const format = interaction.options.getString("형식");

    if (!url && !file) {
      return interaction.reply({ content: "url이나 파일 중 하나는 넣어줘!", ephemeral: true });
    }
    if (url && file) {
      return interaction.reply({ content: "url이랑 파일 둘 다 말고 하나만 넣어줘!", ephemeral: true });
    }

    await interaction.deferReply();

    const base = path.join(os.tmpdir(), `mediaconvert_${interaction.id}`);
    const cleanup = [];

    try {
      if (url) {
        if (detectSite(url) === "unknown") {
          await interaction.editReply("지원 안 하는 링크야. 유튜브, 트위터(X), 핀터레스트만 돼.");
          return;
        }

        if (format === "gif") {
          const dl = await downloadMedia(url, "mp4", base);
          if (!dl.ok) {
            await interaction.editReply(`다운로드 실패 :(\n\`\`\`${dl.error}\`\`\``);
            return;
          }
          cleanup.push(dl.path);
          const gifPath = `${base}_out.gif`;
          const conv = await convertToGif(dl.path, gifPath);
          if (!conv.ok) {
            await interaction.editReply(`GIF 변환 실패 :(\n\`\`\`${conv.error}\`\`\``);
            return;
          }
          cleanup.push(gifPath);
          await sendFile(interaction, gifPath, "result.gif");
          return;
        }

        const dl = await downloadMedia(url, format, base);
        if (!dl.ok) {
          await interaction.editReply(`다운로드 실패 :(\n\`\`\`${dl.error}\`\`\``);
          return;
        }
        cleanup.push(dl.path);
        await sendFile(interaction, dl.path, `result.${format}`);
        return;
      }

      // 파일 변환
      const ext = path.extname(file.name || "").toLowerCase();
      const inputPath = `${base}${ext}`;
      cleanup.push(inputPath);
      await downloadToFile(file.url, inputPath);

      if (IMAGE_EXTS.includes(ext)) {
        if (format !== "gif") {
          await interaction.editReply("이미지는 gif로만 변환할 수 있어!");
          return;
        }
        const outPath = `${base}_out.gif`;
        cleanup.push(outPath);
        const conv = await convertImageToGif(inputPath, outPath);
        if (!conv.ok) {
          await interaction.editReply(`변환 실패 :(\n\`\`\`${conv.error}\`\`\``);
          return;
        }
        await sendFile(interaction, outPath, "result.gif");
        return;
      }

      if (ext !== ".mp4") {
        await interaction.editReply("mp4 또는 이미지(png/jpg/jpeg/webp) 파일만 변환 가능해!");
        return;
      }

      if (format === "mp3") {
        const outPath = `${base}_out.mp3`;
        cleanup.push(outPath);
        const conv = await convertToMp3(inputPath, outPath);
        if (!conv.ok) {
          await interaction.editReply(`변환 실패 :(\n\`\`\`${conv.error}\`\`\``);
          return;
        }
        await sendFile(interaction, outPath, "result.mp3");
        return;
      }

      if (format === "gif") {
        const outPath = `${base}_out.gif`;
        cleanup.push(outPath);
        const conv = await convertToGif(inputPath, outPath);
        if (!conv.ok) {
          await interaction.editReply(`변환 실패 :(\n\`\`\`${conv.error}\`\`\``);
          return;
        }
        await sendFile(interaction, outPath, "result.gif");
        return;
      }

      await interaction.editReply("mp4 파일은 mp3나 gif로만 변환할 수 있어!");
    } catch (err) {
      console.error(err);
      await interaction.editReply(`오류 발생 :(\n\`\`\`${err.message}\`\`\``).catch(() => {});
    } finally {
      for (const p of cleanup) {
        if (fs.existsSync(p)) fs.unlinkSync(p);
      }
    }
  },
};
