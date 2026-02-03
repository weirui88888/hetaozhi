/**
 * =============================================================================
 * 七牛云上传 Token 生成 API (Qiniu Upload Token Generation API)
 * =============================================================================
 *
 * 📌 作用：
 *    前端直传需要一个"上传凭证 (Upload Token)"来授权操作。
 *    由于生成 Token 需要用到 Secret Key，而 SK 绝对不能暴露给前端，
 *    因此我们通过这个服务端 API 来安全地生成 Token。
 *
 * 📌 调用方式：
 *    GET /api/qiniu/token
 *    返回: { token: "xxx", domain: "http://xxx.clouddn.com" }
 *
 * 📌 Token 有效期：
 *    默认 1 小时 (3600 秒)，可通过环境变量配置
 *
 * =============================================================================
 */

import crypto from "crypto";
import { NextResponse } from "next/server";

// =============================================================================
// 辅助函数：Base64 URL 安全编码 (七牛云要求)
// =============================================================================
function base64UrlSafe(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

// =============================================================================
// 辅助函数：HMAC-SHA1 签名
// =============================================================================
function hmacSha1(key: string, data: string): string {
  return crypto.createHmac("sha1", key).update(data).digest("base64");
}

// =============================================================================
// 辅助函数：生成上传凭证 (Upload Token)
// =============================================================================
function generateUploadToken(
  accessKey: string,
  secretKey: string,
  bucket: string,
  expiresIn: number = 3600,
): string {
  // 上传策略 (Put Policy)
  const putPolicy = {
    scope: bucket, // 目标空间
    deadline: Math.floor(Date.now() / 1000) + expiresIn, // 过期时间戳
  };

  // 将策略 JSON 转为 Base64 URL Safe
  const encodedPolicy = base64UrlSafe(JSON.stringify(putPolicy));

  // 使用 SecretKey 对策略进行 HMAC-SHA1 签名
  const sign = hmacSha1(secretKey, encodedPolicy);

  // 将签名转为 Base64 URL Safe
  const encodedSign = sign.replace(/\+/g, "-").replace(/\//g, "_");

  // 拼接最终的 Upload Token
  return `${accessKey}:${encodedSign}:${encodedPolicy}`;
}

// =============================================================================
// API 路由处理函数
// =============================================================================
export async function GET() {
  try {
    // 从环境变量读取配置
    const accessKey = process.env.QINIU_ACCESS_KEY;
    const secretKey = process.env.QINIU_SECRET_KEY;
    const bucket = process.env.QINIU_BUCKET;
    const domain = process.env.QINIU_CDN_DOMAIN;

    // 校验必要的环境变量
    if (!accessKey || !secretKey || !bucket || !domain) {
      console.error("[Qiniu API] 环境变量配置不完整，请检查 .env.local 文件");
      return NextResponse.json(
        { error: "服务器配置错误，请联系管理员" },
        { status: 500 },
      );
    }

    // 生成上传凭证 (有效期 1 小时)
    const token = generateUploadToken(accessKey, secretKey, bucket, 3600);

    // 返回 Token 和 CDN 域名
    return NextResponse.json({
      token,
      domain,
      bucket,
      expires: 3600, // 告知前端 Token 有效期，方便前端缓存
    });
  } catch (error) {
    console.error("[Qiniu API] 生成 Token 失败:", error);
    return NextResponse.json({ error: "生成上传凭证失败" }, { status: 500 });
  }
}
