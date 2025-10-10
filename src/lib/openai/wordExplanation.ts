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

  return `You are a biblical scholar providing detailed linguistic analysis. Format your response with clear sections using the following structure:

Word: ${word}
Language: ${language}
Verse context: ${verseContext} – "${verse}"

Please provide a clear-cut response with these exact sections:

**Word**
[Show the word in its original script on one line, then the transliteration in parentheses on the line below it]

**Grammatical Parsing**
[Provide the grammatical analysis: part of speech, stem, tense/aspect, person/gender/number, etc.]
[Then explain WHY the word is parsed this way - what morphological features, prefixes, suffixes, vowel patterns, or word structure elements indicate this parsing?]

**English Translation(s)**
[List the closest English translation(s). If there are multiple interpretations/nuances, list them all]

**Extra-Biblical Usage**
[Explain how this word is used in extra-biblical sources (ancient inscriptions, famous writings, cognate languages) from the same historical context]

**First Biblical Occurrence**
[Cite the first verse in the Bible where this word appears, with the reference]

**Other Biblical Examples**
[Provide 2-3 other example verses where this word is used, with references]

Keep each section concise, informative, curious, rhythmically narrative. Use scholarly yet accessible language.`;
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
          content: 'You are a biblical Hebrew scholar specializing in linguistic analysis, grammar, and historical context. You provide detailed, structured explanations of biblical words with academic rigor.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 600, // Increased for detailed structured response
      temperature: TEMPERATURE,
    });

    const explanation = completion.choices[0]?.message?.content || 'No explanation available.';

    console.log('✅ OpenAI explanation received');

    // Format the explanation for better display
    const formattedExplanation = formatExplanation(explanation.trim());

    return {
      word: request.word,
      language: request.language,
      verse: request.verse,
      explanation: formattedExplanation,
      cached: false,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('❌ OpenAI API error:', error.message);
    throw new Error(`Failed to get word explanation: ${error.message}`);
  }
}

/**
 * Format the explanation for HTML display
 * Converts markdown-style formatting to HTML
 */
export function formatExplanation(text: string): string {
  return text
    // Bold section headers (**Text** -> <strong>Text</strong>)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Italic text (*Text* -> <em>Text</em>)
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Double line breaks to paragraph spacing
    .replace(/\n\n/g, '<br><br>')
    // Single line breaks to line breaks
    .replace(/\n/g, '<br>')
    // Preserve verse references in brackets [Book X:Y]
    .replace(/\[([^\]]+)\]/g, '<span class="text-amber-600 font-medium">[$1]</span>');
}
