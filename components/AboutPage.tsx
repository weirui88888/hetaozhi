import React from 'react';
import { Scroll } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 sm:py-20 animate-fade-in">
      <div className="relative border-l-2 border-stone-200/50 pl-8 sm:pl-16 ml-4 sm:ml-0">
        
        {/* Decor: Vertical Title */}
        <div className="absolute -left-1 top-0 bottom-0 py-8 hidden sm:flex flex-col items-center justify-start opacity-40">
           <span className="writing-vertical-rl text-2xl font-bold tracking-[0.5em] text-stone-300 select-none">
             缘起与初心
           </span>
        </div>

        {/* Main Content */}
        <article className="prose prose-stone prose-lg prose-p:text-ink-light prose-p:font-light prose-headings:font-serif prose-headings:text-ink">
          
          <div className="mb-12">
            <h2 className="text-3xl font-bold tracking-widest text-ink mb-6 flex items-center gap-3">
              <Scroll className="w-6 h-6 text-seal-red opacity-80" />
              <span>初心</span>
            </h2>
            <p className="leading-loose text-lg">
              在这个快节奏的数字时代，万物皆求速成。唯有文玩核桃，讲究的是
              <span className="text-walnut font-medium mx-1">岁月</span>
              与
              <span className="text-walnut font-medium mx-1">耐心</span>。
            </p>
            <p className="leading-loose text-lg">
              之所以建立这个「核桃雅集」，是希望在这个纷杂的网络世界中，开辟一方静谧的角落。
              不为交易，不为攀比，只为单纯地展示那掌中日复一日盘玩出的温润光泽。
            </p>
          </div>

          <div className="mb-12">
            <h3 className="text-xl font-bold tracking-wide text-ink mb-4">关于雅集</h3>
            <p className="leading-relaxed">
              每一对核桃，都是大自然的孤品，也是玩家心血的结晶。
              从白茬到玉化，记录的是时间的重量。我们希望通过极简的设计、纸张的质感，
              最大程度地还原核桃本身的纹理之美，让每一位观者都能感受到那份沉甸甸的“雅趣”。
            </p>
          </div>

          <div className="pt-8 border-t border-stone-100 flex items-center gap-4">
             <div className="w-12 h-12 border border-stone-300 rounded-full flex items-center justify-center bg-stone-50">
                <span className="font-serif text-seal-red text-xl font-bold">印</span>
             </div>
             <div className="flex flex-col">
                <span className="text-sm tracking-widest text-stone-500 uppercase">Established</span>
                <span className="font-serif text-ink font-medium">二零二四 · 初春</span>
             </div>
          </div>

        </article>
      </div>
    </div>
  );
};

export default AboutPage;
