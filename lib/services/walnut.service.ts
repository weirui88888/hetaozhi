/**
 * =============================================================================
 * 核桃数据服务 (Walnut Data Service)
 * =============================================================================
 *
 * 📌 功能：
 *    封装所有与核桃数据相关的数据库操作
 *    - 创建、查询、更新、删除 (CRUD)
 *    - 分页、筛选
 *
 * 📌 使用方式：
 *    import { walnutService } from '@/lib/services/walnut.service';
 *    const walnuts = await walnutService.findAll();
 *
 * =============================================================================
 */

import { ImageAsset, Walnut, WalnutTag } from "@/types";
import { Document, ObjectId, WithId } from "mongodb";
import { getCollection } from "../db";

// =============================================================================
// 类型定义
// =============================================================================

/**
 * MongoDB 中存储的核桃文档结构
 * 使用 MongoDB 的 _id 而不是自定义 id
 */
interface WalnutDocument extends Document {
  title: string;
  variety: string;
  ownerName: string;
  description: string;
  coverImage: ImageAsset;
  detailImages?: ImageAsset[];
  tags: WalnutTag[];
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 创建核桃的输入参数（不包含 id 和时间戳）
 */
export type CreateWalnutInput = Omit<Walnut, "id">;

/**
 * 查询参数
 */
export interface FindWalnutsParams {
  variety?: string; // 按品种筛选
  limit?: number; // 限制数量
  skip?: number; // 跳过数量（分页）
  sort?: "default" | "likes"; // 排序方式
}

// =============================================================================
// 集合名称常量
// =============================================================================

const COLLECTION_NAME = "walnuts";

// =============================================================================
// 辅助函数
// =============================================================================

/**
 * 将 MongoDB 文档转换为前端使用的 Walnut 对象
 */
function toWalnut(doc: WithId<WalnutDocument>): Walnut {
  return {
    id: doc._id.toString(),
    title: doc.title,
    variety: doc.variety,
    ownerName: doc.ownerName,
    description: doc.description,
    coverImage: doc.coverImage,
    detailImages: doc.detailImages,
    tags: doc.tags,
    likes: doc.likes,
  };
}

// =============================================================================
// 数据服务
// =============================================================================

export const walnutService = {
  /**
   * 获取核桃列表
   * @param params 查询参数（可选筛选条件）
   * @returns 核桃数组
   */
  async findAll(params: FindWalnutsParams = {}): Promise<Walnut[]> {
    const { variety, limit = 50, skip = 0, sort = "default" } = params;

    const collection = await getCollection<WalnutDocument>(COLLECTION_NAME);

    // 构建查询条件
    const filter: Record<string, unknown> = {};
    if (variety && variety !== "all") {
      filter.variety = variety;
    }

    // 根据排序参数选择排序方式
    const sortOptions: Record<string, 1 | -1> =
      sort === "likes" ? { likes: -1, createdAt: -1 } : { createdAt: -1 };

    // 执行查询
    const docs = await collection
      .find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .toArray();

    return docs.map(toWalnut);
  },

  /**
   * 根据 ID 获取单个核桃
   * @param id 核桃 ID
   * @returns 核桃对象或 null
   */
  async findById(id: string): Promise<Walnut | null> {
    // 验证 ID 格式
    if (!ObjectId.isValid(id)) {
      return null;
    }

    const collection = await getCollection<WalnutDocument>(COLLECTION_NAME);
    const doc = await collection.findOne({ _id: new ObjectId(id) });

    return doc ? toWalnut(doc) : null;
  },

  /**
   * 创建新核桃
   * @param input 核桃数据（不含 id）
   * @returns 创建的核桃对象（含 id）
   */
  async create(input: CreateWalnutInput): Promise<Walnut> {
    const collection = await getCollection<WalnutDocument>(COLLECTION_NAME);

    const now = new Date();
    const doc: Omit<WalnutDocument, "_id"> = {
      title: input.title,
      variety: input.variety,
      ownerName: input.ownerName,
      description: input.description,
      coverImage: input.coverImage,
      detailImages: input.detailImages,
      tags: input.tags,
      likes: input.likes ?? 0,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(doc as WalnutDocument);

    return {
      id: result.insertedId.toString(),
      ...input,
      likes: input.likes ?? 0,
    };
  },

  /**
   * 更新核桃数据
   * @param id 核桃 ID
   * @param input 要更新的字段
   * @returns 更新后的核桃对象或 null
   */
  async update(
    id: string,
    input: Partial<CreateWalnutInput>,
  ): Promise<Walnut | null> {
    if (!ObjectId.isValid(id)) {
      return null;
    }

    const collection = await getCollection<WalnutDocument>(COLLECTION_NAME);

    // 构建更新对象，只包含有值的字段
    const updateFields: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (input.title !== undefined) updateFields.title = input.title;
    if (input.variety !== undefined) updateFields.variety = input.variety;
    if (input.ownerName !== undefined) updateFields.ownerName = input.ownerName;
    if (input.description !== undefined)
      updateFields.description = input.description;
    if (input.coverImage !== undefined)
      updateFields.coverImage = input.coverImage;
    if (input.detailImages !== undefined)
      updateFields.detailImages = input.detailImages;
    if (input.tags !== undefined) updateFields.tags = input.tags;
    if (input.likes !== undefined) updateFields.likes = input.likes;

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateFields },
      { returnDocument: "after" },
    );

    return result ? toWalnut(result) : null;
  },

  /**
   * 更新核桃点赞数
   * @param id 核桃 ID
   * @param increment 增量（正数点赞，负数取消）
   * @returns 是否成功
   */
  async updateLikes(id: string, increment: number): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      return false;
    }

    const collection = await getCollection<WalnutDocument>(COLLECTION_NAME);
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $inc: { likes: increment },
        $set: { updatedAt: new Date() },
      },
    );

    return result.modifiedCount > 0;
  },

  /**
   * 删除核桃
   * @param id 核桃 ID
   * @returns 是否成功
   */
  async delete(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      return false;
    }

    const collection = await getCollection<WalnutDocument>(COLLECTION_NAME);
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    return result.deletedCount > 0;
  },

  /**
   * 获取核桃总数
   * @param variety 可选品种筛选
   * @returns 数量
   */
  async count(variety?: string): Promise<number> {
    const collection = await getCollection<WalnutDocument>(COLLECTION_NAME);

    const filter: Record<string, unknown> = {};
    if (variety && variety !== "all") {
      filter.variety = variety;
    }

    return collection.countDocuments(filter);
  },
};
