import { Category, Walnut } from "./types";

export const CATEGORIES: Category[] = [
  { id: "all", name: "全部雅集", description: "All Collections" },
  { id: "lion-head", name: "狮子头", description: "Lion Head" },
  { id: "officer-hat", name: "官帽", description: "Officer's Hat" },
  { id: "tiger-head", name: "虎头", description: "Tiger Head" },
  { id: "chicken-heart", name: "鸡心", description: "Chicken Heart" },
  { id: "lantern", name: "灯笼", description: "Lantern" },
  { id: "white-lion", name: "白狮", description: "White Lion" },
];

export const TAG_LABELS: Record<string, string> = {
  size: "尺寸",
  play_time: "盘玩",
  weight: "克重",
  color: "色调",
};

export const WALNUT_COLORS = [
  { id: "white", name: "白茬" },
  { id: "yellow", name: "姜黄" },
  { id: "red_bright", name: "红润" },
  { id: "red_dark", name: "枣红" },
  { id: "purple", name: "紫玉" },
  { id: "brown", name: "深褐" },
  { id: "black_red", name: "黑红" },
];

export const COLOR_MAP: Record<string, string> = {
  white: "白茬",
  yellow: "姜黄",
  red_bright: "红润",
  red_dark: "枣红",
  purple: "紫玉",
  brown: "深褐",
  black_red: "黑红",
};

export const MOCK_WALNUTS: Walnut[] = [
  {
    id: "1",
    variety: "lion-head",
    title: "跨界 · 映像",
    ownerName: "xdzi8b",
    coverImage: {
      url: "https://picsum.photos/600/800?random=101",
      width: 600,
      height: 800,
    },
    detailImages: [
      {
        url: "https://picsum.photos/800/800?random=1011",
        width: 800,
        height: 800,
      },
      {
        url: "https://picsum.photos/800/600?random=1012",
        width: 800,
        height: 600,
      },
      {
        url: "https://picsum.photos/600/800?random=1013",
        width: 600,
        height: 800,
      },
    ],
    description:
      "红润透亮，纹理如脑沟般深邃。在现代科技的背景下，展现出传统文玩的独特魅力。此诗袭用乐府旧题，以浪漫主义的手法，展开丰富的想象，艺术地再现了蜀道峥嵘、突兀、强悍、崎岖等奇丽惊险和不可凌越的磅礴气势，借以歌咏蜀地山川的壮秀，显示出祖国山河的雄伟壮丽，充分显示了诗人的浪漫气质和热爱自然的感情",
    tags: [
      { type: "size", value: { length: "48", width: "42", height: "40" } },
      { type: "weight", value: "42g" },
      { type: "color", value: "red_dark" },
    ],
    likes: 128,
  },
  {
    id: "2",
    variety: "lion-head",
    title: "纹理 · 极致",
    ownerName: "xdzi8b",
    coverImage: {
      url: "https://picsum.photos/600/900?random=102",
      width: 600,
      height: 900,
    },
    detailImages: [
      {
        url: "https://picsum.photos/600/600?random=1021",
        width: 600,
        height: 600,
      },
    ],
    description:
      "微距镜头下的震撼细节，每一道纹路都记录着岁月的痕迹，皮质紧实，油性十足。",
    tags: [
      { type: "size", value: { length: "46", width: "40", height: "" } },
      { type: "play_time", value: "5年" },
      { type: "color", value: "brown" },
    ],
    likes: 86,
  },
  {
    id: "3",
    variety: "officer-hat",
    title: "潮核 · 山地正磨",
    ownerName: "PerfectMatch",
    coverImage: {
      url: "https://picsum.photos/800/600?random=103",
      width: 800,
      height: 600,
    },
    description: "极度稀有的山地正磨，桩型规整，不仅是文玩，更是潮流。",
    tags: [
      { type: "size", value: { length: "40", width: "38", height: "36" } },
      { type: "weight", value: "36.5g" },
      { type: "color", value: "yellow" },
    ],
    likes: 204,
  },
  {
    id: "4",
    variety: "tiger-head",
    title: "逆镜 · 满肉满纹",
    ownerName: "NiJing",
    coverImage: {
      url: "https://picsum.photos/800/800?random=104",
      width: 800,
      height: 800,
    },
    detailImages: [
      {
        url: "https://picsum.photos/800/800?random=1041",
        width: 800,
        height: 800,
      },
      {
        url: "https://picsum.photos/800/800?random=1042",
        width: 800,
        height: 800,
      },
    ],
    description: "顶级磨王，满肉满纹。尺寸：43-39-31。皮质细腻，骨质惊人。",
    tags: [
      { type: "size", value: { length: "43", width: "39", height: "31" } },
      { type: "weight", value: "38.2g" },
      { type: "play_time", value: "1年" },
    ],
    likes: 15,
  },
  {
    id: "5",
    variety: "chicken-heart",
    title: "手盘 · 岁月",
    ownerName: "匿名玩家",
    coverImage: {
      url: "https://picsum.photos/600/750?random=105",
      width: 600,
      height: 750,
    },
    description: "白手套精心盘玩，色泽已转为深红，包浆温润如玉。",
    tags: [
      { type: "play_time", value: "3年" },
      { type: "color", value: "red_bright" },
      { type: "size", value: { length: "39", width: "", height: "" } },
    ],
    likes: 332,
  },
  {
    id: "6",
    variety: "lion-head",
    title: "厚德 · 载物",
    ownerName: "厚德",
    coverImage: {
      url: "https://picsum.photos/700/700?random=106",
      width: 700,
      height: 700,
    },
    description: "纹路狂野不羁，底部敦实，彰显厚重之美。",
    tags: [
      { type: "size", value: { length: "46", width: "42", height: "40" } },
      { type: "weight", value: "45g" },
      { type: "color", value: "white" },
    ],
    likes: 67,
  },
];
