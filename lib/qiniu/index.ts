/**
 * =============================================================================
 * 七牛云上传模块导出 (Qiniu Upload Module Exports)
 * =============================================================================
 *
 * 📌 统一导出，方便使用：
 *    import { uploadToQiniu, useQiniuUpload } from '@/lib/qiniu';
 *
 * =============================================================================
 */

// 核心上传函数和类型
export {
  uploadMultipleToQiniu,
  uploadToQiniu,
  type UploadNamingMode,
  type UploadOptions,
  type UploadResult,
} from "./qiniu-uploader";

// React Hook
export { useQiniuUpload, type UseQiniuUploadReturn } from "./use-qiniu-upload";
