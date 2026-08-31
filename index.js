import { Client, GatewayIntentBits, REST, Routes, Collection } from "discord.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { getConfig, OWNER_ID } from "./utils/store.js";
import { handleCheckin } from "./utils/checkin.js";
import { handleProfanity } from "./utils/profanity.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// 명령어 로드
client.commands = new Collection();
const commands = [];
const commandFiles = fs.readdirSync(path.join(__dirname, "commands")).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  client.commands.set(command.default.data.name, command.default);
  commands.push(command.default.data.toJSON());
}

// 슬래시 명령 등록
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
(async () => {
  try {
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    console.log(" 슬래시 명령 등록 완료!");
  } catch (err) {
    console.error("명령어 등록 실패:", err);
  }
})();

// 출첵 / 욕설 카운트 / SAY 기능
client.on("messageCreate", async msg => {
  if (msg.author.bot) return;
  if (!msg.guild) return;

  await handleCheckin(msg);
  await handleProfanity(msg);

  if (!msg.content.startsWith("SAY ")) return;

  const config = getConfig();
  if (!config.sayEnabled) return;

  const text = msg.content.slice(4).trim();
  if (!text) return;

  try {
    await msg.channel.send(text);
    await msg.delete().catch(() => {});
  } catch (err) {
    console.error("SAY 처리 오류:", err);
  }
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  const config = getConfig();
  if (config.ownerOnly && interaction.user.id !== OWNER_ID) {
    return interaction.reply({ content: "지금은 오너만 명령어 사용 가능해!", ephemeral: true });
  }

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: " 명령 실행 중 오류 발생!", ephemeral: true }).catch(() => {});
  }
});

client.once("clientReady", () => {
  console.log(` 로그인 완료! ${client.user.tag}`);
});

client.login(process.env.TOKEN);
