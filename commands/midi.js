import { SlashCommandBuilder } from "discord.js";
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  getVoiceConnection,
} from "@discordjs/voice";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Readable } from "stream";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//  음 높이와 파일 이름 매핑
function getSamplePath(note) {
  const match = note.match(/^([A-Ga-g#b]+)(\d)$/);
  if (!match) return null;

  const name = match[1]
    .replace("♯", "#")
    .replace("b", "b")
    .toLowerCase();
  const octave = match[2];
  const fileName = `${name}${octave}.wav`;

  const filePath = path.join(__dirname, "../samples", fileName);
  return fs.existsSync(filePath) ? filePath : null;
}

//  미디 명령어
export default {
  data: new SlashCommandBuilder()
    .setName("midi")
    .setDescription("미디가 피아노를 연주함")
    .addStringOption(option =>
      option
        .setName("notes")
        .setDescription("예: C4-D4-E4 또는 C4---C4")
        .setRequired(true)
    ),

  async execute(interaction) {
    const notesInput = interaction.options.getString("notes");
    const channel = interaction.member.voice.channel;

    if (!channel) {
      return interaction.reply(" 먼저 음성 채널에 들어가줘!");
    }

    let connection = getVoiceConnection(interaction.guild.id);
    if (!connection) {
      connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });
    }

    const player = createAudioPlayer();
    connection.subscribe(player);

    await interaction.reply(`미디가 연주를 시작합니다! (${notesInput})`);

    const notes = notesInput.split(/[-]+/g).filter(Boolean);

    for (const note of notes) {
      const samplePath = getSamplePath(note.trim());
      if (!samplePath) {
        console.warn(`⚠️ 샘플 없음: ${note}`);
        continue;
      }

      const resource = createAudioResource(samplePath);
      player.play(resource);

      // 노트 간 대기 (하이픈 수로 조절)
      const match = notesInput.match(new RegExp(`${note}(-*)`, "i"));
      const delay = match && match[1] ? match[1].length * 100 : 400;

      await new Promise(res => {
        player.once(AudioPlayerStatus.Idle, res);
        setTimeout(res, delay);
      });
    }

  },
};
