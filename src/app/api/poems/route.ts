import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Poem } from '@/types/poem';
import { isRTLLanguage, extractLanguageFromFilename, generatePoemId, formatPoemTitle } from '@/lib/poemUtils';

export async function GET() {
  try {
    const dataDirectory = path.join(process.cwd(), 'data');
    const filenames = fs.readdirSync(dataDirectory);
    
    const poems: Poem[] = filenames
      .filter(filename => filename.endsWith('.txt'))
      .map(filename => {
        const filePath = path.join(dataDirectory, filename);
        const content = fs.readFileSync(filePath, 'utf8');
        const id = generatePoemId(filename);
        const language = extractLanguageFromFilename(filename);
        const isRTL = isRTLLanguage(filename);
        const title = formatPoemTitle(content);
        
        return {
          id,
          title,
          content,
          language,
          isRTL,
        };
      })
      .sort((a, b) => a.language.localeCompare(b.language));
    
    return NextResponse.json(poems);
  } catch (error) {
    console.error('Error reading poems:', error);
    return NextResponse.json(
      { error: 'Failed to load poems' },
      { status: 500 }
    );
  }
}
