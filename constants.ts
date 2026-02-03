import { Category, Walnut } from './types';

export const CATEGORIES: Category[] = [
  { id: 'all', name: '全部雅集', description: 'All Collections' },
  { id: 'lion-head', name: '狮子头', description: 'Lion Head' },
  { id: 'officer-hat', name: '官帽', description: 'Officer\'s Hat' },
  { id: 'tiger-head', name: '虎头', description: 'Tiger Head' },
  { id: 'chicken-heart', name: '鸡心', description: 'Chicken Heart' },
  { id: 'lantern', name: '灯笼', description: 'Lantern' },
  { id: 'white-lion', name: '白狮', description: 'White Lion' },
];

// NOTE for User: Replace the imageUrls below with your actual local file paths
// e.g. imageUrl: '/images/photo1.jpg' if you put them in a public/images folder.
// I have used placeholders with specific aspect ratios to mimic your photos.

export const MOCK_WALNUTS: Walnut[] = [
  {
    id: '1',
    variety: 'lion-head',
    title: '跨界 · 映像',
    ownerName: 'xdzi8b',
    // Simulating Portrait Ratio (iPhone Photo)
    imageUrl: 'https://picsum.photos/600/800?random=101', 
    detailImages: [
      'https://picsum.photos/800/800?random=1011',
      'https://picsum.photos/800/600?random=1012',
      'https://picsum.photos/600/800?random=1013',
    ],
    description: '红润透亮，纹理如脑沟般深邃。在现代科技的背景下，展现出传统文玩的独特魅力。此诗袭用乐府旧题，以浪漫主义的手法，展开丰富的想象，艺术地再现了蜀道峥嵘、突兀、强悍、崎岖等奇丽惊险和不可凌越的磅礴气势，借以歌咏蜀地山川的壮秀，显示出祖国山河的雄伟壮丽，充分显示了诗人的浪漫气质和热爱自然的感情',
    tags: [
      { type: 'size', label: '尺寸', value: '48' },
      { type: 'weight', label: '克重', value: '42g' },
      { type: 'color', label: '色调', value: '枣红色' },
    ],
    likes: 128
  },
  {
    id: '2',
    variety: 'lion-head',
    title: '纹理 · 极致',
    ownerName: 'xdzi8b',
    // Simulating Portrait Ratio (Close up)
    imageUrl: 'https://picsum.photos/600/900?random=102',
    detailImages: [
      'https://picsum.photos/600/600?random=1021',
    ],
    description: '微距镜头下的震撼细节，每一道纹路都记录着岁月的痕迹，皮质紧实，油性十足。',
    tags: [
      { type: 'size', label: '尺寸', value: '46' },
      { type: 'play_time', label: '盘玩', value: '5年' },
      { type: 'color', label: '色调', value: '深褐色' },
    ],
    likes: 86
  },
  {
    id: '3',
    variety: 'officer-hat',
    title: '潮核 · 山地正磨',
    ownerName: 'PerfectMatch',
    // Simulating Landscape/Square Ratio (Studio shot)
    imageUrl: 'https://picsum.photos/800/600?random=103',
    description: '极度稀有的山地正磨，桩型规整，不仅是文玩，更是潮流。',
    tags: [
      { type: 'size', label: '尺寸', value: '40' },
      { type: 'weight', label: '克重', value: '36.5g' },
      { type: 'color', label: '色调', value: '姜黄色' },
    ],
    likes: 204
  },
  {
    id: '4',
    variety: 'tiger-head',
    title: '逆镜 · 满肉满纹',
    ownerName: 'NiJing',
    // Simulating Square Ratio (Studio shot)
    imageUrl: 'https://picsum.photos/800/800?random=104',
    detailImages: [
      'https://picsum.photos/800/800?random=1041',
      'https://picsum.photos/800/800?random=1042',
    ],
    description: '顶级磨王，满肉满纹。尺寸：43-39-31。皮质细腻，骨质惊人。',
    tags: [
      { type: 'size', label: '尺寸', value: '43' },
      { type: 'weight', label: '克重', value: '38.2g' },
      { type: 'play_time', label: '盘玩', value: '1年' },
    ],
    likes: 15
  },
  {
    id: '5',
    variety: 'chicken-heart',
    title: '手盘 · 岁月',
    ownerName: '匿名玩家',
    // Simulating Portrait Ratio (Glove photo)
    imageUrl: 'https://picsum.photos/600/750?random=105',
    description: '白手套精心盘玩，色泽已转为深红，包浆温润如玉。',
    tags: [
      { type: 'play_time', label: '盘玩', value: '3年' },
      { type: 'color', label: '色调', value: '玉化红' },
      { type: 'size', label: '尺寸', value: '39' },
    ],
    likes: 332
  },
  {
    id: '6',
    variety: 'lion-head',
    title: '厚德 · 载物',
    ownerName: '厚德',
    // Simulating Square/Portrait Ratio
    imageUrl: 'https://picsum.photos/700/700?random=106',
    description: '纹路狂野不羁，底部敦实，彰显厚重之美。',
    tags: [
      { type: 'size', label: '尺寸', value: '46' },
      { type: 'weight', label: '克重', value: '45g' },
      { type: 'color', label: '色调', value: '白茬' },
    ],
    likes: 67
  },
];