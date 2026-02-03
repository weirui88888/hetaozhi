/**
 * =============================================================================
 * 核桃测试数据填充脚本 (Walnut Seed Script)
 * =============================================================================
 *
 * 📌 功能：
 *    生成约 30 条测试数据用于无限滚动加载测试
 *
 * 📌 运行方式：
 *    npx tsx scripts/seed-walnuts.ts
 *
 * =============================================================================
 */

import { MongoClient } from "mongodb";

// =============================================================================
// 配置
// =============================================================================

// 手动加载 .env.local
import { readFileSync } from "fs";
import { resolve } from "path";

const envPath = resolve(process.cwd(), ".env.local");
const envContent = readFileSync(envPath, "utf-8");
const envVars: Record<string, string> = {};
envContent.split("\n").forEach((line) => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const MONGODB_URI = envVars.DATABASE_URL || "mongodb://localhost:27017";
const DB_NAME = envVars.DATABASE_DB_NAME || "hetaozhi_db";
const COLLECTION_NAME = "walnuts";

console.log(`📦 数据库连接: ${MONGODB_URI}`);
console.log(`📦 数据库名称: ${DB_NAME}`);

// Mock 数据模板
const VARIETIES = [
  "south-west",
  "toad-head",
  "three-edge",
  "millstone",
  "officer-hat",
  "tiger-head",
  "chicken-heart",
  "white-lion",
];

const TITLES = [
  "满天星",
  "白狮子",
  "南疆石",
  "官帽精品",
  "虎头王",
  "鸡心佳品",
  "蛤蟆头极品",
  "三棱狮子头",
  "磨盘精品",
  "四座楼狮子头",
  "老树南疆石",
  "苹果园狮子头",
  "王勇官帽",
  "马老四老狮子头",
  "麒麟纹狮子头",
  "龙纹白狮",
  "盘龙纹虎头",
  "水龙纹南疆石",
  "蚂蚁纹官帽",
  "满天星白狮",
  "密纹满天星",
  "大奔官帽",
  "黄皮狮子头",
  "红皮老核桃",
  "闷尖狮子头",
  "矮桩宫廷狮子",
  "高桩蛤蟆头",
  "精品四棱",
  "楸子磨盘",
  "老树鸡心",
];

const OWNERS = [
  "核桃老张",
  "文玩小李",
  "把玩达人",
  "玩核桃的老王",
  "老北京核桃王",
  "山里来的核桃",
  "爱核桃",
  "静心斋主",
  "云水居士",
  "把玩轩",
];

const DESCRIPTIONS = [
  "精挑细选的上等好货，纹路深邃，手感极佳，盘玩多年，包浆温润如玉。",
  "树龄百年老树所产，皮质细腻，密度高，上手沉甸甸的，是不可多得的精品。",
  "山区野生老树核桃，自然生长，无人工干预，纹路天然，独一无二。",
  "多年盘玩的老核桃，包浆厚重，红润通透，手感丝滑，是把玩的极品。",
  "刚下树不久的新核桃，皮质坚硬，纹路清晰，有极大的盘玩潜力。",
  "精选配对，大小、纹路、密度都非常接近，是收藏的佳品。",
];

const COLORS = ["yellow", "red", "brown", "dark"];

const PLAY_TIMES = ["1年", "2年", "3年", "5年", "8年", "10年", "新核桃"];

const WEIGHTS = ["38g", "40g", "42g", "45g", "48g", "50g", "52g", "55g"];

// 图片尺寸模板（模拟真实图片比例）
const IMAGE_SIZES = [
  { width: 800, height: 1000 }, // 竖图
  { width: 800, height: 900 },
  { width: 800, height: 800 }, // 方图
  { width: 800, height: 700 },
  { width: 800, height: 1100 }, // 竖图
  { width: 800, height: 850 },
  { width: 800, height: 950 },
  { width: 800, height: 750 },
];

// =============================================================================
// 辅助函数
// =============================================================================

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateWalnut(index: number) {
  const size = randomItem(IMAGE_SIZES);
  const imageId = randomInt(1, 1000); // picsum 图片 ID

  // 核桃尺寸
  const length = randomInt(38, 52);
  const width = randomInt(36, 50);
  const height = randomInt(34, 48);

  return {
    title: TITLES[index % TITLES.length],
    variety: randomItem(VARIETIES),
    ownerName: randomItem(OWNERS),
    description: randomItem(DESCRIPTIONS),
    coverImage: {
      url: `https://picsum.photos/id/${imageId}/${size.width}/${size.height}`,
      width: size.width,
      height: size.height,
    },
    detailImages:
      Math.random() > 0.5
        ? [
            {
              url: `https://picsum.photos/id/${imageId + 1}/${size.width}/${size.height}`,
              width: size.width,
              height: size.height,
            },
            {
              url: `https://picsum.photos/id/${imageId + 2}/${size.width}/${size.height}`,
              width: size.width,
              height: size.height,
            },
          ]
        : [],
    tags: [
      {
        type: "size",
        value: { length: `${length}`, width: `${width}`, height: `${height}` },
      },
      { type: "play_time", value: randomItem(PLAY_TIMES) },
      { type: "weight", value: randomItem(WEIGHTS) },
      { type: "color", value: randomItem(COLORS) },
    ],
    likes: randomInt(10, 500),
    createdAt: new Date(Date.now() - randomInt(0, 30 * 24 * 60 * 60 * 1000)), // 最近30天
    updatedAt: new Date(),
  };
}

// =============================================================================
// 主函数
// =============================================================================

async function seed() {
  console.log("🌰 开始填充核桃测试数据...\n");

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("✅ 已连接到 MongoDB");

    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // 生成 30 条数据
    const walnuts = Array.from({ length: 30 }, (_, i) => generateWalnut(i));

    // 插入数据
    const result = await collection.insertMany(walnuts);

    console.log(`✅ 成功插入 ${result.insertedCount} 条测试数据`);
    console.log("\n📊 数据统计:");

    // 按品种统计
    const varietyCounts: Record<string, number> = {};
    walnuts.forEach((w) => {
      varietyCounts[w.variety] = (varietyCounts[w.variety] || 0) + 1;
    });

    Object.entries(varietyCounts).forEach(([variety, count]) => {
      console.log(`   - ${variety}: ${count} 条`);
    });

    console.log("\n🎉 测试数据填充完成！");
  } catch (error) {
    console.error("❌ 填充失败:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed();
