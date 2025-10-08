/**
 * Hebrew text processing utilities
 */

/**
 * Hebrew Unicode ranges:
 * - Hebrew letters: U+05D0 to U+05EA
 * - Hebrew points (niqqud): U+05B0 to U+05BD, U+05BF to U+05C2, U+05C4 to U+05C7
 * - Cantillation marks (te'amim): U+0591 to U+05AF, U+05BD, U+05BF
 * - Other marks: Various
 */

/**
 * Remove cantillation marks (te'amim) from Hebrew text
 * These marks are used for Biblical chanting but can confuse TTS
 */
export function removeCantillationMarks(text: string): string {
  // Cantillation marks range
  const cantillationPattern = /[\u0591-\u05AF\u05BD\u05BF]/g;
  return text.replace(cantillationPattern, '');
}

/**
 * Remove all diacritical marks (niqqud + cantillation) from Hebrew text
 * Leaves only the base Hebrew letters
 */
export function removeAllDiacritics(text: string): string {
  // All Hebrew diacritical marks
  const diacriticsPattern = /[\u0591-\u05C7]/g;
  return text.replace(diacriticsPattern, '');
}

/**
 * Keep only letters and niqqud, remove cantillation marks
 * This preserves pronunciation aids while removing chanting marks
 */
export function prepareHebrewForTTS(text: string): string {
  // Remove cantillation marks but keep niqqud (vowel points)
  return removeCantillationMarks(text);
}

/**
 * Test if text contains cantillation marks
 */
export function hasCantillationMarks(text: string): boolean {
  const cantillationPattern = /[\u0591-\u05AF\u05BD\u05BF]/;
  return cantillationPattern.test(text);
}

/**
 * Test if text contains niqqud (vowel points)
 */
export function hasNiqqud(text: string): boolean {
  const niqqudPattern = /[\u05B0-\u05BC\u05C1-\u05C2\u05C4-\u05C7]/;
  return niqqudPattern.test(text);
}

/**
 * Get statistics about Hebrew text
 */
export function analyzeHebrewText(text: string) {
  return {
    totalChars: text.length,
    hasCantillation: hasCantillationMarks(text),
    hasNiqqud: hasNiqqud(text),
    withoutCantillation: removeCantillationMarks(text),
    withoutAllDiacritics: removeAllDiacritics(text),
  };
}
