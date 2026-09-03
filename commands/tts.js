import { SlashCommandBuilder } from "discord.js";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { createAudioPlayer, createAudioResource, getVoiceConnection } from "@discordjs/voice";

export default {
  data: new SlashCommandBuilder()
    .setName("tts")
    .setDescription("미디가 말함!! (개쩔음)")
    .addStringOption(option =>
      option.setName("message").setDescription("봇이 말할 문장").setRequired(true)
    ),
  async execute(interaction) {
    const message = interaction.options.getString("message");
    const connection = getVoiceConnection(interaction.guild.id);
    if (!connection)
      return interaction.reply({ content: "먼저 `/입장`으로 음성 채널에 불러줘", ephemeral: true });

    try {
      await interaction.deferReply();
      const apiKey = process.env.ELEVENLABS_API_KEY;
      const voiceId = process.env.ELEVENLABS_VOICE_ID;
      const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: message,
          model_id: "eleven_multilingual_v2",
        }),
      });

      if (!res.ok) throw new Error(`API 오류: ${res.status}`);
      const buffer = Buffer.from(await res.arrayBuffer());
      const filePath = path.resolve(`./tts_${Date.now()}.mp3`);
      fs.writeFileSync(filePath, buffer);

      const resource = createAudioResource(filePath);
      const player = createAudioPlayer();
      player.play(resource);
      connection.subscribe(player);

      await interaction.editReply({ content: `"${message}"` });
      player.on("idle", () => fs.unlinkSync(filePath));
    } catch (err) {
      console.error(err);
      await interaction.editReply({ content: "이거 TTS 오류남 고쳐 시1발" });
    }
  },
};
