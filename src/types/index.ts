export type TagGroup = "model" | "type" | "topic";

export interface Tag {
  id: string;
  label: string;
  group: TagGroup;
}

export interface PromptItem {
  id?: string;
  header: string;
  content: string;
  position: number;
}

export interface Prompt {
  id: string;
  title: string;
  items: PromptItem[];
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
