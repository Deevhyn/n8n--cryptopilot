// Install dependencies first:
// npm install discord.js node-fetch@2 dotenv

// Load environment variables from .env file (for local development)
require('dotenv').config();

// Load environment variables from .env file (for local development)
require('dotenv').config();

const { Client, GatewayIntentBits } = require("discord.js");
const fetch = require("node-fetch");
const http = require("http");

// Get values from environment variables (Render provides these automatically)
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const TARGET_CHANNEL_ID = process.env.TARGET_CHANNEL_ID;
const PORT = process.env.PORT || 3000;

// Debug: Show the actual values (first few characters only for security)
console.log("🔍 Environment variables loaded:");
console.log("N8N_WEBHOOK_URL:", N8N_WEBHOOK_URL ? `✅ ${N8N_WEBHOOK_URL.substring(0, 30)}...` : "❌ Missing");
console.log("DISCORD_BOT_TOKEN:", DISCORD_BOT_TOKEN ? `✅ ${DISCORD_BOT_TOKEN.substring(0, 10)}...` : "❌ Missing");
console.log("TARGET_CHANNEL_ID:", TARGET_CHANNEL_ID ? `✅ ${TARGET_CHANNEL_ID}` : "❌ Missing");
console.log("Raw values:");
console.log("- N8N_WEBHOOK_URL length:", N8N_WEBHOOK_URL ? N8N_WEBHOOK_URL.length : 0);
console.log("- DISCORD_BOT_TOKEN length:", DISCORD_BOT_TOKEN ? DISCORD_BOT_TOKEN.length : 0);
console.log("- TARGET_CHANNEL_ID length:", TARGET_CHANNEL_ID ? TARGET_CHANNEL_ID.length : 0);

// Debug: Log all environment variables to see what's available
console.log("🔍 Available environment variables:");
console.log("N8N_WEBHOOK_URL:", process.env.N8N_WEBHOOK_URL ? "✅ Set" : "❌ Missing");
console.log("DISCORD_BOT_TOKEN:", process.env.DISCORD_BOT_TOKEN ? "✅ Set" : "❌ Missing");
console.log("TARGET_CHANNEL_ID:", process.env.TARGET_CHANNEL_ID ? "✅ Set" : "❌ Missing");

// Validate required environment variables
if (!N8N_WEBHOOK_URL || !DISCORD_BOT_TOKEN || !TARGET_CHANNEL_ID) {
  console.error("❌ Missing required environment variables:");
  if (!N8N_WEBHOOK_URL) console.error("  - N8N_WEBHOOK_URL");
  if (!DISCORD_BOT_TOKEN) console.error("  - DISCORD_BOT_TOKEN");
  if (!TARGET_CHANNEL_ID) console.error("  - TARGET_CHANNEL_ID");
  console.error("Please check your Render environment variables");
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
  server.close();
  process.exit(0);
});

// Create a simple HTTP server for health checks (required for Web Service)
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      bot: client.user ? client.user.tag : 'not ready',
      uptime: process.uptime()
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Discord Bot is running');
  }
});

server.listen(PORT, () => {
  console.log(`🌐 Health server running on port ${PORT}`);
});

client.login(DISCORD_BOT_TOKEN);
