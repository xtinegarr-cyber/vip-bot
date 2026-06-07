const { Client, GatewayIntentBits } = require("discord.js");

// ─── CONFIG ─────────────────────────────────────────────────────────────────
const TOKEN   = "MTUxMzEwMTA0NTI4OTU4NjgxOQ.GgpGZY.HIZFNHYxf8v03SF2MxWv1plYsQyT33VHSPLP-E"; // 
const GUILD_ID  = "1496924890215878846";
const ROLE_ID   = "1496978497887932547";

// Any of these strings will qualify someone for the role
const REQUIRED_TEXTS = [
  "discord.gg/xhubvip",
  ".gg/xhubvip",
];
// ────────────────────────────────────────────────────────────────────────────

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences, // Privileged intent — must be enabled in Dev Portal
  ],
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("presenceUpdate", async (oldPresence, newPresence) => {
  // Ignore if we can't identify the user or they're a bot
  const member = newPresence?.member;
  if (!member || member.user.bot) return;

  // Only care about our guild
  if (newPresence.guild?.id !== GUILD_ID) return;

  // Check if their custom status contains the required text
  const customStatus = newPresence.activities?.find(a => a.type === 4); // 4 = Custom Status
  const statusText = customStatus?.state ?? "";
  const hasLink = REQUIRED_TEXTS.some(t => statusText.toLowerCase().includes(t.toLowerCase()));

  const role = newPresence.guild.roles.cache.get(ROLE_ID);
  if (!role) {
    console.warn("⚠️  Role not found — check your ROLE_ID.");
    return;
  }

  const hasRole = member.roles.cache.has(ROLE_ID);

  try {
    if (hasLink && !hasRole) {
      await member.roles.add(role);
      console.log(`➕ Gave role to ${member.user.tag} (status: "${statusText}")`);
    } else if (!hasLink && hasRole) {
      await member.roles.remove(role);
      console.log(`➖ Removed role from ${member.user.tag} (status: "${statusText}")`);
    }
  } catch (err) {
    console.error(`❌ Failed to update role for ${member.user.tag}:`, err.message);
  }
});

client.login(TOKEN);
