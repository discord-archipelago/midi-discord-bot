import { Client, GatewayIntentBits, REST, Routes, Collection } from "discord.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { getConfig, OWNER_ID } from "./utils/store.js";
import { handleCheckin } from "./utils/checkin.js";
import { handleProfanity } from "./utils/profanity.js";
import { handleTmi } from "./utils/tmi.js";
import {
  handleSettingsButton,
  handleSettingsChannelSelect,
  handleSettingsUserSelect,
  handleSettingsModal,
} from "./utils/settingsPanel.js";
import {
  handleUserSettingsButton,
  handleUserSettingsModal,
  handleUserSettingsSelect,
} from "./utils/userSettings.js";
import { checkBirthdays } from "./utils/birthday.js";
import { handleCheckinRankingButton } from "./utils/checkinRanking.js";
import { handleWarningListButton } from "./utils/warningList.js";

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
  await handleTmi(msg);

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
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    const config = getConfig();
    if (config.ownerOnly && interaction.user.id !== OWNER_ID) {
      return interaction.reply({ content: "지금은 히원만 명령어 사용 가능해!", ephemeral: true });
    }

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: " 명령 실행 중 오류 발생!", ephemeral: true }).catch(() => {});
    }
    return;
  }

  if (interaction.isButton()) {
    if (interaction.customId.startsWith("settings_")) {
      return handleSettingsButton(interaction).catch(err => console.error(err));
    }
    if (interaction.customId.startsWith("usersettings_")) {
      return handleUserSettingsButton(interaction).catch(err => console.error(err));
    }
    if (interaction.customId.startsWith("checkinranking_page:")) {
      return handleCheckinRankingButton(interaction).catch(err => console.error(err));
    }
    if (interaction.customId.startsWith("serverinfo_page:")) {
      return handleWarningListButton(interaction).catch(err => console.error(err));
    }
    return;
  }

  if (interaction.isChannelSelectMenu()) {
    return handleSettingsChannelSelect(interaction).catch(err => console.error(err));
  }

  if (interaction.isUserSelectMenu()) {
    return handleSettingsUserSelect(interaction).catch(err => console.error(err));
  }

  if (interaction.isStringSelectMenu()) {
    return handleUserSettingsSelect(interaction).catch(err => console.error(err));
  }

  if (interaction.isModalSubmit()) {
    if (interaction.customId.startsWith("settings_migrate")) {
      return handleSettingsModal(interaction).catch(err => console.error(err));
    }
    if (interaction.customId.startsWith("usersettings_")) {
      return handleUserSettingsModal(interaction).catch(err => console.error(err));
    }
  }
});

client.once("clientReady", () => {
  console.log(` 로그인 완료! ${client.user.tag}`);
  checkBirthdays(client).catch(err => console.error("생일 체크 오류:", err));
  setInterval(() => {
    checkBirthdays(client).catch(err => console.error("생일 체크 오류:", err));
  }, 60 * 60 * 1000);
});

client.login(process.env.TOKEN);
