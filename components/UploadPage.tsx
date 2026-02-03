/**
 * =============================================================================
 * 上传页面组件 (UploadPage Component)
 * =============================================================================
 *
 * 📌 功能：
 *    - 上传核桃封面图和细节图到七牛云
 *    - 填写核桃详细信息（尺寸、克重、色调等）
 *    - 实时显示上传进度
 *
 * 📌 上传流程：
 *    1. 用户选择图片 → 显示本地预览
 *    2. 用户点击"发布入册" → 依次上传所有图片到七牛云
 *    3. 获取 CDN URL → 构建数据对象 → 调用 onSave 回调
 *
 * =============================================================================
 */

"use client";

import { CATEGORIES, WALNUT_COLORS } from "@/constants";
import { uploadToQiniu } from "@/lib/qiniu-uploader";
import { ImageAsset, Walnut, WalnutTag } from "@/types";
import {
  Image as ImageIcon,
  Loader2,
  Palette,
  Ruler,
  Save,
  Scale,
  Upload,
  X,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { toast } from "sonner";

// =============================================================================
// 开发模式配置
// =============================================================================

/**
 * 开发模式开关
 * - true: 显示「填充测试数据」按钮，方便快速测试上传功能
 * - false: 生产环境，隐藏测试按钮
 *
 * 注意：Next.js 客户端不能直接访问 process.env.NODE_ENV，
 * 这里使用一个简单的常量，手动在生产部署前改为 false
 */
const DEV_MODE = true; // 生产环境部署前改为 false

/**
 * 测试用默认值（仅在开发模式下使用）
 * 修改这里可以快速切换不同的测试场景
 */
const DEV_DEFAULTS = {
  title: "测试核桃 · 自动填充",
  variety: "lion_head", // 狮子头
  ownerName: "开发测试员",
  description: "这是开发环境自动填充的测试数据，用于快速验证上传功能。",
  sizeEdge: "42",
  sizeBelly: "38",
  sizeHeight: "35",
  weight: "68",
  playTimeValue: "3",
  playTimeUnit: "年",
  color: "red_dark", // 枣红
};

// =============================================================================
// 类型定义
// =============================================================================

interface UploadPageProps {
  onCancel: () => void;
  onSave: (walnut: Walnut) => void;
  initialData?: Walnut;
}

/**
 * 本地图片文件状态
 * - file: 原始文件对象（编辑模式下可能为空）
 * - preview: 预览 URL
 * - width/height: 图片尺寸
 * - uploadedUrl: 已有的 CDN URL
 */
interface LocalImageFile {
  file?: File;
  preview: string;
  width: number;
  height: number;
  uploadedUrl?: string;
  isUploading?: boolean;
  uploadProgress?: number;
}

// =============================================================================
// 组件实现
// =============================================================================

const UploadPage: React.FC<UploadPageProps> = ({
  onCancel,
  onSave,
  initialData,
}) => {
  const isEditMode = !!initialData;

  // --- 图片状态 ---
  const [coverImage, setCoverImage] = useState<LocalImageFile | null>(() => {
    if (initialData?.coverImage) {
      return {
        preview: initialData.coverImage.url,
        uploadedUrl: initialData.coverImage.url,
        width: initialData.coverImage.width,
        height: initialData.coverImage.height,
      };
    }
    return null;
  });

  const [detailImages, setDetailImages] = useState<LocalImageFile[]>(() => {
    return (
      initialData?.detailImages?.map((img) => ({
        preview: img.url,
        uploadedUrl: img.url,
        width: img.width,
        height: img.height,
      })) || []
    );
  });

  // --- 表单状态 ---
  const [title, setTitle] = useState(initialData?.title || "");
  const [variety, setVariety] = useState(
    initialData?.variety || CATEGORIES[1].id,
  );
  const [ownerName, setOwnerName] = useState(
    initialData?.ownerName || "管理员",
  );
  const [description, setDescription] = useState(
    initialData?.description || "",
  );

  // --- 辅助函数：从 tags 中解析具体值 ---
  const getTagValue = (type: string) => {
    return initialData?.tags.find((t) => t.type === type)?.value;
  };

  const initialSize = getTagValue("size") as
    | { length: string; width: string; height: string }
    | undefined;

  // --- 尺寸三围 ---
  const [sizeEdge, setSizeEdge] = useState(initialSize?.length || "");
  const [sizeBelly, setSizeBelly] = useState(initialSize?.width || "");
  const [sizeHeight, setSizeHeight] = useState(initialSize?.height || "");

  // --- 其他属性 ---
  const [weight, setWeight] = useState(
    (getTagValue("weight") as string)?.replace("g", "") || "",
  );

  const rawPlayTime = getTagValue("play_time") as string;
  const [playTimeValue, setPlayTimeValue] = useState(
    rawPlayTime?.replace(/[^\d]/g, "") || "",
  );
  const [playTimeUnit, setPlayTimeUnit] = useState(
    rawPlayTime?.includes("个月") ? "个月" : "年",
  );

  const [color, setColor] = useState((getTagValue("color") as string) || "");

  // --- 提交状态 ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState("");

  // --- Refs ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const detailInputRef = useRef<HTMLInputElement>(null);

  // =============================================================================
  // 开发辅助功能
  // =============================================================================

  /**
   * 一键填充测试数据（仅开发模式）
   */
  const fillDevDefaults = () => {
    setTitle(DEV_DEFAULTS.title);
    setVariety(DEV_DEFAULTS.variety);
    setOwnerName(DEV_DEFAULTS.ownerName);
    setDescription(DEV_DEFAULTS.description);
    setSizeEdge(DEV_DEFAULTS.sizeEdge);
    setSizeBelly(DEV_DEFAULTS.sizeBelly);
    setSizeHeight(DEV_DEFAULTS.sizeHeight);
    setWeight(DEV_DEFAULTS.weight);
    setPlayTimeValue(DEV_DEFAULTS.playTimeValue);
    setPlayTimeUnit(DEV_DEFAULTS.playTimeUnit);
    setColor(DEV_DEFAULTS.color);
  };

  // =============================================================================
  // 图片处理逻辑
  // =============================================================================

  /**
   * 处理选中的文件，生成本地预览
   */
  const processFile = (file: File): Promise<LocalImageFile> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          resolve({
            file,
            preview: e.target?.result as string,
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  /**
   * 处理封面图选择
   */
  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const imgData = await processFile(e.target.files[0]);
      setCoverImage(imgData);
    }
  };

  /**
   * 处理细节图选择（支持多选）
   */
  const handleDetailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages: LocalImageFile[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const imgData = await processFile(e.target.files[i]);
        newImages.push(imgData);
      }
      setDetailImages((prev) => [...prev, ...newImages]);
    }
  };

  /**
   * 移除细节图
   */
  const removeDetailImage = (index: number) => {
    setDetailImages((prev) => prev.filter((_, i) => i !== index));
  };

  // =============================================================================
  // 提交逻辑（含七牛云上传）
  // =============================================================================

  /**
   * 上传单张图片到七牛云
   */
  const uploadSingleImage = async (
    localImage: LocalImageFile,
    folder: string,
    onProgress?: (progress: number) => void,
  ): Promise<ImageAsset> => {
    const result = await uploadToQiniu(localImage.file, {
      namingMode: "uuid",
      folder,
      onProgress,
    });

    return {
      url: result.url,
      width: localImage.width,
      height: localImage.height,
    };
  };

  /**
   * 处理表单提交
   */
  const handleSubmit = async () => {
    // 1. 基础校验
    if (!coverImage || !title) {
      toast.error("请至少上传封面图并填写标题。");
      return;
    }

    setIsSubmitting(true);

    try {
      // 2. 上传封面图 (仅当有新文件时)
      let uploadedCover: ImageAsset;
      if (coverImage.file) {
        setSubmitProgress("正在上传封面图...");
        uploadedCover = await uploadSingleImage(
          coverImage,
          "walnuts/covers",
          (progress) => {
            setSubmitProgress(`正在上传封面图... ${progress}%`);
          },
        );
      } else {
        uploadedCover = {
          url: coverImage.uploadedUrl!,
          width: coverImage.width,
          height: coverImage.height,
        };
      }

      // 3. 上传各细节图
      const uploadedDetails: ImageAsset[] = [];
      for (let i = 0; i < detailImages.length; i++) {
        const img = detailImages[i];
        if (img.file) {
          setSubmitProgress(
            `正在上传新细节图 (${i + 1}/${detailImages.length})...`,
          );
          const uploaded = await uploadSingleImage(
            img,
            "walnuts/details",
            (progress) => {
              setSubmitProgress(
                `正在上传细节图 (${i + 1}/${detailImages.length})... ${progress}%`,
              );
            },
          );
          uploadedDetails.push(uploaded);
        } else {
          uploadedDetails.push({
            url: img.uploadedUrl!,
            width: img.width,
            height: img.height,
          });
        }
      }

      // 4. 构建标签数据
      const tags: WalnutTag[] = [];

      if (sizeEdge || sizeBelly || sizeHeight) {
        tags.push({
          type: "size",
          value: {
            length: sizeEdge || "",
            width: sizeBelly || "",
            height: sizeHeight || "",
          },
        });
      }

      if (weight) {
        tags.push({ type: "weight", value: `${weight}g` });
      }

      if (playTimeValue) {
        tags.push({
          type: "play_time",
          value: `${playTimeValue}${playTimeUnit}`,
        });
      }

      if (color) {
        tags.push({ type: "color", value: color });
      }

      // 5. 调用 API 保存到数据库
      setSubmitProgress("正在保存数据...");

      const walnutData = {
        title,
        variety,
        ownerName,
        description,
        coverImage: uploadedCover,
        detailImages: uploadedDetails.length > 0 ? uploadedDetails : undefined,
        tags,
      };

      const url = isEditMode
        ? `/api/walnuts/${initialData!.id}`
        : "/api/walnuts";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(walnutData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "保存失败");
      }

      const result = await response.json();
      console.log("保存成功:", result.data);

      onSave(result.data);
    } catch (error) {
      console.error("上传失败:", error);
      toast.error(
        `上传失败: ${error instanceof Error ? error.message : "请检查网络连接"}`,
      );
    } finally {
      setIsSubmitting(false);
      setSubmitProgress("");
    }
  };

  // =============================================================================
  // 渲染
  // =============================================================================

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="bg-white/50 backdrop-blur-md border border-stone-200 rounded-sm p-6 sm:p-10 shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-serif font-bold text-ink">
              {isEditMode ? `修改藏品 · ${initialData?.title}` : "上传珍品"}
            </h2>
            {/* 开发模式：快速填充按钮 */}
            {DEV_MODE && (
              <button
                onClick={fillDevDefaults}
                className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition-colors"
                title="一键填充测试数据"
              >
                🧪 填充测试数据
              </button>
            )}
          </div>
          <button
            onClick={onCancel}
            className="text-stone-400 hover:text-stone-600"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* ============ 左侧：图片上传区 ============ */}
          <div className="space-y-6">
            {/* 封面图 */}
            <div className="space-y-2">
              <label className="block text-sm font-bold tracking-widest text-ink uppercase">
                封面主图 <span className="text-red-400">*</span>
              </label>
              <div
                onClick={() => !isSubmitting && fileInputRef.current?.click()}
                className={`
                  relative w-full aspect-3/4 rounded-sm border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all
                  ${coverImage ? "border-transparent" : "border-stone-300 hover:border-walnut bg-stone-50 hover:bg-stone-100"}
                  ${isSubmitting ? "pointer-events-none opacity-70" : ""}
                `}
              >
                {coverImage ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverImage.uploadedUrl || coverImage.preview}
                      alt="Cover"
                      className="w-full h-full object-cover rounded-sm"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-medium">
                      点击更换
                    </div>
                    {/* 尺寸标签 */}
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-sm backdrop-blur-md">
                      {coverImage.width} x {coverImage.height}
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                    <span className="text-stone-500 text-sm">点击上传封面</span>
                    <p className="text-stone-300 text-xs mt-2">建议比例 3:4</p>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleCoverChange}
                  accept="image/*"
                  className="hidden"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* 细节图 */}
            <div className="space-y-2">
              <label className="block text-sm font-bold tracking-widest text-ink uppercase">
                细节展示图
              </label>
              <div className="grid grid-cols-4 gap-2">
                {detailImages.map((img, idx) => (
                  <div key={idx} className="relative aspect-square group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.uploadedUrl || img.preview}
                      className="w-full h-full object-cover rounded-sm border border-stone-200"
                      alt={`Detail ${idx + 1}`}
                    />
                    {!isSubmitting && (
                      <button
                        onClick={() => removeDetailImage(idx)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  onClick={() =>
                    !isSubmitting && detailInputRef.current?.click()
                  }
                  className={`
                    aspect-square border border-dashed border-stone-300 rounded-sm flex items-center justify-center hover:bg-stone-50 text-stone-400 transition-colors
                    ${isSubmitting ? "pointer-events-none opacity-50" : ""}
                  `}
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* ============ 右侧：表单区 ============ */}
          <div className="space-y-6">
            {/* 标题 & 品种 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  雅集名称
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="如：跨界 · 映像"
                  className="w-full bg-stone-50 border border-stone-200 p-2 text-ink font-serif focus:outline-none focus:border-walnut focus:ring-1 focus:ring-walnut transition-all rounded-sm"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  品种分类
                </label>
                <select
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 p-2 text-ink font-serif focus:outline-none focus:border-walnut rounded-sm"
                  disabled={isSubmitting}
                >
                  {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 收藏者 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                收藏者 / 来源
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 p-2 text-ink text-sm focus:outline-none focus:border-walnut rounded-sm"
                disabled={isSubmitting}
              />
            </div>

            <hr className="border-stone-100" />

            {/* 三围尺寸 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-stone-500 mb-1">
                <Ruler className="w-4 h-4" />
                <label className="text-xs font-bold uppercase tracking-wider">
                  三围尺寸 (mm)
                </label>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    value={sizeEdge}
                    onChange={(e) => setSizeEdge(e.target.value)}
                    placeholder="边"
                    className="w-full text-center bg-stone-50 border border-stone-200 p-2 focus:border-walnut focus:outline-none rounded-sm"
                    disabled={isSubmitting}
                  />
                  <span className="block text-center text-[10px] text-stone-400 mt-1">
                    边 (长)
                  </span>
                </div>
                <span className="text-stone-300">-</span>
                <div className="flex-1">
                  <input
                    type="number"
                    value={sizeBelly}
                    onChange={(e) => setSizeBelly(e.target.value)}
                    placeholder="肚"
                    className="w-full text-center bg-stone-50 border border-stone-200 p-2 focus:border-walnut focus:outline-none rounded-sm"
                    disabled={isSubmitting}
                  />
                  <span className="block text-center text-[10px] text-stone-400 mt-1">
                    肚 (宽)
                  </span>
                </div>
                <span className="text-stone-300">-</span>
                <div className="flex-1">
                  <input
                    type="number"
                    value={sizeHeight}
                    onChange={(e) => setSizeHeight(e.target.value)}
                    placeholder="高"
                    className="w-full text-center bg-stone-50 border border-stone-200 p-2 focus:border-walnut focus:outline-none rounded-sm"
                    disabled={isSubmitting}
                  />
                  <span className="block text-center text-[10px] text-stone-400 mt-1">
                    高
                  </span>
                </div>
              </div>
            </div>

            {/* 克重 & 盘玩时间 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-stone-500 mb-1">
                  <Scale className="w-4 h-4" />
                  <label className="text-xs font-bold uppercase tracking-wider">
                    克重
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 p-2 pr-8 focus:border-walnut focus:outline-none rounded-sm"
                    disabled={isSubmitting}
                  />
                  <span className="absolute right-3 top-2 text-stone-400 text-sm">
                    g
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-stone-500 mb-1">
                  <span className="font-serif text-sm italic">T</span>
                  <label className="text-xs font-bold uppercase tracking-wider">
                    盘玩时间
                  </label>
                </div>
                <div className="flex">
                  <input
                    type="number"
                    value={playTimeValue}
                    onChange={(e) => setPlayTimeValue(e.target.value)}
                    className="w-2/3 bg-stone-50 border border-stone-200 p-2 rounded-l-sm focus:border-walnut focus:outline-none border-r-0"
                    disabled={isSubmitting}
                  />
                  <select
                    value={playTimeUnit}
                    onChange={(e) => setPlayTimeUnit(e.target.value)}
                    className="w-1/3 bg-stone-100 border border-stone-200 p-2 rounded-r-sm text-sm focus:border-walnut focus:outline-none"
                    disabled={isSubmitting}
                  >
                    <option value="个月">月</option>
                    <option value="年">年</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 皮质色调 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-stone-500 mb-1">
                <Palette className="w-4 h-4" />
                <label className="text-xs font-bold uppercase tracking-wider">
                  皮质色调
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {WALNUT_COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => !isSubmitting && setColor(c.id)}
                    className={`
                      px-3 py-1 text-xs rounded-full border transition-all
                      ${
                        color === c.id
                          ? "bg-ink text-white border-ink"
                          : "bg-white text-stone-500 border-stone-200 hover:border-stone-400"
                      }
                      ${isSubmitting ? "pointer-events-none opacity-50" : ""}
                    `}
                    disabled={isSubmitting}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-stone-100" />

            {/* 描述 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                背后的故事
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="描述这对核桃的独特之处..."
                className="w-full bg-stone-50 border border-stone-200 p-3 text-sm leading-relaxed text-ink focus:outline-none focus:border-walnut focus:ring-1 focus:ring-walnut rounded-sm resize-none"
                disabled={isSubmitting}
              />
            </div>

            {/* 提交按钮 */}
            <div className="pt-4 flex items-center justify-end gap-4">
              <button
                onClick={onCancel}
                className="px-6 py-2 text-stone-500 hover:text-ink text-sm tracking-widest transition-colors"
                disabled={isSubmitting}
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`
                  flex items-center gap-2 px-8 py-2 bg-ink text-white hover:bg-stone-800 transition-colors rounded-sm shadow-md hover:shadow-lg
                  ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}
                `}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="tracking-widest font-bold text-sm">
                      {submitProgress || "处理中..."}
                    </span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span className="tracking-widest font-bold text-sm">
                      {isEditMode ? "保存修改" : "发布入册"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
