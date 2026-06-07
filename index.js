const { Client, GatewayIntentBits } = require("discord.js");

// ─── CONFIG ─────────────────────────────────────────────────────────────────
const TOKEN    = process.env.TOKEN;
const GUILD_ID = "1496924890215878846";
const ROLE_IDS = [
  "1496978497887932547",
  "1397451041640939601",
];

// Any of these strings will qualify someone for the roles
const REQUIRED_TEXTS = [
  "discord.gg/xhubvip",
  ".gg/xhubvip",
];
// ────────────────────────────────────────────────────────────────────────────

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("presenceUpdate", async (oldPresence, newPresence) => {
  const member = newPresence?.member;
  if (!member || member.user.bot) return;

  if (newPresence.guild?.id !== GUILD_ID) return;

  const customStatus = newPresence.activities?.find(a => a.type === 4);
  const statusText = customStatus?.state ?? "";
  const hasLink = REQUIRED_TEXTS.some(t => statusText.toLowerCase().includes(t.toLowerCase()));

  try {
    for (const roleId of ROLE_IDS) {
      const role = newPresence.guild.roles.cache.get(roleId);
      if (!role) {
        console.warn(`⚠️  Role ${roleId} not found.`);
        continue;
      }

      const hasRole = member.roles.cache.has(roleId);

      if (hasLink && !hasRole) {
        await member.roles.add(role);
        console.log(`➕ Gave ${role.name} to ${member.user.tag}`);
      } else if (!hasLink && hasRole) {
        await member.roles.remove(role);
        console.log(`➖ Removed ${role.name} from ${member.user.tag}`);
      }
    }
  } catch (err) {
    console.error(`❌ Failed to update roles for ${member.user.tag}:`, err.message);
  }
});

client.login(TOKEN);
