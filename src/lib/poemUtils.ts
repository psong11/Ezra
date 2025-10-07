import { Poem } from '@/types/poem';

const RTL_LANGUAGES = ['arabic', 'hebrew', 'urdu', 'persian', 'farsi'];

/**
 * Map filename-based language IDs to Google TTS language codes
 */
const LANGUAGE_CODE_MAP: Record<string, string> = {
  'arabic': 'ar-SA',
  'chinese': 'zh-CN',
  'czech': 'cs-CZ',
  'danish': 'da-DK',
  'english': 'en-US',
  'english-australia': 'en-AU',
  'french': 'fr-FR',
  'german': 'de-DE',
  'greek': 'el-GR',
  'hebrew': 'he-IL',
  'hindi': 'hi-IN',
  'hungarian': 'hu-HU',
  'indonesian': 'id-ID',
  'italian': 'it-IT',
  'japanese': 'ja-JP',
  'korean': 'ko-KR',
  'norwegian': 'nb-NO',
  'polish': 'pl-PL',
  'portuguese': 'pt-PT',
  'romanian': 'ro-RO',
  'russian': 'ru-RU',
  'serbian': 'sr-RS',
  'slovenian': 'sl-SI',
  'spanish': 'es-ES',
  'spanish-andes': 'es-CO',
  'swahili': 'sw-KE',
  'swedish': 'sv-SE',
  'tagalog': 'tl-PH',
  'thai': 'th-TH',
  'turkish': 'tr-TR',
  'ukrainian': 'uk-UA',
  'urdu': 'ur-PK',
  'vietnamese': 'vi-VN',
};

/**
 * Convert poem ID to proper Google TTS language code
 */
export function getLanguageCodeFromPoemId(poemId: string): string {
  // Remove -rtl suffix if present
  const cleanId = poemId.replace('-rtl', '');
  return LANGUAGE_CODE_MAP[cleanId] || 'en-US';
}

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
