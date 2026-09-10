import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import ffmpegPath from "ffmpeg-static";

const execFileAsync = promisify(execFile);

export function detectSite(url) {
  if (/(youtube\.com|youtu\.be)/.test(url)) return "youtube";
  if (/(twitter\.com|x\.com)/.test(url)) return "twitter";
  if (/pinterest\.(com|co\.kr)/.test(url)) return "pinterest";
  return "unknown";
}

export function extractUrl(text) {
  const match = (text || "").match(/https?:\/\/\S+/);
  return match ? match[0] : null;
}

export async function downloadMedia(url, format, outputBase) {
  const args =
    format === "mp3"
      ? [
          url,
          "-f", "bestaudio/best",
          "-o", `${outputBase}.%(ext)s`,
          "--extract-audio",
          "--audio-format", "mp3",
          "--audio-quality", "192K",
          "--quiet",
          "--no-warnings",
        ]
      : [
          url,
          "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
          "-o", `${outputBase}.%(ext)s`,
          "--merge-output-format", "mp4",
          "--quiet",
          "--no-warnings",
        ];

  try {
    await execFileAsync("yt-dlp", args, { maxBuffer: 1024 * 1024 * 50 });
  } catch (err) {
    return { ok: false, error: err.stderr || err.message };
  }

  const expectedExt = format === "mp3" ? ".mp3" : ".mp4";
  const expectedPath = `${outputBase}${expectedExt}`;
  if (fs.existsSync(expectedPath)) return { ok: true, path: expectedPath };

  const dir = path.dirname(outputBase);
  const baseName = path.basename(outputBase);
  const match = fs.readdirSync(dir).find(f => f.startsWith(baseName));
  if (match) return { ok: true, path: path.join(dir, match) };

  return { ok: false, error: "파일을 찾을 수 없음. 다운로드 실패했을 수 있음" };
}

export async function convertToMp3(inputPath, outputPath) {
  try {
    await execFileAsync(ffmpegPath, ["-i", inputPath, "-q:a", "0", "-map", "a", "-y", outputPath]);
    return { ok: true, path: outputPath };
  } catch (err) {
    return { ok: false, error: "변환 실패. 입력 파일을 확인해봐" };
  }
}

export async function convertToGif(inputPath, outputPath, fps = 15, scale = 100) {
  try {
    const filter = `scale=iw*${scale}/100:-1,fps=${fps},split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`;
    await execFileAsync(ffmpegPath, ["-i", inputPath, "-vf", filter, "-y", outputPath]);
    return { ok: true, path: outputPath };
  } catch (err) {
    return { ok: false, error: "변환 실패. 입력 파일을 확인해봐" };
  }
}

export async function convertImageToGif(inputPath, outputPath) {
  try {
    await execFileAsync(ffmpegPath, ["-i", inputPath, "-y", outputPath]);
    return { ok: true, path: outputPath };
  } catch (err) {
    return { ok: false, error: "변환 실패. 입력 파일을 확인해봐" };
  }
}
