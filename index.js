const { Client, GatewayIntentBits } = require("discord.js");

// ─── CONFIG ─────────────────────────────────────────────────────────────────
const TOKEN = process.env.TOKEN;

// Each server has its own guild ID and roles to assign
const SERVERS = [
  {
    guildId: "1496924890215878846",
    roleIds: ["1496978497887932547"],
  },
  {
    guildId: "1397451041640939600",
    roleIds: ["1397451041640939601"],
  },
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

  const guildId = newPresence.guild?.id;
  const server = SERVERS.find(s => s.guildId === guildId);
  if (!server) return;

  const customStatus = newPresence.activities?.find(a => a.type === 4);
  const statusText = customStatus?.state ?? "";
  const hasLink = REQUIRED_TEXTS.some(t => statusText.toLowerCase().includes(t.toLowerCase()));

  try {
    for (const roleId of server.roleIds) {
      const role = newPresence.guild.roles.cache.get(roleId);
      if (!role) {
        console.warn(`⚠️  Role ${roleId} not found in guild ${guildId}.`);
        continue;
      }

      const hasRole = member.roles.cache.has(roleId);

      if (hasLink && !hasRole) {
        await member.roles.add(role);
        console.log(`➕ Gave ${role.name} to ${member.user.tag} in ${newPresence.guild.name}`);
      } else if (!hasLink && hasRole) {
        await member.roles.remove(role);
        console.log(`➖ Removed ${role.name} from ${member.user.tag} in ${newPresence.guild.name}`);
      }
    }
  } catch (err) {
    console.error(`❌ Failed to update roles for ${member.user.tag}:`, err.message);
  }
});

client.login(TOKEN);
