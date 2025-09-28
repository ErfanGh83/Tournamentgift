// eslint-disable-next-line @typescript-eslint/no-require-imports
const TelegramBot = require("node-telegram-bot-api");

const token = "8336710556:AAFAJyJu9rIIecXay23Y7jkxxJ3oLwykPcU"
const bot = new TelegramBot(token, { polling: true });

// When user sends /start
bot.onText(/\/start/, (msg: { chat: { id: unknown; }; }) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, "Welcome! Click below to open the app 👇", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Open App",
            web_app: { url: "https://images-wooden-environments-grid.trycloudflare.com" }, // Your Next.js app URL
          },
        ],
      ],
    },
  });
});
