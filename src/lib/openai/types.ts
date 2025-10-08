/**
 * OpenAI Word Explanation Types
 */

export interface WordExplanationRequest {
  word: string;
  language: string;
  verse: string;
  bookName?: string;
  chapterNum?: number;
  verseNum?: number;
}

export interface WordExplanationResponse {
  word: string;
  language: string;
  verse: string;
  explanation: string;
  cached?: boolean;
  timestamp?: string;
}

export interface ParsedExplanation {
  coreMeaning: string;
  context: string;
  nuance: string;
}
