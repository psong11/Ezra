/**
 * Word Explanation Prompt Generation and Logic
 */

import { getOpenAIClient, OPENAI_MODEL, MAX_TOKENS, TEMPERATURE } from './client';
import { WordExplanationRequest, WordExplanationResponse } from './types';

/**
 * Generate the biblical language guide prompt
 */
export function generateWordExplanationPrompt(request: WordExplanationRequest): string {
  const { word, language, verse, bookName, chapterNum, verseNum } = request;
  
  const verseContext = bookName && chapterNum && verseNum
    ? `${bookName} ${chapterNum}:${verseNum}`
    : 'Biblical text';

  return `You are a biblical language guide explaining words in a natural, intuitive, and inspiring way.

Word: ${word}
Language: ${language}
Verse context: ${verseContext} – "${verse}"

Your task:
1. Explain what the word "${word}" literally means and how it works grammatically in the sentence.
2. Describe it intuitively — what image, sound, or feeling it might evoke for a child first learning the word.
3. Mention what kinds of words it's usually associated with (e.g., other nouns, animals, actions, symbols).
4. If relevant, mention one or two meaningful connections to other Bible verses that use the same or similar words"

Keep the total under 120 words, warm in tone, slightly academic. Make it feel natural and inspiring.`;
}

/**
 * Call OpenAI API to get word explanation
 */
export async function getWordExplanation(
  request: WordExplanationRequest
): Promise<WordExplanationResponse> {
  const client = getOpenAIClient();
  const prompt = generateWordExplanationPrompt(request);

  console.log('🤖 Requesting word explanation from OpenAI...');
  console.log(`   Word: "${request.word}" (${request.language})`);

  try {
    const completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a biblical language guide who explains Hebrew, Greek, or any other ancient language words in a way that feels natural, intuitive, and inspiring',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 180, // Increased for 120 words (~150 tokens)
      temperature: TEMPERATURE,
    });

    const explanation = completion.choices[0]?.message?.content || 'No explanation available.';

    console.log('✅ OpenAI explanation received');

    return {
      word: request.word,
      language: request.language,
      verse: request.verse,
      explanation: explanation.trim(),
      cached: false,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('❌ OpenAI API error:', error.message);
    throw new Error(`Failed to get word explanation: ${error.message}`);
  }
}

/**
 * Parse explanation into structured sections (optional helper)
 */
export function parseExplanation(explanation: string) {
  const sections = {
    coreMeaning: '',
    context: '',
    nuance: '',
  };

  // Simple parsing - could be enhanced
  const coreMatch = explanation.match(/1\.\s*CORE MEANING:(.*?)(?=2\.|$)/s);
  const contextMatch = explanation.match(/2\.\s*CONTEXT:(.*?)(?=3\.|$)/s);
  const nuanceMatch = explanation.match(/3\.\s*NUANCE:(.*?)$/s);

  if (coreMatch) sections.coreMeaning = coreMatch[1].trim();
  if (contextMatch) sections.context = contextMatch[1].trim();
  if (nuanceMatch) sections.nuance = nuanceMatch[1].trim();

  return sections;
}
