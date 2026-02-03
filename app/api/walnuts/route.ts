/**
 * =============================================================================
 * 核桃 API 路由 - 列表 & 创建 (Walnuts API - List & Create)
 * =============================================================================
 *
 * GET  /api/walnuts          获取核桃列表
 * POST /api/walnuts          创建新核桃
 *
 * 查询参数：
 *   ?variety=lion_head       按品种筛选
 *   ?limit=20                限制返回数量
 *   ?skip=0                  分页偏移
 *
 * =============================================================================
 */

import {
  CreateWalnutInput,
  walnutService,
} from "@/lib/services/walnut.service";
import { NextRequest, NextResponse } from "next/server";

// =============================================================================
// GET - 获取核桃列表
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const variety = searchParams.get("variety") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = parseInt(searchParams.get("skip") || "0");

    // 查询数据
    const walnuts = await walnutService.findAll({ variety, limit, skip });
    const total = await walnutService.count(variety);

    return NextResponse.json({
      data: walnuts,
      total,
      limit,
      skip,
    });
  } catch (error) {
    console.error("[API] 获取核桃列表失败:", error);
    return NextResponse.json(
      { error: "获取数据失败，请稍后重试" },
      { status: 500 },
    );
  }
}

// =============================================================================
// POST - 创建新核桃
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();

    // 基础校验
    if (!body.title || !body.coverImage) {
      return NextResponse.json(
        { error: "标题和封面图不能为空" },
        { status: 400 },
      );
    }

    // 构建输入数据
    const input: CreateWalnutInput = {
      title: body.title,
      variety: body.variety || "other",
      ownerName: body.ownerName || "佚名",
      description: body.description || "",
      coverImage: body.coverImage,
      detailImages: body.detailImages || [],
      tags: body.tags || [],
      likes: 0,
    };

    // 创建核桃
    const walnut = await walnutService.create(input);

    return NextResponse.json({ data: walnut }, { status: 201 });
  } catch (error) {
    console.error("[API] 创建核桃失败:", error);
    return NextResponse.json(
      { error: "创建失败，请稍后重试" },
      { status: 500 },
    );
  }
}
