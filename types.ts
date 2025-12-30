
export type Grade = '2' | '3' | '4' | '5';
export type EssayCategory = 'kể chuyện' | 'miêu tả' | 'tả người' | 'tả cảnh' | 'tả đồ vật' | 'viết thư' | 'kể việc tốt';
export type ParagraphCount = '1' | '3' | '5';

export interface UserProfile {
  grade: Grade;
  category: EssayCategory;
  length: ParagraphCount;
  topic: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export enum AppStep {
  SETUP = 'setup',
  WRITING = 'writing',
  SUMMARY = 'summary'
}
