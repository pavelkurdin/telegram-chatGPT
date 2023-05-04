import config from "config";
import { Telegraf, session } from "telegraf";
import { message } from "telegraf/filters";
import { ogg } from "./ogg.js";
import { openai } from "./openai.js";
import { code } from "telegraf/format";

const bot = new Telegraf(config.get("TELEGRAF_API_ID"));
console.log(config.get("TEST_ENV"));
const NEW_SESSION = {
  messages: [],
};

bot.launch();

bot.command("new", async (ctx) => {
  ctx.session = NEW_SESSION;
  await ctx.reply("Ready to new conversation");
});

bot.command("start", async (ctx) => {
  ctx.session = NEW_SESSION;
  await ctx.reply("Ready to new conversation");
});

bot.use(session());

bot.on(message("voice"), async (ctx) => {
  ctx.session ??= NEW_SESSION;
  try {
    await ctx.reply(
      code("Recievied message. Waiting response from the server...")
    );

    const url = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
    const userId = ctx.message.from.id;
    const oggPath = await ogg.create(url.href, userId);
    const mp3Path = await ogg.toMp3(oggPath, userId);
    const text = await openai.transcription(mp3Path);
    await ctx.reply("Request: " + text);

    ctx.session.messages.push({ role: openai.roles.USER, content: text });
    const response = await openai.chat(ctx.session.messages);
    ctx.session.messages.push({
      role: openai.roles.ASSISTANT,
      content: response.content,
    });
    await ctx.reply(response.content);
  } catch (e) {
    console.log("Error while voice message " + e.message);
  }
});

bot.on(message("text"), async (ctx) => {
  ctx.session ??= NEW_SESSION;
  try {
    await ctx.reply(
      code("Recievied message. Waiting response from the server...")
    );

    await ctx.reply("Request: " + ctx.message.text);
    ctx.session.messages.push({
      role: openai.roles.USER,
      content: ctx.message.text,
    });
    const response = await openai.chat(ctx.session.messages);
    ctx.session.messages.push({
      role: openai.roles.ASSISTANT,
      content: response.content,
    });
    await ctx.reply(response.content);
  } catch (e) {
    console.log("Error while text message " + e.message);
  }
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
