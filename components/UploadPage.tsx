import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Ruler, Scale, Palette, Save } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { Walnut, WalnutTag } from '../types';

interface UploadPageProps {
  onCancel: () => void;
  onSave: (walnut: Walnut) => void;
}

interface ImageFile {
  file: File;
  preview: string;
  width: number;
  height: number;
}

const COLORS = [
  '白茬', '姜黄', '红润', '枣红', '紫玉', '深褐', '黑红'
];

const UploadPage: React.FC<UploadPageProps> = ({ onCancel, onSave }) => {
  // --- Form States ---
  const [coverImage, setCoverImage] = useState<ImageFile | null>(null);
  const [detailImages, setDetailImages] = useState<ImageFile[]>([]);
  
  const [title, setTitle] = useState('');
  const [variety, setVariety] = useState(CATEGORIES[1].id); // Default to Lion Head
  const [ownerName, setOwnerName] = useState('管理员'); // Default owner
  const [description, setDescription] = useState('');
  
  // Specific Metrics
  const [sizeEdge, setSizeEdge] = useState(''); // 边
  const [sizeBelly, setSizeBelly] = useState(''); // 肚
  const [sizeHeight, setSizeHeight] = useState(''); // 高
  
  const [weight, setWeight] = useState('');
  const [playTimeValue, setPlayTimeValue] = useState('');
  const [playTimeUnit, setPlayTimeUnit] = useState('年');
  const [color, setColor] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const detailInputRef = useRef<HTMLInputElement>(null);

  // --- Image Handling Logic ---
  const processFile = (file: File): Promise<ImageFile> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          resolve({
            file,
            preview: e.target?.result as string,
            width: img.naturalWidth,
            height: img.naturalHeight
          });
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const imgData = await processFile(e.target.files[0]);
      setCoverImage(imgData);
    }
  };

  const handleDetailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages: ImageFile[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const imgData = await processFile(e.target.files[i]);
        newImages.push(imgData);
      }
      setDetailImages(prev => [...prev, ...newImages]);
    }
  };

  const removeDetailImage = (index: number) => {
    setDetailImages(prev => prev.filter((_, i) => i !== index));
  };

  // --- Submission Logic ---
  const handleSubmit = () => {
    if (!coverImage || !title) {
      alert("请至少上传封面图并填写标题。");
      return;
    }

    // 1. Generate Tags
    const tags: WalnutTag[] = [];

    // Size Tag: Format "48" or "48-42-40"
    let sizeStr = sizeEdge;
    if (sizeBelly) sizeStr += `-${sizeBelly}`;
    if (sizeHeight) sizeStr += `-${sizeHeight}`;
    
    if (sizeStr) {
      tags.push({ type: 'size', label: '尺寸', value: sizeStr });
    }

    if (weight) {
      tags.push({ type: 'weight', label: '克重', value: `${weight}g` });
    }

    if (playTimeValue) {
      tags.push({ type: 'play_time', label: '盘玩', value: `${playTimeValue}${playTimeUnit}` });
    }

    if (color) {
      tags.push({ type: 'color', label: '色调', value: color });
    }

    // 2. Construct Object
    // NOTE: In a real app, you would upload the files to storage here 
    // and get back URL strings. Here we use the base64 preview for demo.
    const newWalnut: Walnut = {
      id: Date.now().toString(),
      title,
      variety,
      ownerName,
      description,
      imageUrl: coverImage.preview,
      width: coverImage.width,
      height: coverImage.height,
      detailImages: detailImages.map(d => d.preview),
      tags,
      likes: 0
    };

    console.log("Submitting to DB:", newWalnut);
    onSave(newWalnut);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="bg-white/50 backdrop-blur-md border border-stone-200 rounded-sm p-6 sm:p-10 shadow-sm">
        
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-stone-100">
          <h2 className="text-2xl font-serif font-bold text-ink">上传珍品</h2>
          <button onClick={onCancel} className="text-stone-400 hover:text-stone-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Left Column: Image Upload */}
          <div className="space-y-6">
            
            {/* Cover Image */}
            <div className="space-y-2">
              <label className="block text-sm font-bold tracking-widest text-ink uppercase">
                封面主图 <span className="text-red-400">*</span>
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative w-full aspect-[3/4] rounded-sm border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all
                  ${coverImage ? 'border-transparent' : 'border-stone-300 hover:border-walnut bg-stone-50 hover:bg-stone-100'}
                `}
              >
                {coverImage ? (
                  <>
                    <img src={coverImage.preview} alt="Cover" className="w-full h-full object-cover rounded-sm" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-medium">
                      点击更换
                    </div>
                    {/* Auto-detected badge */}
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-sm backdrop-blur-md">
                      {coverImage.width} x {coverImage.height}
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                    <span className="text-stone-500 text-sm">点击上传封面</span>
                    <p className="text-stone-300 text-xs mt-2">支持拖拽</p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleCoverChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>

            {/* Detail Images */}
            <div className="space-y-2">
              <label className="block text-sm font-bold tracking-widest text-ink uppercase">
                细节展示图
              </label>
              <div className="grid grid-cols-4 gap-2">
                {detailImages.map((img, idx) => (
                  <div key={idx} className="relative aspect-square group">
                    <img src={img.preview} className="w-full h-full object-cover rounded-sm border border-stone-200" />
                    <button 
                      onClick={() => removeDetailImage(idx)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                <button 
                  onClick={() => detailInputRef.current?.click()}
                  className="aspect-square border border-dashed border-stone-300 rounded-sm flex items-center justify-center hover:bg-stone-50 text-stone-400 transition-colors"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
                <input 
                  type="file" 
                  multiple
                  ref={detailInputRef} 
                  onChange={handleDetailChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>

          </div>

          {/* Right Column: Information Form */}
          <div className="space-y-6">
            
            {/* Title & Variety */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">雅集名称</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="如：跨界 · 映像"
                  className="w-full bg-stone-50 border border-stone-200 p-2 text-ink font-serif focus:outline-none focus:border-walnut focus:ring-1 focus:ring-walnut transition-all rounded-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">品种分类</label>
                <select 
                  value={variety}
                  onChange={e => setVariety(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 p-2 text-ink font-serif focus:outline-none focus:border-walnut rounded-sm"
                >
                  {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Owner (Admin) */}
            <div className="space-y-1.5">
               <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">收藏者 / 来源</label>
               <input 
                  type="text" 
                  value={ownerName}
                  onChange={e => setOwnerName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 p-2 text-ink text-sm focus:outline-none focus:border-walnut rounded-sm"
                />
            </div>

            <hr className="border-stone-100" />

            {/* Dimensions (The 3-part input) */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-stone-500 mb-1">
                <Ruler className="w-4 h-4" />
                <label className="text-xs font-bold uppercase tracking-wider">三围尺寸 (mm)</label>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <input 
                    type="number" 
                    value={sizeEdge} 
                    onChange={e => setSizeEdge(e.target.value)} 
                    placeholder="边"
                    className="w-full text-center bg-stone-50 border border-stone-200 p-2 focus:border-walnut focus:outline-none rounded-sm"
                  />
                  <span className="block text-center text-[10px] text-stone-400 mt-1">边 (长)</span>
                </div>
                <span className="text-stone-300">-</span>
                <div className="flex-1">
                  <input 
                    type="number" 
                    value={sizeBelly} 
                    onChange={e => setSizeBelly(e.target.value)} 
                    placeholder="肚"
                    className="w-full text-center bg-stone-50 border border-stone-200 p-2 focus:border-walnut focus:outline-none rounded-sm"
                  />
                  <span className="block text-center text-[10px] text-stone-400 mt-1">肚 (宽)</span>
                </div>
                <span className="text-stone-300">-</span>
                <div className="flex-1">
                  <input 
                    type="number" 
                    value={sizeHeight} 
                    onChange={e => setSizeHeight(e.target.value)} 
                    placeholder="高"
                    className="w-full text-center bg-stone-50 border border-stone-200 p-2 focus:border-walnut focus:outline-none rounded-sm"
                  />
                  <span className="block text-center text-[10px] text-stone-400 mt-1">高</span>
                </div>
              </div>
            </div>

            {/* Weight & Play Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-stone-500 mb-1">
                  <Scale className="w-4 h-4" />
                  <label className="text-xs font-bold uppercase tracking-wider">克重</label>
                </div>
                <div className="relative">
                  <input 
                    type="number" 
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 p-2 pr-8 focus:border-walnut focus:outline-none rounded-sm"
                  />
                  <span className="absolute right-3 top-2 text-stone-400 text-sm">g</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-stone-500 mb-1">
                  <span className="font-serif text-sm italic">T</span>
                  <label className="text-xs font-bold uppercase tracking-wider">盘玩时间</label>
                </div>
                <div className="flex">
                  <input 
                    type="number" 
                    value={playTimeValue}
                    onChange={e => setPlayTimeValue(e.target.value)}
                    className="w-2/3 bg-stone-50 border border-stone-200 p-2 rounded-l-sm focus:border-walnut focus:outline-none border-r-0"
                  />
                  <select 
                    value={playTimeUnit}
                    onChange={e => setPlayTimeUnit(e.target.value)}
                    className="w-1/3 bg-stone-100 border border-stone-200 p-2 rounded-r-sm text-sm focus:border-walnut focus:outline-none"
                  >
                    <option value="个月">月</option>
                    <option value="年">年</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Color Selection */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-stone-500 mb-1">
                <Palette className="w-4 h-4" />
                <label className="text-xs font-bold uppercase tracking-wider">皮质色调</label>
              </div>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`
                      px-3 py-1 text-xs rounded-full border transition-all
                      ${color === c 
                        ? 'bg-ink text-white border-ink' 
                        : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'}
                    `}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-stone-100" />

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">背后的故事</label>
              <textarea 
                rows={5}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="描述这对于核桃的独特之处..."
                className="w-full bg-stone-50 border border-stone-200 p-3 text-sm leading-relaxed text-ink focus:outline-none focus:border-walnut focus:ring-1 focus:ring-walnut rounded-sm resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex items-center justify-end gap-4">
              <button 
                onClick={onCancel}
                className="px-6 py-2 text-stone-500 hover:text-ink text-sm tracking-widest transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleSubmit}
                className="flex items-center gap-2 px-8 py-2 bg-ink text-white hover:bg-stone-800 transition-colors rounded-sm shadow-md hover:shadow-lg"
              >
                <Save className="w-4 h-4" />
                <span className="tracking-widest font-bold text-sm">发布入册</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;