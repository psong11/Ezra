import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Poem } from '@/types/poem';
import { isRTLLanguage, extractLanguageFromFilename, generatePoemId, formatPoemTitle } from '@/lib/poemUtils';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const dataDirectory = path.join(process.cwd(), 'data');
    const filename = `${id}.txt`;
    const filePath = path.join(dataDirectory, filename);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Poem not found' },
        { status: 404 }
      );
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const language = extractLanguageFromFilename(filename);
    const isRTL = isRTLLanguage(filename);
    const title = formatPoemTitle(content);
    
    const poem: Poem = {
      id,
      title,
      content,
      language,
      isRTL,
    };
    
    return NextResponse.json(poem);
  } catch (error) {
    console.error('Error reading poem:', error);
    return NextResponse.json(
      { error: 'Failed to load poem' },
      { status: 500 }
    );
  }
}
