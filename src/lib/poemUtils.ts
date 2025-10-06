import { Poem } from '@/types/poem';

const RTL_LANGUAGES = ['arabic', 'hebrew', 'urdu', 'persian', 'farsi'];

export function isRTLLanguage(filename: string): boolean {
  const lowerFilename = filename.toLowerCase();
  
  // Check if filename ends with -rtl.txt
  if (lowerFilename.includes('-rtl')) {
    return true;
  }
  
  // Check if language name is in RTL list
  return RTL_LANGUAGES.some(lang => lowerFilename.includes(lang));
}

export function extractLanguageFromFilename(filename: string): string {
  // Remove .txt extension
  const nameWithoutExt = filename.replace('.txt', '');
  
  // Replace hyphens with spaces and capitalize
  return nameWithoutExt
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function generatePoemId(filename: string): string {
  return filename.replace('.txt', '');
}

export function formatPoemTitle(content: string): string {
  // Extract first line as title
  const lines = content.trim().split('\n');
  return lines[0] || 'Untitled';
}
