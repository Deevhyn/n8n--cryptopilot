// Install dependencies first:
// npm install discord.js node-fetch@2 dotenv

require('dotenv').config(); // Load environment variables from .env file

const { Client, GatewayIntentBits } = require("discord.js");
const fetch = require("node-fetch");

// Get values from environment variables
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const TARGET_CHANNEL_ID = process.env.TARGET_CHANNEL_ID;

// Validate required environment variables
if (!N8N_WEBHOOK_URL || !DISCORD_BOT_TOKEN || !TARGET_CHANNEL_ID) {
  console.error("❌ Missing required environment variables:");
  if (!N8N_WEBHOOK_URL) console.error("  - N8N_WEBHOOK_URL");
  if (!DISCORD_BOT_TOKEN) console.error("  - DISCORD_BOT_TOKEN");
  if (!TARGET_CHANNEL_ID) console.error("  - TARGET_CHANNEL_ID");
  console.error("Please check your .env file");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
  console.log(`📡 Listening to channel ID: ${TARGET_CHANNEL_ID}`);
  console.log(`🔗 Webhook URL: ${N8N_WEBHOOK_URL}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return; // Ignore bots
  if (message.channel.id !== TARGET_CHANNEL_ID) return; // Only listen to target channel

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: message.author.username,
        content: message.content,
        channel: message.channel.name,
        timestamp: new Date().toISOString(),
        messageId: message.id,
      }),
    });

    if (response.ok) {
      console.log(
        `📨 Sent message from '${message.channel.name}' to n8n: ${message.content}`
      );
    } else {
      console.error(`❌ Webhook failed with status: ${response.status}`);
    }
  } catch (err) {
    console.error("❌ Failed to send to n8n:", err.message);
  }
});

// Handle errors
client.on("error", (error) => {
  console.error("❌ Discord client error:", error);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error);
});

process.on('SIGINT', () => {
  console.log('👋 Shutting down bot...');
  client.destroy();
  process.exit(0);
});

client.login(DISCORD_BOT_TOKEN);