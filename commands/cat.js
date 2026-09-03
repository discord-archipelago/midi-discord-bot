import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import fetch from "node-fetch";

async function fetchFromCatApi() {
  const res = await fetch("https://api.thecatapi.com/v1/images/search");
  if (!res.ok) throw new Error(`TheCatAPI 오류: ${res.status}`);
  const [data] = await res.json();
  return data.url;
}

async function fetchFromCataas() {
  const res = await fetch("https://cataas.com/cat?json=true");
  if (!res.ok) throw new Error(`cataas 오류;;; ${res.status}`);
  const data = await res.json();
  return data.url;
}

export default {
  data: new SlashCommandBuilder().setName("고양이").setDescription("고양이 사진으로 힐링하기"),

  async execute(interaction) {
    await interaction.deferReply();

    const fetchers = [fetchFromCatApi, fetchFromCataas];
    const fetchImage = fetchers[Math.floor(Math.random() * fetchers.length)];

    try {
      const imageUrl = await fetchImage();
      const embed = new EmbedBuilder().setImage(imageUrl).setColor(0xffa500);
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error("고양이 가져오기 실패;;;;", err);
      await interaction.editReply("고양이가 튀었는데;; 저거 잡아와");
    }
  },
};
