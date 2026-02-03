/**
 * =============================================================================
 * 七牛云上传 React Hook (useQiniuUpload)
 * =============================================================================
 *
 * 📌 功能：
 *    提供 React 友好的上传接口，自动管理上传状态（进度、加载中、错误）
 *
 * 📌 使用示例：
 *    const { upload, progress, isUploading, error } = useQiniuUpload();
 *
 *    const handleUpload = async (file: File) => {
 *      try {
 *        const result = await upload(file, { folder: 'covers' });
 *        console.log('上传成功:', result.url);
 *      } catch (err) {
 *        console.error('上传失败');
 *      }
 *    };
 *
 * =============================================================================
 */

"use client";

import { useCallback, useState } from "react";
import { UploadOptions, UploadResult, uploadToQiniu } from "./qiniu-uploader";

/**
 * Hook 返回类型
 */
export interface UseQiniuUploadReturn {
  /** 执行上传函数 */
  upload: (
    file: File,
    options?: Omit<UploadOptions, "onProgress">,
  ) => Promise<UploadResult>;

  /** 当前上传进度 (0-100) */
  progress: number;

  /** 是否正在上传 */
  isUploading: boolean;

  /** 错误信息 (上传失败时有值) */
  error: string | null;

  /** 重置所有状态 */
  reset: () => void;
}

/**
 * 七牛云上传 Hook
 *
 * @returns UseQiniuUploadReturn
 *
 * @example
 * function MyComponent() {
 *   const { upload, progress, isUploading, error, reset } = useQiniuUpload();
 *
 *   const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
 *     const file = e.target.files?.[0];
 *     if (!file) return;
 *
 *     try {
 *       const result = await upload(file, {
 *         folder: 'walnuts/covers',
 *         namingMode: 'uuid'
 *       });
 *       console.log('CDN URL:', result.url);
 *     } catch (err) {
 *       // error 状态已自动更新
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <input type="file" onChange={handleFileChange} disabled={isUploading} />
 *       {isUploading && <div>上传中: {progress}%</div>}
 *       {error && <div className="text-red-500">{error}</div>}
 *     </div>
 *   );
 * }
 */
export function useQiniuUpload(): UseQiniuUploadReturn {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 重置所有状态
   */
  const reset = useCallback(() => {
    setProgress(0);
    setIsUploading(false);
    setError(null);
  }, []);

  /**
   * 执行上传
   */
  const upload = useCallback(
    async (
      file: File,
      options: Omit<UploadOptions, "onProgress"> = {},
    ): Promise<UploadResult> => {
      // 重置状态
      setProgress(0);
      setError(null);
      setIsUploading(true);

      try {
        const result = await uploadToQiniu(file, {
          ...options,
          onProgress: (percent) => setProgress(percent),
        });

        setProgress(100);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "上传失败";
        setError(message);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [],
  );

  return {
    upload,
    progress,
    isUploading,
    error,
    reset,
  };
}

export default useQiniuUpload;
