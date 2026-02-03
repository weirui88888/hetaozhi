export interface WalnutTag {
  label: string;
  value: string;
  type: 'size' | 'play_time' | 'weight' | 'color';
}

export interface Walnut {
  id: string;
  imageUrl: string; // The main cover image
  width?: number; // Image natural width (for masonry layout)
  height?: number; // Image natural height (for masonry layout)
  detailImages?: string[]; // Additional detail shots
  variety: string; // The category key
  title: string;
  ownerName: string;
  description: string;
  tags: WalnutTag[];
  likes: number; // Number of likes/appreciations
}

export interface Category {
  id: string;
  name: string;
  description: string;
}