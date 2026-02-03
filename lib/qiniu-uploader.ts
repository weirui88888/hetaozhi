/**
 * =============================================================================
 * 七牛云图片上传工具 (Qiniu Image Uploader)
 * =============================================================================
 *
 * 📌 功能：
 *    封装七牛云前端直传逻辑，支持：
 *    1. 自动获取上传凭证 (Token)
 *    2. 上传进度回调
 *    3. 两种文件命名模式：UUID 前缀 / 保留原名
 *    4. 自动拼接完整的 CDN 访问 URL
 *
 * 📌 使用示例：
 *    import { uploadToQiniu, UploadNamingMode } from '@/lib/qiniu-uploader';
 *
 *    // 使用 UUID 命名（推荐，避免重名覆盖）
 *    const result = await uploadToQiniu(file, {
 *      namingMode: 'uuid',
 *      folder: 'walnuts/covers',  // 可选，指定存储目录
 *      onProgress: (percent) => console.log(`上传进度: ${percent}%`),
 *    });
 *
 *    // 使用原始文件名
 *    const result = await uploadToQiniu(file, {
 *      namingMode: 'original',
 *      folder: 'walnuts/details',
 *    });
 *
 *    console.log(result.url);  // 完整的 CDN 访问地址
 *    console.log(result.key);  // 七牛云中的文件 Key
 *
 * =============================================================================
 */

import * as qiniu from "qiniu-js";

// =============================================================================
// 类型定义
// =============================================================================

/**
 * 文件命名模式
 * - 'uuid': 使用 UUID 作为文件名前缀，避免重名覆盖（推荐）
 * - 'original': 保留用户上传的原始文件名
 */
export type UploadNamingMode = "uuid" | "original";

/**
 * 上传配置选项
 */
export interface UploadOptions {
  /** 文件命名模式，默认 'uuid' */
  namingMode?: UploadNamingMode;

  /**
   * 存储目录/文件夹路径
   * 例如: 'walnuts/covers' 会将文件存储为 'walnuts/covers/xxx.jpg'
   * 不要以斜杠开头或结尾
   */
  folder?: string;

  /** 上传进度回调函数，percent 范围 0-100 */
  onProgress?: (percent: number) => void;

  /** 自定义文件名（仅当 namingMode 为 'original' 时生效） */
  customFileName?: string;
}

/**
 * 上传结果
 */
export interface UploadResult {
  /** 完整的 CDN 访问 URL */
  url: string;

  /** 七牛云中的文件 Key (相对路径) */
  key: string;

  /** 文件大小 (字节) */
  size: number;

  /** 文件 MIME 类型 */
  mimeType: string;
}

/**
 * Token 响应结构
 */
interface TokenResponse {
  token: string;
  domain: string;
  bucket: string;
  expires: number;
}

// =============================================================================
// Token 缓存（避免频繁请求服务端）
// =============================================================================

let cachedToken: string | null = null;
let cachedDomain: string | null = null;
let tokenExpireTime: number = 0;

/**
 * 获取上传凭证（带缓存机制）
 * Token 会在过期前 5 分钟自动刷新
 */
async function getUploadToken(): Promise<{ token: string; domain: string }> {
  const now = Date.now();
  const bufferTime = 5 * 60 * 1000; // 提前 5 分钟刷新

  // 如果缓存有效，直接返回
  if (cachedToken && cachedDomain && now < tokenExpireTime - bufferTime) {
    return { token: cachedToken, domain: cachedDomain };
  }

  // 从服务端获取新 Token
  const response = await fetch("/api/qiniu/token");

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "获取上传凭证失败");
  }

  const data: TokenResponse = await response.json();

  // 更新缓存
  cachedToken = data.token;
  cachedDomain = data.domain;
  tokenExpireTime = now + data.expires * 1000;

  return { token: data.token, domain: data.domain };
}

// =============================================================================
// 辅助函数
// =============================================================================

/**
 * 生成 UUID v4
 */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 获取文件扩展名
 */
function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".");
  return lastDot !== -1 ? fileName.slice(lastDot).toLowerCase() : "";
}

/**
 * 生成七牛云文件 Key
 */
function generateFileKey(file: File, options: UploadOptions): string {
  const { namingMode = "uuid", folder, customFileName } = options;

  let fileName: string;

  if (namingMode === "uuid") {
    // UUID 模式：使用 UUID 作为文件名
    const ext = getFileExtension(file.name);
    fileName = `${generateUUID()}${ext}`;
  } else {
    // 原始模式：使用原始文件名或自定义文件名
    fileName = customFileName || file.name;
    // 移除可能导致问题的特殊字符
    fileName = fileName.replace(/[^\w\u4e00-\u9fa5.-]/g, "_");
  }

  // 拼接目录路径
  if (folder) {
    // 确保目录路径格式正确
    const cleanFolder = folder.replace(/^\/|\/$/g, "");
    return `${cleanFolder}/${fileName}`;
  }

  return fileName;
}

// =============================================================================
// 核心上传函数
// =============================================================================

/**
 * 上传文件到七牛云
 *
 * @param file - 要上传的文件对象
 * @param options - 上传配置选项
 * @returns Promise<UploadResult> - 上传结果
 *
 * @example
 * // 基础用法
 * const result = await uploadToQiniu(file);
 *
 * @example
 * // 带进度回调
 * const result = await uploadToQiniu(file, {
 *   folder: 'images',
 *   onProgress: (p) => setProgress(p),
 * });
 */
export async function uploadToQiniu(
  file: File,
  options: UploadOptions = {},
): Promise<UploadResult> {
  // 1. 获取上传凭证
  const { token, domain } = await getUploadToken();

  // 2. 生成文件 Key
  const key = generateFileKey(file, options);

  // 3. 配置七牛 SDK
  const config: qiniu.Config = {
    useCdnDomain: true, // 使用 CDN 加速域名
    disableStatisticsReport: true, // 关闭统计上报
    retryCount: 3, // 重试次数
  };

  const putExtra: Partial<qiniu.Extra> = {
    fname: file.name, // 原始文件名（仅作记录）
    mimeType: file.type || undefined, // 文件类型
  };

  // 4. 执行上传
  return new Promise((resolve, reject) => {
    const observable = qiniu.upload(file, key, token, putExtra, config);

    observable.subscribe({
      // 上传进度
      next(res) {
        if (options.onProgress) {
          const percent = Math.round(res.total.percent);
          options.onProgress(percent);
        }
      },

      // 上传失败
      error(err) {
        console.error("[Qiniu Upload] 上传失败:", err);
        reject(new Error(err.message || "图片上传失败，请重试"));
      },

      // 上传成功
      complete(res) {
        // 确保域名格式正确
        const cleanDomain = domain.replace(/\/$/, "");

        resolve({
          url: `${cleanDomain}/${res.key}`,
          key: res.key,
          size: file.size,
          mimeType: file.type,
        });
      },
    });
  });
}

// =============================================================================
// 批量上传工具
// =============================================================================

/**
 * 批量上传多个文件
 *
 * @param files - 文件数组
 * @param options - 上传配置（应用到所有文件）
 * @param onFileProgress - 单个文件进度回调 (fileIndex, percent)
 * @returns Promise<UploadResult[]> - 所有文件的上传结果
 *
 * @example
 * const results = await uploadMultipleToQiniu(
 *   [file1, file2, file3],
 *   { folder: 'batch' },
 *   (index, percent) => console.log(`文件 ${index}: ${percent}%`)
 * );
 */
export async function uploadMultipleToQiniu(
  files: File[],
  options: Omit<UploadOptions, "onProgress"> = {},
  onFileProgress?: (fileIndex: number, percent: number) => void,
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const result = await uploadToQiniu(files[i], {
      ...options,
      onProgress: onFileProgress
        ? (percent) => onFileProgress(i, percent)
        : undefined,
    });
    results.push(result);
  }

  return results;
}

// =============================================================================
// React Hook (可选，方便在组件中使用)
// =============================================================================

/**
 * 上传状态 Hook 的返回类型
 */
export interface UseUploadReturn {
  /** 执行上传 */
  upload: (file: File, options?: UploadOptions) => Promise<UploadResult>;

  /** 当前上传进度 (0-100) */
  progress: number;

  /** 是否正在上传 */
  isUploading: boolean;

  /** 错误信息 */
  error: string | null;

  /** 重置状态 */
  reset: () => void;
}
