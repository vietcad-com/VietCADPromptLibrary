export type TagGroup = "model" | "type" | "topic";

export interface Tag {
  id: string;
  label: string;
  group: TagGroup;
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  note?: string;
  tags: Tag[];
  author: string;
  createdAt: string;
}

export interface TagPool {
  model: Tag[];
  type: Tag[];
  topic: Tag[];
}
