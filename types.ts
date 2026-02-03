export interface ImageAsset {
  url: string;
  width: number;
  height: number;
}

export interface SizeValue {
  length: string; // 边
  width: string; // 肚
  height: string; // 高
}

export type WalnutTag =
  | { type: "size"; value: SizeValue }
  | { type: "play_time" | "weight" | "color"; value: string };

export interface Walnut {
  id: string;
  coverImage: ImageAsset;
  detailImages?: ImageAsset[];
  variety: string;
  title: string;
  ownerName: string;
  description: string;
  tags: WalnutTag[];
  likes: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}
