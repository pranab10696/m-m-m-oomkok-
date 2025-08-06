const { Client, IntentsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessageReactions
  ]
});

// ======================
// 🎮 RPG CONFIGURATION
// ======================
const CONFIG = {
  SHOP_ITEMS: [
    { id: 1, name: "Health Potion", type: "consumable", price: 30, emoji: "❤️", description: "Restores 50 HP", effect: "hp:50" },
    { id: 2, name: "Mana Elixir", type: "consumable", price: 40, emoji: "🔮", description: "Restores 30 Mana", effect: "mana:30" },
    { id: 3, name: "Phoenix Down", type: "consumable", price: 100, emoji: "🕊️", description: "Revive with 50% HP when defeated", effect: "revive:50" },
    { id: 4, name: "Steel Sword", type: "weapon", price: 200, emoji: "⚔️", description: "+10 Attack Power", effect: "attack:10" },
    { id: 5, name: "Dragon Shield", type: "armor", price: 250, emoji: "🛡️", description: "+15 Defense", effect: "defense:15" },
    { id: 6, name: "Lucky Charm", type: "accessory", price: 150, emoji: "🍀", description: "+5% Critical Chance", effect: "crit:5" },
    { id: 7, name: "Water Sword", type: "weapon", price: 350, emoji: "💧", description: "+15 Attack (Strong vs Fire)", effect: "attack:15", element: "water" },
    { id: 8, name: "Fire Amulet", type: "accessory", price: 300, emoji: "🔥", description: "+10% Fire Resistance", effect: "fireres:10" },
    { id: 9, name: "XP Boost", type: "consumable", price: 150, emoji: "✨", description: "+20% XP for 1 hour", effect: "xpboost:20" }
  ],

  RARITY_COLORS: {
    "Common": 0x95a5a6,
    "Uncommon": 0x2ecc71,
    "Rare": 0x3498db,
    "Epic": 0x9b59b6,
    "Legendary": 0xf1c40f,
    "Mythic": 0xe74c3c
  },

  COOLDOWNS: {
    DAILY: 24 * 60 * 60 * 1000,
    BOSS_SUMMON: 30 * 60 * 1000,
    ATTACK: 10 * 1000,
    SKILL: 30 * 1000,
    DUEL: 5 * 60 * 1000,
    QUEST: 12 * 60 * 60 * 1000
  },

  QUESTS: [
    {
      id: "social_butterfly",
      name: "Social Butterfly 🦋",
      description: "Send 15 messages in any channel",
      reward: { gold: 100, xp: 50 },
      target: 15,
      type: "messages"
    },
    {
      id: "boss_slayer",
      name: "Boss Slayer 🐉",
      description: "Participate in defeating 3 server bosses",
      reward: { gold: 200, chests: 2 },
      target: 3,
      type: "bosses"
    },
    {
      id: "shopping_spree",
      name: "Shopping Spree 🛒",
      description: "Purchase 5 items from the shop",
      reward: { gold: 150, xp: 75 },
      target: 5,
      type: "purchases"
    }
  ]
};

// ======================
// 🐉 BOSS CONFIGURATION
// ======================
const BOSS_CONFIG = {
  BOSSES: [
    {
      id: 1,
      name: "Inferno Dragon",
      emoji: "🐉",
      baseHP: 2000,
      reward: 500,
      attacks: [
        { name: "Fire Breath", damage: "20-30", chance: 40, effect: "burn" },
        { name: "Tail Whip", damage: "15-25", chance: 30 },
        { name: "Meteor Shower", damage: "35-45", chance: 15, effect: "stun" },
        { name: "Lava Pool", damage: "10-15", chance: 15, effect: "dot" }
      ],
      weaknesses: ["water"],
      resistances: ["fire"],
      loot: [
        { id: 101, name: "Dragon Scale", type: "material", rarity: "Uncommon", chance: 60, emoji: "🐉" },
        { id: 102, name: "Inferno Heart", type: "artifact", rarity: "Rare", chance: 25, emoji: "❤️‍🔥" },
        { id: 103, name: "Dragonbone Sword", type: "weapon", rarity: "Epic", chance: 10, emoji: "⚔️", effect: "attack:25" },
        { id: 104, name: "Phoenix Feather", type: "accessory", rarity: "Legendary", chance: 5, emoji: "🪶", effect: "revive:100" }
      ]
    },
    {
      id: 2,
      name: "Frost Giant",
      emoji: "❄️",
      baseHP: 2500,
      reward: 600,
      attacks: [
        { name: "Ice Slam", damage: "25-35", chance: 35 },
        { name: "Blizzard", damage: "20-30", chance: 30, effect: "freeze" },
        { name: "Glacial Spike", damage: "40-50", chance: 20 },
        { name: "Permafrost", damage: "15-20", chance: 15, effect: "slow" }
      ],
      weaknesses: ["fire"],
      resistances: ["ice", "water"],
      loot: [
        { id: 201, name: "Frozen Shard", type: "material", rarity: "Uncommon", chance: 60, emoji: "❄️" },
        { id: 202, name: "Glacial Core", type: "artifact", rarity: "Rare", chance: 25, emoji: "💎" },
        { id: 203, name: "Icebrand", type: "weapon", rarity: "Epic", chance: 10, emoji: "❄️⚔️", effect: "attack:20 freeze:10" },
        { id: 204, name: "Winter's Embrace", type: "armor", rarity: "Legendary", chance: 5, emoji: "❄️🛡️", effect: "defense:30 iceres:20" }
      ]
    },
    {
      id: 3,
      name: "Thunder Lich",
      emoji: "⚡",
      baseHP: 2200,
      reward: 550,
      attacks: [
        { name: "Lightning Bolt", damage: "30-40", chance: 40 },
        { name: "Soul Drain", damage: "15-25", chance: 30, effect: "mana_drain" },
        { name: "Chain Lightning", damage: "25-35", chance: 20 },
        { name: "Death Curse", damage: "45-55", chance: 10, effect: "curse" }
      ],
      weaknesses: ["earth"],
      resistances: ["lightning"],
      loot: [
        { id: 301, name: "Lich Skull", type: "material", rarity: "Uncommon", chance: 60, emoji: "💀" },
        { id: 302, name: "Storm Core", type: "artifact", rarity: "Rare", chance: 25, emoji: "🌀" },
        { id: 303, name: "Thunder Staff", type: "weapon", rarity: "Epic", chance: 10, emoji: "⚡", effect: "attack:25 shock:15" },
        { id: 304, name: "Amulet of Storms", type: "accessory", rarity: "Legendary", chance: 5, emoji: "🌩️", effect: "lightningres:30" }
      ]
    }
  ],

  STATUS_EFFECTS: {
    burn: { name: "🔥 Burn", description: "Takes 5 damage per turn", duration: 3, damagePerTurn: 5, emoji: "🔥" },
    stun: { name: "💫 Stunned", description: "Cannot attack for 1 turn", duration: 1, emoji: "💫" },
    freeze: { name: "❄️ Frozen", description: "Cannot attack for 2 turns", duration: 2, emoji: "❄️" },
    slow: { name: "🐌 Slowed", description: "Attack cooldown increased by 50%", duration: 3, emoji: "🐌" },
    dot: { name: "🩸 Bleeding", description: "Takes 3 damage per turn", duration: 3, damagePerTurn: 3, emoji: "🩸" },
    curse: { name: "☠️ Cursed", description: "Stats reduced by 20%", duration: 4, emoji: "☠️" },
    mana_drain: { name: "💧 Mana Drain", description: "Loses 10 mana per turn", duration: 2, manaDrain: 10, emoji: "💧" }
  },

  PLAYER_SKILLS: {
    warrior: [
      { 
        id: "shield_bash", 
        name: "Shield Bash", 
        description: "Stuns boss for 1 turn", 
        emoji: "🛡️", 
        cooldown: 5,
        manaCost: 20,
        execute: async (user, boss) => {
          boss.statusEffects.push({ type: "stun", duration: 1, appliedAt: Date.now() });
          return "💫 You bashed the boss with your shield, stunning it!";
        }
      },
      { 
        id: "power_strike", 
        name: "Power Strike", 
        description: "Next attack deals 2x damage", 
        emoji: "💥", 
        cooldown: 3,
        manaCost: 15,
        execute: async (user) => {
          await db.set(`users.${user.id}.powerStrike`, true);
          return "💪 Your next attack will deal double damage!";
        }
      }
    ],
    mage: [
      { 
        id: "fireball", 
        name: "Fireball", 
        description: "Deals 25-35 fire damage", 
        emoji: "🔥", 
        cooldown: 4,
        manaCost: 25,
        execute: async (user, boss) => {
          const damage = 25 + Math.floor(Math.random() * 11);
          boss.hp -= damage;
          return `🔥 You hurled a fireball for ${damage} damage!`;
        }
      },
      { 
        id: "ice_barrier", 
        name: "Ice Barrier", 
        description: "Reduces next damage by 50%", 
        emoji: "❄️", 
        cooldown: 6,
        manaCost: 30,
        execute: async (user) => {
          await db.set(`users.${user.id}.iceBarrier`, true);
          return "🛡️ An icy barrier protects you from the next attack!";
        }
      }
    ],
    rogue: [
      { 
        id: "backstab", 
        name: "Backstab", 
        description: "Next attack is a critical hit", 
        emoji: "🗡️", 
        cooldown: 4,
        manaCost: 20,
        execute: async (user) => {
          await db.set(`users.${user.id}.guaranteedCrit`, true);
          return "🔪 Your next attack will be a critical hit!";
        }
      },
      { 
        id: "poison_dagger", 
        name: "Poison Dagger", 
        description: "Poisons boss for 3 turns", 
        emoji: "☠️", 
        cooldown: 5,
        manaCost: 25,
        execute: async (user, boss) => {
          boss.statusEffects.push({ type: "dot", duration: 3, appliedAt: Date.now(), damagePerTurn: 8 });
          return "💉 You poisoned the boss with your dagger!";
        }
      }
    ]
  }
};

// ======================
// 🧰 UTILITY FUNCTIONS
// ======================
function getHealthBar(current, max, size = 15) {
  const percentage = Math.max(0, current) / max;
  const filled = Math.round(size * percentage);
  return '🟩'.repeat(filled) + '⬛'.repeat(size - filled) + ` ${Math.round(percentage * 100)}%`;
}

function getProgressBar(current, max, size = 10) {
  const percentage = Math.min(1, Math.max(0, current / max));
  const filled = Math.round(size * percentage);
  return '█'.repeat(filled) + '░'.repeat(size - filled) + ` ${Math.round(percentage * 100)}%`;
}

function getRandomInRange(range) {
  const [min, max] = range.split('-').map(Number);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem(lootTable) {
  const totalChance = lootTable.reduce((sum, item) => sum + item.chance, 0);
  const roll = Math.random() * totalChance;
  let cumulative = 0;

  for (const item of lootTable) {
    cumulative += item.chance;
    if (roll <= cumulative) return item;
  }
  return lootTable[0];
}

async function addItemToInventory(userId, item) {
  const user = await db.get(`users.${userId}`) || {};
  const inventory = user.inventory || [];

  const existingItem = inventory.find(i => i.id === item.id);

  if (existingItem) {
    existingItem.amount = (existingItem.amount || 1) + 1;
  } else {
    inventory.push({
      id: item.id,
      name: item.name,
      type: item.type,
      emoji: item.emoji || "🪙",
      amount: 1,
      rarity: item.rarity,
      effect: item.effect,
      element: item.element
    });
  }

  await db.set(`users.${userId}.inventory`, inventory);
}

// ======================
// 📦 DATABASE INITIALIZATION
// ======================
async function initDatabase() {
  if (!await db.has('users')) await db.set('users', {});
  if (!await db.has('server')) {
    await db.set('server', {
      bossActive: false,
      boss: null,
      bossHP: 0,
      bossParticipants: {},
      bossStatusEffects: [],
      lastBossSpawn: 0,
      leaderboards: {
        lastUpdated: 0,
        gold: [],
        level: [],
        wins: [],
        bossAttackLog: []
      }
    });
  }
}

// ======================
// 🏆 LEADERBOARD SYSTEM
// ======================
async function updateLeaderboards() {
  const serverData = await db.get('server') || {};
  const now = Date.now();

  if (serverData.leaderboards && now - serverData.leaderboards.lastUpdated < 1800000) {
    return;
  }

  const allUsers = await db.get('users') || {};
  const usersArray = Object.entries(allUsers);

  const goldTop = usersArray
    .filter(([_, user]) => user.gold !== undefined)
    .sort((a, b) => b[1].gold - a[1].gold)
    .slice(0, 10)
    .map(([id, user]) => ({ id, value: user.gold }));

  const levelTop = usersArray
    .filter(([_, user]) => user.xp !== undefined)
    .map(([id, user]) => ({
      id,
      level: Math.floor(user.xp / 100) + 1,
      xp: user.xp
    }))
    .sort((a, b) => b.level - a.level || b.xp - a.xp)
    .slice(0, 10)
    .map(user => ({ id: user.id, value: user.level }));

  const winsTop = usersArray
    .filter(([_, user]) => user.wins !== undefined)
    .sort((a, b) => b[1].wins - a[1].wins)
    .slice(0, 10)
    .map(([id, user]) => ({ id, value: user.wins }));

  await db.set('server.leaderboards', {
    lastUpdated: now,
    gold: goldTop,
    level: levelTop,
    wins: winsTop
  });
}

// ======================
// 🎮 COMMAND HANDLERS
// ======================

// !start - Character creation
async function handleStartCommand(message) {
  const userId = message.author.id;
  const user = await db.get(`users.${userId}`);

  if (user && user.class) {
    return message.reply("You've already started your adventure! Use `!profile` to see your character.");
  }

  await db.set(`users.${userId}`, {
    gold: 100,
    wins: 0,
    losses: 0,
    chests: 1,
    inventory: [],
    equipment: {
      weapon: null,
      armor: null,
      accessory: null
    },
    stats: {
      hp: 100,
      maxHp: 100,
      mana: 50,
      maxMana: 50,
      attack: 10,
      defense: 5,
      critChance: 5
    },
    lastDaily: 0,
    lastDuel: 0,
    lastAttack: 0,
    lastSkill: 0,
    xp: 0,
    level: 1,
    class: null,
    quests: {
      active: [],
      completed: [],
      progress: {}
    },
    visitedChannels: [message.channel.id],
    reactionCount: 0,
    statusEffects: {},
    skillCooldowns: {},
    powerStrike: false,
    guaranteedCrit: false,
    iceBarrier: false
  });

  const embed = new EmbedBuilder()
    .setTitle('🎮 RPG Adventure - Choose Your Class')
    .setDescription('Begin your journey by selecting your character class! Each class has unique abilities and playstyles:')
    .setColor(0x3498db)
    .setThumbnail('https://i.imgur.com/3Jm2F4a.png')
    .setImage('https://media.discordapp.net/attachments/1355956049114435703/1401798697037074524/1cd60c5cfdb662b3c117350876f19a2a.png?ex=6892e7c5&is=68919645&hm=2c4be63f2972d84886d592b74126f21caaa36b2d93aa0e38add534ae35550521&=&format=webp&quality=lossless&width=1355&height=763')
    .addFields(
      { 
        name: '⚔️ Warrior', 
        value: '• High HP and defense\n• Excels in close combat\n• Skills: Shield Bash, Power Strike', 
        inline: true 
      },
      { 
        name: '🔮 Mage', 
        value: '• Powerful spellcaster\n• Mana-based abilities\n• Skills: Fireball, Ice Barrier', 
        inline: true 
      },
      { 
        name: '🏹 Rogue', 
        value: '• High critical hit chance\n• Stealth and poison attacks\n• Skills: Backstab, Poison Dagger', 
        inline: true 
      }
    );

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('warrior')
        .setLabel('Warrior')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('⚔️'),
      new ButtonBuilder()
        .setCustomId('mage')
        .setLabel('Mage')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🔮'),
      new ButtonBuilder()
        .setCustomId('rogue')
        .setLabel('Rogue')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🏹')
    );

  await message.reply({ embeds: [embed], components: [row] });
}

// !profile - View player profile
async function handleProfileCommand(message) {
  const userId = message.author.id;
  const user = await db.get(`users.${userId}`);

  if (!user || !user.class) {
    return message.reply('❌ You need to use `!start` first to create your character!');
  }

  const level = Math.floor(user.xp / 100) + 1;
  const xpForNext = (level * 100) - user.xp;
  const xpProgress = Math.floor((user.xp % 100) / 100 * 10);
  const xpBar = getProgressBar(user.xp % 100, 100, 10);

  // Get equipped items
  const weapon = user.equipment?.weapon || 'None';
  const armor = user.equipment?.armor || 'None';
  const accessory = user.equipment?.accessory || 'None';

  // Get active status effects
  const activeEffects = Object.entries(user.statusEffects || {})
    .filter(([_, effect]) => effect.expires > Date.now())
    .map(([type, _]) => BOSS_CONFIG.STATUS_EFFECTS[type]?.emoji + " " + BOSS_CONFIG.STATUS_EFFECTS[type]?.name)
    .join('\n') || 'None';

  const embed = new EmbedBuilder()
    .setTitle(`🏆 ${message.author.username}'s Character Profile`)
    .setColor(CONFIG.RARITY_COLORS[user.class === 'warrior' ? 'Epic' : user.class === 'mage' ? 'Rare' : 'Uncommon'])
    .setThumbnail(message.author.displayAvatarURL())
    .addFields(
      { name: '⚔️ Class', value: user.class.charAt(0).toUpperCase() + user.class.slice(1), inline: true },
      { name: '📊 Level', value: `${level}`, inline: true },
      { name: '💰 Gold', value: `${user.gold}`, inline: true },
      { name: '❤️ HP', value: `${user.stats.hp}/${user.stats.maxHp}`, inline: true },
      { name: '🔮 Mana', value: `${user.stats.mana}/${user.stats.maxMana}`, inline: true },
      { name: '📦 Chests', value: `${user.chests}`, inline: true },
      { name: '🎯 Experience', value: `${xpBar}\n${xpForNext} XP to next level`, inline: false },
      { name: '⚔️ Combat Stats', value: `Attack: ${user.stats.attack}\nDefense: ${user.stats.defense}\nCrit Chance: ${user.stats.critChance}%`, inline: true },
      { name: '🏆 PvP Record', value: `Wins: ${user.wins}\nLosses: ${user.losses}`, inline: true },
      { name: '🎒 Equipment', value: `Weapon: ${weapon}\nArmor: ${armor}\nAccessory: ${accessory}`, inline: true },
      { name: '🌀 Active Effects', value: activeEffects, inline: false }
    );

  return message.reply({ embeds: [embed] });
}

// !shop - Show the shop
async function handleShopCommand(message, page = 1) {
  const itemsPerPage = 5;
  const totalPages = Math.ceil(CONFIG.SHOP_ITEMS.length / itemsPerPage);

  if (page < 1 || page > totalPages) {
    return message.reply(`Invalid page number. Available pages: 1-${totalPages}`);
  }

  const startIndex = (page - 1) * itemsPerPage;
  const shopItems = CONFIG.SHOP_ITEMS.slice(startIndex, startIndex + itemsPerPage);

  const embed = new EmbedBuilder()
    .setTitle("🛒 RPG Item Shop")
    .setDescription(`Browse magical items! Use \`!buy [ID]\` to purchase.\nPage ${page}/${totalPages}`)
    .setColor(0x9b59b6)
    .setThumbnail('https://i.imgur.com/shop-icon.png')
    .setFooter({ text: `Use !shop [page] to browse other pages` });

  shopItems.forEach(item => {
    embed.addFields({ 
      name: `${item.emoji} ${item.name} [ID: ${item.id}] - ${item.price}g`, 
      value: `${item.description}\nType: ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}`,
      inline: false 
    });
  });

  // Add navigation buttons if there are multiple pages
  let components = [];
  if (totalPages > 1) {
    const row = new ActionRowBuilder();

    if (page > 1) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`shop_prev_${page - 1}`)
          .setLabel('Previous')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('⬅️')
      );
    }

    if (page < totalPages) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`shop_next_${page + 1}`)
          .setLabel('Next')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('➡️')
      );
    }

    components = [row];
  }

  await message.channel.send({ embeds: [embed], components });
}

// !buy - Purchase items
async function handleBuyCommand(message, itemId) {
  const userId = message.author.id;
  const user = await db.get(`users.${userId}`);

  if (!user || !user.class) {
    return message.reply("❌ You need to use `!start` first to create your character!");
  }

  const item = CONFIG.SHOP_ITEMS.find(i => i.id === parseInt(itemId));
  if (!item) {
    return message.reply("Invalid item ID! Check `!shop` for available items.");
  }

  if (user.gold < item.price) {
    return message.reply(`You don't have enough gold! You need ${item.price}g but only have ${user.gold}g.`);
  }

  // Process purchase
  await db.sub(`users.${userId}.gold`, item.price);
  await addItemToInventory(userId, item);

  // Update quest progress
  await checkQuestProgress(userId, "purchases", 1);

  const embed = new EmbedBuilder()
    .setTitle(`🛒 Purchase Complete!`)
    .setDescription(`You bought: ${item.emoji} **${item.name}**`)
    .addFields(
      { name: '💰 Price', value: `${item.price}g`, inline: true },
      { name: '💎 Remaining Gold', value: `${user.gold - item.price}g`, inline: true }
    )
    .setColor(0x2ecc71)
    .setThumbnail('https://i.imgur.com/coins.png');

  await message.reply({ embeds: [embed] });
}

// !inventory - View inventory
async function handleInventoryCommand(message) {
  const userId = message.author.id;
  const user = await db.get(`users.${userId}`);

  if (!user || !user.class) {
    return message.reply("❌ You need to use `!start` first to create your character!");
  }

  const embed = new EmbedBuilder()
    .setTitle(`🎒 ${message.author.username}'s Inventory`)
    .setColor(0x3498db)
    .setThumbnail(message.author.displayAvatarURL());

  // Display equipment
  if (user.equipment) {
    const equipment = [
      `⚔️ Weapon: ${user.equipment.weapon || 'None'}`,
      `🛡️ Armor: ${user.equipment.armor || 'None'}`,
      `💍 Accessory: ${user.equipment.accessory || 'None'}`
    ].join('\n');

    embed.addFields({ name: '⚡ Equipped Items', value: equipment, inline: false });
  }

  // Display inventory items
  if (user.inventory && user.inventory.length > 0) {
    // Group items by type for better organization
    const groupedItems = {};

    user.inventory.forEach(item => {
      if (!groupedItems[item.type]) groupedItems[item.type] = [];
      groupedItems[item.type].push(item);
    });

    // Add each category to embed
    for (const [type, items] of Object.entries(groupedItems)) {
      const itemList = items.map(item => 
        `• \`ID:${item.id}\` ${item.emoji} ${item.name}${item.amount > 1 ? ` x${item.amount}` : ''}`
      ).join('\n');

      embed.addFields({ 
        name: `${getTypeEmoji(type)} ${type.charAt(0).toUpperCase() + type.slice(1)} Items`, 
        value: itemList,
        inline: true 
      });
    }
  } else {
    embed.addFields({ name: '📦 Inventory', value: 'Your inventory is empty! Visit the `!shop`', inline: false });
  }

  // Add usage instructions
  embed.addFields({ 
    name: '🔧 Usage', 
    value: 'Use `!use [ID]` to consume items\nUse `!equip [ID]` to equip gear',
    inline: false 
  });

  await message.reply({ embeds: [embed] });
}

// !daily - Claim daily reward
async function handleDailyCommand(message) {
  const userId = message.author.id;
  const user = await db.get(`users.${userId}`);

  if (!user || !user.class) {
    return message.reply("❌ You need to use `!start` first to create your character!");
  }

  const now = Date.now();
  const lastDaily = user.lastDaily || 0;

  if (now - lastDaily < CONFIG.COOLDOWNS.DAILY) {
    const remaining = Math.ceil((CONFIG.COOLDOWNS.DAILY - (now - lastDaily)) / (60 * 60 * 1000));
    return message.reply(`⌛ You can claim your next daily reward in ${remaining} hours!`);
  }

  const rewardGold = 100 + Math.floor(Math.random() * 150);
  const rewardChests = 1;

  await db.add(`users.${userId}.gold`, rewardGold);
  await db.add(`users.${userId}.chests`, rewardChests);
  await db.set(`users.${userId}.lastDaily`, now);

  // Update quest progress
  await checkQuestProgress(userId, "dailies", 1);

  const embed = new EmbedBuilder()
    .setTitle('🎁 Daily Reward Claimed!')
    .setDescription(`You received:\n💰 **${rewardGold} gold**\n📦 **${rewardChests} chest**`)
    .setColor(0x2ecc71)
    .setThumbnail('https://i.imgur.com/daily-reward.png');

  await message.reply({ embeds: [embed] });
}

// !openchest - Open a loot chest
async function handleOpenChest(message) {
  const userId = message.author.id;
  const user = await db.get(`users.${userId}`);

  if (!user || !user.class) {
    return message.reply("❌ You need to use `!start` first to create your character!");
  }

  if (user.chests < 1) {
    return message.reply("You don't have any chests to open! Earn chests with `!daily` or by completing quests.");
  }

  // Loot table with weighted chances
  const lootTable = [
    { item: "50 Gold", type: "currency", value: 50, rarity: "Common", chance: 60, emoji: "💰" },
    { item: "200 Gold", type: "currency", value: 200, rarity: "Uncommon", chance: 25, emoji: "💎" },
    { item: "XP Potion", type: "consumable", value: 0, rarity: "Rare", chance: 10, emoji: "🧪" },
    { item: "Mythic Sword", type: "weapon", value: 0, rarity: "Epic", chance: 4, emoji: "⚔️" },
    { item: "Dragon Egg", type: "accessory", value: 0, rarity: "Legendary", chance: 1, emoji: "🐉" }
  ];

  // Calculate reward
  const roll = Math.random() * 100;
  let cumulativeChance = 0;
  let reward;

  for (const item of lootTable) {
    cumulativeChance += item.chance;
    if (roll <= cumulativeChance) {
      reward = item;
      break;
    }
  }

  // Update user data
  await db.sub(`users.${userId}.chests`, 1);

  if (reward.value > 0) {
    await db.add(`users.${userId}.gold`, reward.value);
  } else {
    await addItemToInventory(userId, {
      id: 100 + Math.floor(Math.random() * 1000),
      name: reward.item,
      type: reward.type,
      emoji: reward.emoji,
      amount: 1,
      rarity: reward.rarity
    });
  }

  // Update quest progress
  await checkQuestProgress(userId, "chests", 1);

  const embed = new EmbedBuilder()
    .setTitle(`${reward.emoji} You opened a chest!`)
    .setDescription(`**Reward:** ${reward.item}\n**Rarity:** ${reward.rarity}`)
    .setColor(CONFIG.RARITY_COLORS[reward.rarity] || 0xffffff)
    .setThumbnail('https://i.imgur.com/treasure-chest.png');

  await message.reply({ embeds: [embed] });
}

// ======================
// 🐉 BOSS SYSTEM
// ======================

// !summonboss - Summon a server boss
async function handleSummonBossCommand(message) {
  if (!message.member.permissions.has('ManageMessages')) {
    return message.reply("You need the 'Manage Messages' permission to summon a boss!");
  }

  const serverData = await db.get('server') || {};
  const now = Date.now();

  if (serverData.bossActive) {
    return message.reply("A boss is already active! Defeat it first.");
  }

  if (serverData.lastBossSpawn && (now - serverData.lastBossSpawn < CONFIG.COOLDOWNS.BOSS_SUMMON)) {
    const remaining = Math.ceil((CONFIG.COOLDOWNS.BOSS_SUMMON - (now - serverData.lastBossSpawn)) / (60 * 1000));
    return message.reply(`⏱️ Boss summoning is on cooldown! Try again in ${remaining} minutes.`);
  }

  const boss = BOSS_CONFIG.BOSSES[Math.floor(Math.random() * BOSS_CONFIG.BOSSES.length)];

  serverData.bossActive = true;
  serverData.boss = boss;
  serverData.bossHP = boss.baseHP;
  serverData.bossParticipants = {};
  serverData.bossStatusEffects = [];
  serverData.lastBossAttack = now;
  serverData.bossAttackLog = [];
  serverData.lastBossSpawn = now;

  await db.set('server', serverData);

  const embed = new EmbedBuilder()
    .setTitle(`${boss.emoji} ${boss.name} has appeared! ${boss.emoji}`)
    .setDescription(`A terrifying ${boss.name} has invaded the server!\nEveryone attack it with \`!attack\` or use skills with \`!skill [name]\`!`)
    .addFields(
      { name: '❤️ HP', value: getHealthBar(boss.baseHP, boss.baseHP), inline: true },
      { name: '💰 Reward', value: `${boss.reward}g per participant`, inline: true },
      { name: '⚔️ Weaknesses', value: boss.weaknesses.map(e => `${getElementEmoji(e)} ${e}`).join(', ') || 'None', inline: true },
      { name: '🛡️ Resistances', value: boss.resistances.map(e => `${getElementEmoji(e)} ${e}`).join(', ') || 'None', inline: true }
    )
    .setColor(0xe74c3c)
    .setThumbnail('https://media.discordapp.net/attachments/1355956049114435703/1401799793872867418/49bd228433dcb73b4a0df43439d33913.png?ex=6892e8cb&is=6891974b&hm=1d51a6ce491a5f4e57394dbead1938b00f2d96a63552fa0b245255e8deb6e140&=&format=webp&quality=lossless&width=1355&height=763')
    .setImage('https://i.imgur.com/boss-banner.png');

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('boss_skills')
      .setLabel('View Skills')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('📜'),
    new ButtonBuilder()
      .setCustomId('boss_attack')
      .setLabel('Attack!')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('⚔️')
  );

  await message.channel.send({ 
    content: ` A BOSS HAS APPEARED!`, 
    embeds: [embed], 
    components: [row] 
  });
}

// !attack - Attack the boss
async function handleAttackCommand(message) {
  const serverData = await db.get('server') || {};

  if (!serverData.bossActive) {
    return message.reply("There's no active boss to attack! A mod can summon one with `!summonboss`");
  }

  const userId = message.author.id;
  const user = await db.get(`users.${userId}`);

  if (!user || !user.class) {
    return message.reply("❌ You need to use `!start` first to create your character!");
  }

  const now = Date.now();
  const lastAttack = user.lastAttack || 0;

  if (now - lastAttack < CONFIG.COOLDOWNS.ATTACK) {
    const remaining = Math.ceil((CONFIG.COOLDOWNS.ATTACK - (now - lastAttack)) / 1000);
    return message.reply(`⏱️ You're attacking too fast! Wait ${remaining} seconds.`);
  }

  // Update last attack time
  await db.set(`users.${userId}.lastAttack`, now);

  // Calculate base damage
  let baseDamage = Math.floor(Math.random() * 10) + 10;

  // Apply weapon bonus
  if (user.equipment.weapon) {
    const weapon = CONFIG.SHOP_ITEMS.find(i => i.name === user.equipment.weapon);
    if (weapon) {
      const [_, bonus] = weapon.effect.split(':');
      baseDamage += parseInt(bonus);

      // Check for elemental advantage
      if (weapon.element && serverData.boss.weaknesses.includes(weapon.element)) {
        baseDamage = Math.floor(baseDamage * 1.5);
      }
    }
  }

  // Apply class bonuses
  if (user.class === 'warrior') {
    baseDamage = Math.floor(baseDamage * 1.2);
  }

  // Check for critical hit
  let isCritical = Math.random() * 100 < user.stats.critChance;
  if (user.guaranteedCrit) {
    isCritical = true;
    await db.set(`users.${userId}.guaranteedCrit`, false);
  }

  // Apply power strike
  if (user.powerStrike) {
    baseDamage *= 2;
    await db.set(`users.${userId}.powerStrike`, false);
  }

  const damage = isCritical ? baseDamage * 2 : baseDamage;

  // Apply boss resistances
  const boss = serverData.boss;
  serverData.bossHP -= damage;

  // Track damage for MVP
  if (!serverData.bossParticipants[userId]) {
    serverData.bossParticipants[userId] = {
      damage: 0,
      username: message.author.username
    };
  }
  serverData.bossParticipants[userId].damage += damage;

  // Add to attack log
  serverData.bossAttackLog.push({
    user: message.author.username,
    damage,
    isCritical,
    timestamp: now
  });

  if (serverData.bossAttackLog.length > 5) {
    serverData.bossAttackLog.shift();
  }

  // Check if boss is defeated
  if (serverData.bossHP <= 0) {
    await defeatBoss(message, serverData);
    return;
  }

  // Boss counterattack (30% chance)
  if (Math.random() < 0.3) {
    await bossCounterattack(message, serverData, userId);
  } else {
    await db.set('server', serverData);

    const embed = new EmbedBuilder()
      .setTitle(`⚔️ ${message.author.username} attacked the ${boss.name}!`)
      .setDescription(
        `${isCritical ? '💥 **CRITICAL HIT!** ' : ''}You dealt **${damage} damage**!`
      )
      .addFields(
        { name: '❤️ Boss HP', value: getHealthBar(serverData.bossHP, boss.baseHP), inline: false }
      )
      .setColor(isCritical ? 0xf1c40f : 0x3498db)
      .setFooter({ text: `Boss may counterattack next!` });

    await message.reply({ embeds: [embed] });
  }
}

async function bossCounterattack(message, serverData, userId) {
  const boss = serverData.boss;
  const user = await db.get(`users.${userId}`);

  // Select random boss attack
  const totalChance = boss.attacks.reduce((sum, atk) => sum + atk.chance, 0);
  const roll = Math.random() * totalChance;
  let cumulative = 0;
  let bossAttack = null;

  for (const attack of boss.attacks) {
    cumulative += attack.chance;
    if (roll <= cumulative) {
      bossAttack = attack;
      break;
    }
  }

  if (!bossAttack) bossAttack = boss.attacks[0];

  // Calculate damage
  const [minDmg, maxDmg] = bossAttack.damage.split('-').map(Number);
  let damage = Math.floor(Math.random() * (maxDmg - minDmg + 1)) + minDmg;

  // Apply defense
  const defense = user.stats.defense || 5;
  let finalDamage = Math.max(1, damage - Math.floor(defense / 2));

  // Apply ice barrier if active
  if (user.iceBarrier) {
    finalDamage = Math.floor(finalDamage * 0.5);
    await db.set(`users.${userId}.iceBarrier`, false);
  }

  // Apply damage to player
  const newHp = Math.max(0, user.stats.hp - finalDamage);
  await db.set(`users.${userId}.stats.hp`, newHp);

  // Apply status effect
  let effectMessage = "";
  if (bossAttack.effect) {
    const effect = BOSS_CONFIG.STATUS_EFFECTS[bossAttack.effect];

    if (effect) {
      const userEffects = user.statusEffects || {};
      userEffects[bossAttack.effect] = {
        name: effect.name,
        duration: effect.duration,
        expires: Date.now() + (effect.duration * 60 * 1000),
        damagePerTurn: effect.damagePerTurn,
        manaDrain: effect.manaDrain
      };

      await db.set(`users.${userId}.statusEffects`, userEffects);
      effectMessage = `\nYou are now **${effect.name}**! ${effect.description}`;
    }
  }

  // Save server data
  await db.set('server', serverData);

  // Send counterattack result
  const embed = new EmbedBuilder()
    .setTitle(`💢 ${boss.name} counterattacked!`)
    .setDescription(
      `The ${boss.name} used **${bossAttack.name}** and dealt **${finalDamage} damage** to ${message.author.username}!${effectMessage}`
    )
    .addFields(
      { name: '❤️ Your HP', value: `${newHp}/${user.stats.maxHp}`, inline: true },
      { name: '❤️ Boss HP', value: getHealthBar(serverData.bossHP, boss.baseHP), inline: true }
    )
    .setColor(0xe74c3c)
    .setFooter({ text: `Use !heal if your HP is low` });

  await message.reply({ embeds: [embed] });

  // Check if player was defeated
  if (newHp <= 0) {
    message.channel.send(`💀 ${message.author.username} has been defeated by the ${boss.name}! Use !revive to recover.`);
  }
}

async function defeatBoss(message, serverData) {
  const boss = serverData.boss;
  const participants = Object.keys(serverData.bossParticipants);

  // Find MVP (most damage)
  let mvp = null;
  let maxDamage = 0;
  for (const [userId, data] of Object.entries(serverData.bossParticipants)) {
    if (data.damage > maxDamage) {
      maxDamage = data.damage;
      mvp = { userId, username: data.username };
    }
  }

  // Find last attacker
  const lastAttackerEntry = serverData.bossAttackLog
    .slice()
    .sort((a, b) => b.timestamp - a.timestamp)
    .find(entry => participants.includes(entry.user));

  const lastAttacker = lastAttackerEntry ? lastAttackerEntry.user : "Unknown";

  // Distribute rewards
  const baseReward = boss.reward;
  const lootPool = boss.loot;

  for (const userId of participants) {
    const user = await db.get(`users.${userId}`) || {};

    // Base reward
    const reward = baseReward + Math.floor(Math.random() * 50);
    await db.add(`users.${userId}.gold`, reward);
    await db.add(`users.${userId}.xp`, 50);

    // Common artifact for all participants
    const commonArtifact = getRandomItem(lootPool.filter(item => item.rarity === "Uncommon"));
    await addItemToInventory(userId, commonArtifact);

    // MVP reward
    if (mvp && userId === mvp.userId) {
      const mvpArtifact = getRandomItem(lootPool.filter(item => item.rarity === "Epic" || item.rarity === "Legendary"));
      await addItemToInventory(userId, mvpArtifact);
    }

    // Last hit reward
    const userData = serverData.bossParticipants[userId];
    if (userData.username === lastAttacker) {
      const lastHitArtifact = getRandomItem(lootPool.filter(item => item.rarity === "Rare" || item.rarity === "Epic"));
      await addItemToInventory(userId, lastHitArtifact);
    }
  }
  

  // Reset boss
  serverData.bossActive = false;
  await db.set('server', serverData);

  // Create victory embed
  const embed = new EmbedBuilder()
    .setTitle(`🎉 ${boss.name} DEFEATED! 🎉`)
    .setDescription(`The mighty ${boss.name} has been vanquished by brave adventurers!`)
    .setColor(0x2ecc71)
    .setThumbnail('https://media.discordapp.net/attachments/1377111272746778626/1402309618251595826/1ac14448073b8447e947ff440fb359ed.png?ex=6893721a&is=6892209a&hm=2a379bba1ae665788fdf53539ce4966d8ed69109b046215d9112441b2df51bbb&=&format=webp&quality=lossless&width=920&height=518')
    .addFields(
      { name: '🏆 MVP', value: mvp ? `${mvp.username} (${maxDamage} damage)` : "None", inline: true },
      { name: '⚔️ Last Hit', value: lastAttacker, inline: true },
      { name: '👥 Participants', value: participants.length.toString(), inline: true },
      { name: '💰 Rewards', value: `All participants received:\n- ${baseReward}g\n- 50 XP\n- 1 Artifact`, inline: false },
      { name: '🎁 Special Rewards', value: `MVP: Epic/Legendary item\nLast Hit: Rare/Epic item`, inline: false }
    );

  await message.channel.send({ embeds: [embed] });
}

// ======================
// 🪄 SKILLS SYSTEM
// ======================

// !skills - Show available skills
async function handleSkillsCommand(message) {
  const userId = message.author.id;
  const user = await db.get(`users.${userId}`);

  if (!user || !user.class) {
    return message.reply("❌ You need to use `!start` first to create your character!");
  }

  const classSkills = BOSS_CONFIG.PLAYER_SKILLS[user.class] || [];

  const embed = new EmbedBuilder()
    .setTitle(`✨ ${user.class.charAt(0).toUpperCase() + user.class.slice(1)} Skills`)
    .setDescription("Use skills in boss fights with `!skill [name]`")
    .setColor(0x9b59b6)
    .setThumbnail('https://media.discordapp.net/attachments/1377111272746778626/1402310057273856042/dee7e7e7c8ba9b8b044f2040aa0f3a45.png?ex=68937283&is=68922103&hm=466eba626c3289f494910726d202c6a14ff23dce8f9b4d44f1340bcf18bf6eae&=&format=webp&quality=lossless&width=920&height=514');

  classSkills.forEach(skill => {
    const cooldown = user.skillCooldowns?.[skill.id] || 0;
    const remaining = cooldown > Date.now() ? 
      `⏱️ ${Math.ceil((cooldown - Date.now()) / 1000)}s cooldown` : 
      '✅ Ready to use';

    embed.addFields({
      name: `${skill.emoji} ${skill.name}`,
      value: `${skill.description}\nMana Cost: ${skill.manaCost}\nCooldown: ${skill.cooldown}s\nStatus: ${remaining}`,
      inline: false
    });
  });

  await message.reply({ embeds: [embed] });
}

// !skill [name] - Use a skill
async function handleUseSkillCommand(message, skillName) {
  const serverData = await db.get('server') || {};

  if (!serverData.bossActive) {
    return message.reply("You can only use skills during a boss fight!");
  }

  const userId = message.author.id;
  const user = await db.get(`users.${userId}`);

  if (!user || !user.class) {
    return message.reply("❌ You need to use `!start` first to create your character!");
  }

  const classSkills = BOSS_CONFIG.PLAYER_SKILLS[user.class] || [];
  const skill = classSkills.find(s => 
    s.name.toLowerCase() === skillName.toLowerCase() || 
    s.id === skillName.toLowerCase()
  );

  if (!skill) {
    return message.reply(`Invalid skill! Use \`!skills\` to see available skills.`);
  }

  // Check cooldown
  const cooldown = user.skillCooldowns?.[skill.id] || 0;
  if (cooldown > Date.now()) {
    const remaining = Math.ceil((cooldown - Date.now()) / 1000);
    return message.reply(`⏱️ ${skill.name} is on cooldown! Please wait ${remaining} seconds.`);
  }

  // Check mana
  if (user.stats.mana < skill.manaCost) {
    return message.reply(`🔮 Not enough mana! You need ${skill.manaCost} mana to use ${skill.name}.`);
  }

  // Execute skill
  const result = await skill.execute(user, serverData);

  // Deduct mana
  await db.set(`users.${userId}.stats.mana`, user.stats.mana - skill.manaCost);

  // Set cooldown
  const newCooldowns = user.skillCooldowns || {};
  newCooldowns[skill.id] = Date.now() + (skill.cooldown * 1000);
  await db.set(`users.${userId}.skillCooldowns`, newCooldowns);

  // Save server data if modified
  await db.set('server', serverData);

  // Send result
  const embed = new EmbedBuilder()
    .setTitle(`✨ ${message.author.username} used ${skill.name}!`)
    .setDescription(result)
    .setColor(0x3498db)
    .addFields(
      { name: '❤️ Boss HP', value: getHealthBar(serverData.bossHP, serverData.boss.baseHP), inline: true },
      { name: '🔮 Your Mana', value: `${user.stats.mana - skill.manaCost}/${user.stats.maxMana}`, inline: true }
    );

  await message.reply({ embeds: [embed] });
}

// ======================
// 🏥 RECOVERY COMMANDS
// ======================

// !heal - Use a health potion
async function handleHealCommand(message) {
  const userId = message.author.id;
  const user = await db.get(`users.${userId}`);

  if (!user || !user.class) {
    return message.reply("❌ You need to use `!start` first to create your character!");
  }

  // Check for health potions
  const healthPotion = user.inventory?.find(item => 
    item.name === "Health Potion" && item.amount > 0
  );

  if (!healthPotion) {
    return message.reply("You don't have any Health Potions! Buy some from the shop.");
  }

  // Use potion
  const healAmount = 50;
  const newHp = Math.min(user.stats.maxHp, user.stats.hp + healAmount);

  // Update inventory
  const newInventory = user.inventory.map(item => 
    item.id === healthPotion.id ? { ...item, amount: item.amount - 1 } : item
  ).filter(item => item.amount > 0);

  await db.set(`users.${userId}.stats.hp`, newHp);
  await db.set(`users.${userId}.inventory`, newInventory);

  const embed = new EmbedBuilder()
    .setTitle(`❤️ ${message.author.username} used a Health Potion!`)
    .setDescription(`Restored ${healAmount} HP!`)
    .setColor(0xe74c3c)
    .addFields(
      { name: '❤️ HP', value: `${newHp}/${user.stats.maxHp}`, inline: true },
      { name: '🧪 Potions Left', value: `${healthPotion.amount - 1}`, inline: true }
    );

  await message.reply({ embeds: [embed] });
}

// !revive - Use a phoenix down
async function handleReviveCommand(message) {
  const userId = message.author.id;
  const user = await db.get(`users.${userId}`);

  if (!user || !user.class) {
    return message.reply("❌ You need to use `!start` first to create your character!");
  }

  if (user.stats.hp > 0) {
    return message.reply("You're not defeated! Use this command only when your HP is 0.");
  }

  // Check for Phoenix Down
  const phoenixDown = user.inventory?.find(item => 
    item.name === "Phoenix Down" && item.amount > 0
  );

  if (!phoenixDown) {
    return message.reply("You don't have any Phoenix Downs! Buy some from the shop.");
  }

  // Revive player
  const reviveAmount = Math.floor(user.stats.maxHp * 0.5);

  // Update inventory
  const newInventory = user.inventory.map(item => 
    item.id === phoenixDown.id ? { ...item, amount: item.amount - 1 } : item
  ).filter(item => item.amount > 0);

  await db.set(`users.${userId}.stats.hp`, reviveAmount);
  await db.set(`users.${userId}.inventory`, newInventory);

  const embed = new EmbedBuilder()
    .setTitle(`✨ ${message.author.username} used a Phoenix Down!`)
    .setDescription(`Revived with ${reviveAmount} HP!`)
    .setColor(0xf1c40f)
    .addFields(
      { name: '❤️ HP', value: `${reviveAmount}/${user.stats.maxHp}`, inline: true },
      { name: '🕊️ Phoenix Downs Left', value: `${phoenixDown.amount - 1}`, inline: true }
    );

  await message.reply({ embeds: [embed] });
}

// ======================
// 🏆 LEADERBOARDS
// ======================
async function handleTopCommand(message, type = 'gold') {
  await updateLeaderboards();
  const serverData = await db.get('server');
  const leaderboard = serverData.leaderboards[type] || [];

  const titles = {
    gold: "💰 Richest Players",
    level: "🌟 Highest Levels",
    wins: "⚔️ PvP Champions"
  };

  const emojis = {
    gold: "🥇",
    level: "🏆",
    wins: "⚔️"
  };

  const embed = new EmbedBuilder()
    .setTitle(`${emojis[type]} ${titles[type]}`)
    .setColor(0xf1c40f)
    .setThumbnail('https://media.discordapp.net/attachments/1377111272746778626/1402312413302489170/851ce1ff39f151d8622f6850aab256e9.png?ex=689374b5&is=68922335&hm=ab6326d20028db760a5222ac69b8a62e98977accf5c3f8f00aeb93600fe4cb42&=&format=webp&quality=lossless&width=1356&height=763');

  if (leaderboard.length === 0) {
    embed.setDescription("No leaderboard data available yet. Play more to appear on the boards!");
  } else {
    const leaderboardText = leaderboard.map((entry, i) => {
      const rankMedal = i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i+1}`;
      const suffix = type === 'gold' ? 'g' : type === 'level' ? ' Level' : ' Wins';
      return `${rankMedal} <@${entry.id}> - **${entry.value}${suffix}**`;
    }).join('\n');

    embed.setDescription(leaderboardText);
  }

  // Add navigation buttons
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('leaderboard_gold')
      .setLabel('Gold')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('💰'),
    new ButtonBuilder()
      .setCustomId('leaderboard_level')
      .setLabel('Level')
      .setStyle(ButtonStyle.Success)
      .setEmoji('🌟'),
    new ButtonBuilder()
      .setCustomId('leaderboard_wins')
      .setLabel('Wins')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('⚔️')
  );

  await message.reply({ embeds: [embed], components: [row] });
}

// ======================
// 🛠️ UTILITY FUNCTIONS
// ======================
function getTypeEmoji(type) {
  switch(type.toLowerCase()) {
    case 'consumable': return '❤️';
    case 'weapon': return '⚔️';
    case 'armor': return '🛡️';
    case 'accessory': return '💍';
    case 'chest': return '📦';
    default: return '📦';
  }
}

function getElementEmoji(element) {
  switch(element.toLowerCase()) {
    case 'fire': return '🔥';
    case 'water': return '💧';
    case 'ice': return '❄️';
    case 'lightning': return '⚡';
    case 'earth': return '🌍';
    default: return '';
  }
}

// ======================
// 🤖 BOT EVENT HANDLERS
// ======================

// Bot startup
client.on('ready', () => {
  console.log(`🏆 RPG Bot Online: ${client.user.tag}`);
  client.user.setActivity('!help for commands', { type: 'PLAYING' });
  updateLeaderboards();
});

// Message handler
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Initialize database
  await initDatabase();

  const content = message.content.toLowerCase();

  // Handle commands
  if (content.startsWith('!start')) {
    await handleStartCommand(message);
  }
  else if (content.startsWith('!profile')) {
    await handleProfileCommand(message);
  }
  else if (content.startsWith('!daily')) {
    await handleDailyCommand(message);
  }
  else if (content.startsWith('!openchest')) {
    await handleOpenChest(message);
  }
  else if (content.startsWith('!summonboss')) {
    await handleSummonBossCommand(message);
  }
  else if (content.startsWith('!attack')) {
    await handleAttackCommand(message);
  }
  else if (content.startsWith('!shop')) {
    const page = parseInt(content.split(' ')[1]) || 1;
    await handleShopCommand(message, page);
  }
  else if (content.startsWith('!buy')) {
    const itemId = content.split(' ')[1];
    await handleBuyCommand(message, itemId);
  }
  else if (content.startsWith('!inventory') || content.startsWith('!inv')) {
    await handleInventoryCommand(message);
  }
  else if (content.startsWith('!skills')) {
    await handleSkillsCommand(message);
  }
  else if (content.startsWith('!skill ')) {
    const skillName = content.split(' ').slice(1).join(' ');
    await handleUseSkillCommand(message, skillName);
  }
  else if (content.startsWith('!heal')) {
    await handleHealCommand(message);
  }
  else if (content.startsWith('!revive')) {
    await handleReviveCommand(message);
  }
  else if (content.startsWith('!top')) {
    const type = content.split(' ')[1] || 'gold';
    await handleTopCommand(message, type);
  }
  else if (content === '?help') {
    const embed = new EmbedBuilder()
      .setTitle('📖 RPG Bot Commands Guide')
      .setDescription('All available commands for your adventure:')
      .setColor(0x7289da)
      .setThumbnail('https://media.discordapp.net/attachments/1377111272746778626/1402312927226105936/2da23d7ce78c96f1877a8621c3318532.png?ex=6893752f&is=689223af&hm=005fcc483cee723b7e4b167d132d2d739ba7d0bb82b7c4b674b542638ea959fc&=&format=webp&quality=lossless&width=920&height=518')
      .addFields(
        { name: '🎮 Character', value: '`!start` - Begin journey\n`!profile` - View stats', inline: true },
        { name: '💰 Economy', value: '`!daily` - Daily rewards\n`!shop` - Browse shop\n`!buy [ID]` - Buy items', inline: true },
        { name: '📦 Inventory', value: '`!inventory` - View items\n`!use [ID]` - Use items\n`!equip [ID]` - Equip gear', inline: true },
        { name: '⚔️ Combat', value: '`!summonboss` - Spawn boss (Mods)\n`!attack` - Attack boss\n`!skills` - View skills', inline: true },
        { name: '🏆 Leaderboards', value: '`!top gold` - Richest players\n`!top level` - Highest levels\n`!top wins` - PvP champions', inline: true },
        { name: '🆘 Recovery', value: '`!heal` - Use health potion\n`!revive` - Revive when defeated', inline: true }
      );

    await message.reply({ embeds: [embed] });
  }
  else if (content === '!bosshelp') {
    const embed = new EmbedBuilder()
      .setTitle('🐉 Boss Battle Guide')
      .setDescription('Commands and strategies for epic boss battles')
      .setColor(0xe74c3c)
      .setThumbnail('https://media.discordapp.net/attachments/1377111272746778626/1402313381280616448/e49f52a4bd76ebd5c5b114e48d4195ea.png?ex=6893759b&is=6892241b&hm=3a335d9622ff5f7481417788f49fcdb4cad67d5c73f19bf26a13b9b362250b70&=&format=webp&quality=lossless&width=920&height=518')
      .addFields(
        { name: '⚔️ Combat Commands', value: '`!attack` - Basic attack\n`!skill [name]` - Use a skill\n`!skills` - View your skills', inline: false },
        { name: '🎯 Strategy Tips', value: '• Exploit boss weaknesses\n• Coordinate with teammates\n• Use skills strategically\n• Heal when HP is low', inline: false },
        { name: '🎁 Rewards', value: '• Gold for all participants\n• Special loot for top damage dealer\n• Rare items for landing the final blow', inline: false }
      );

    await message.reply({ embeds: [embed] });
  }
});

// Button interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  const userId = interaction.user.id;
  const user = await db.get(`users.${userId}`) || {};

  // Class selection
  if (['warrior', 'mage', 'rogue'].includes(interaction.customId)) {
    if (!user || !user.gold) {
      return interaction.reply({ content: "You need to use `!start` first!", ephemeral: true });
    }

    await db.set(`users.${userId}.class`, interaction.customId);

    // Apply class bonuses
    if (interaction.customId === 'warrior') {
      await db.add(`users.${userId}.stats.attack`, 5);
    } else if (interaction.customId === 'mage') {
      await db.add(`users.${userId}.stats.maxMana`, 20);
    } else if (interaction.customId === 'rogue') {
      await db.add(`users.${userId}.stats.critChance`, 5);
    }

    const embed = new EmbedBuilder()
      .setTitle(`🎉 Class Selected!`)
      .setDescription(`You are now a ${interaction.customId.charAt(0).toUpperCase() + interaction.customId.slice(1)}!`)
      .setColor(0x2ecc71);

    await interaction.update({ embeds: [embed], components: [] });
  }

  // Shop pagination
  else if (interaction.customId.startsWith('shop_')) {
    const [_, action, page] = interaction.customId.split('_');
    await handleShopCommand(interaction.message, parseInt(page));
    await interaction.deferUpdate();
  }

  // Leaderboard navigation
  else if (interaction.customId.startsWith('leaderboard_')) {
    const type = interaction.customId.split('_')[1];
    await handleTopCommand(interaction.message, type);
    await interaction.deferUpdate();
  }

  // Boss skills button
  else if (interaction.customId === 'boss_skills') {
    await handleSkillsCommand(interaction.message);
    await interaction.deferUpdate();
  }

  // Boss attack button
  else if (interaction.customId === 'boss_attack') {
    // Simulate message for attack command
    const fakeMessage = {
      ...interaction.message,
      author: interaction.user,
      content: '!attack',
      reply: async (content) => {
        if (typeof content === 'string') {
          await interaction.reply({ content, ephemeral: true });
        } else {
          await interaction.reply({ ...content, ephemeral: true });
        }
      }
    };

    await handleAttackCommand(fakeMessage);
  }
});

// ======================
// 🚀 START THE BOT
// ======================
client.login(process.env.BOT_TOKEN);