import { Db, MongoClient } from "mongodb";

// DATABASE_URL 环境变量
const uri = process.env.DATABASE_URL;

if (!uri) {
  console.warn("警告: 未设置 DATABASE_URL 环境变量");
}

const options = {
  // 连接超时设置
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient> | null = null;

function createClientPromise(): Promise<MongoClient> {
  if (!uri) {
    throw new Error("请在环境变量中设置 DATABASE_URL");
  }

  if (process.env.NODE_ENV === "development") {
    // 开发环境下，使用全局变量避免重复连接
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect().catch((error) => {
        // 连接失败时清除 promise，允许重试
        globalWithMongo._mongoClientPromise = undefined;
        throw error;
      });
    }
    return globalWithMongo._mongoClientPromise;
  } else {
    // 生产环境
    client = new MongoClient(uri, options);
    return client.connect();
  }
}

export async function getDb(): Promise<Db> {
  try {
    if (!clientPromise) {
      clientPromise = createClientPromise();
    }
    const client = await clientPromise;
    // 从环境变量获取数据库名称，默认为 yourkid_db（匹配 docker-compose）
    const dbName = process.env.DATABASE_DB_NAME || "hetaozhi_db";
    return client.db(dbName);
  } catch (error) {
    // 连接失败时重置 promise，允许下次重试
    clientPromise = null;
    throw error;
  }
}

/**
 * 获取 MongoDB 集合的便捷方法
 * @param collectionName 集合名称
 * @returns 类型化的集合对象
 */
export async function getCollection<T extends import("mongodb").Document>(
  collectionName: string,
) {
  const db = await getDb();
  return db.collection<T>(collectionName);
}
