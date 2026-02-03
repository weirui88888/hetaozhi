/**
 * =============================================================================
 * 核桃 API 路由 - 详情 & 操作 (Walnuts API - Detail & Operations)
 * =============================================================================
 *
 * GET    /api/walnuts/[id]    获取单个核桃详情
 * PUT    /api/walnuts/[id]    更新核桃完整数据
 * DELETE /api/walnuts/[id]    删除核桃
 * PATCH  /api/walnuts/[id]    更新点赞数
 *
 * =============================================================================
 */

import { walnutService } from "@/lib/services/walnut.service";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// =============================================================================
// GET - 获取单个核桃详情
// =============================================================================

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const walnut = await walnutService.findById(id);

    if (!walnut) {
      return NextResponse.json({ error: "核桃不存在" }, { status: 404 });
    }

    return NextResponse.json({ data: walnut });
  } catch (error) {
    console.error("[API] 获取核桃详情失败:", error);
    return NextResponse.json({ error: "获取数据失败" }, { status: 500 });
  }
}

// =============================================================================
// DELETE - 删除核桃
// =============================================================================

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const success = await walnutService.delete(id);

    if (!success) {
      return NextResponse.json(
        { error: "核桃不存在或删除失败" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    console.error("[API] 删除核桃失败:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}

// =============================================================================
// PUT - 更新核桃完整数据
// =============================================================================

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 调用服务更新数据
    const updatedWalnut = await walnutService.update(id, {
      title: body.title,
      variety: body.variety,
      ownerName: body.ownerName,
      description: body.description,
      coverImage: body.coverImage,
      detailImages: body.detailImages,
      tags: body.tags,
      likes: body.likes,
    });

    if (!updatedWalnut) {
      return NextResponse.json(
        { error: "核桃不存在或更新失败" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: updatedWalnut, message: "更新成功" });
  } catch (error) {
    console.error("[API] 更新核桃失败:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

// =============================================================================
// PATCH - 更新点赞数
// =============================================================================

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 支持点赞增量更新
    if (typeof body.likesIncrement === "number") {
      const success = await walnutService.updateLikes(id, body.likesIncrement);

      if (!success) {
        return NextResponse.json({ error: "更新失败" }, { status: 404 });
      }

      return NextResponse.json({ message: "更新成功" });
    }

    return NextResponse.json({ error: "无效的请求参数" }, { status: 400 });
  } catch (error) {
    console.error("[API] 更新核桃失败:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}
