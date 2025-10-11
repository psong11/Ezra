#!/usr/bin/env node
/**
 * Convert Torah XML files (Genesis, Exodus, Leviticus, Numbers, Deuteronomy) to JSON format
 */

import { parseString } from 'xml2js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOOKS = [
  { xmlFile: 'Genesis.xml', bookId: 'genesis', order: 1 },
  { xmlFile: 'Exodus.xml', bookId: 'exodus', order: 2 },
  { xmlFile: 'Leviticus.xml', bookId: 'leviticus', order: 3 },
  { xmlFile: 'Numbers.xml', bookId: 'numbers', order: 4 },
  { xmlFile: 'Deuteronomy.xml', bookId: 'deuteronomy', order: 5 },
];

async function convertBookXMLToJSON(xmlFile: string, bookId: string, order: number) {
  console.log(`\n🔄 Converting ${xmlFile} to JSON...`);

  const xmlPath = path.join(__dirname, '../data', xmlFile);
  const outputPath = path.join(__dirname, '../src/data/bible/hebrew', `${bookId}.json`);

  try {
    // Read XML file
    const xmlContent = fs.readFileSync(xmlPath, 'utf-8');
    console.log('✅ XML file loaded');

    // Parse XML
    parseString(xmlContent, { 
      trim: true,
      explicitArray: false,
      mergeAttrs: true
    }, (err, result) => {
      if (err) {
        console.error('❌ Error parsing XML:', err);
        throw err;
      }

      console.log('✅ XML parsed successfully');

      // Extract book metadata
      const bookData = result.Tanach.tanach.book;
      const bookNames = bookData.names;
      const chapters = Array.isArray(bookData.c) ? bookData.c : [bookData.c];

      console.log(`📖 Book: ${bookNames.name} (${bookNames.hebrewname})`);
      console.log(`📚 Chapters: ${chapters.length}`);

      // Convert to our JSON structure
      let totalVerses = 0;

      const convertedChapters = chapters.map((chapter: any) => {
        const chapterNum = parseInt(chapter.n);
        const chapterVerses = Array.isArray(chapter.v) ? chapter.v : [chapter.v];

        const convertedVerses = chapterVerses.map((verse: any) => {
          const verseNum = parseInt(verse.n);
          totalVerses++;

          // Extract words and join them
          let words: string[] = [];
          if (verse.w) {
            words = Array.isArray(verse.w) ? verse.w : [verse.w];
          }
          
          const text = words.join(' ');

          return {
            verse: verseNum,
            text: text,
            words: words
          };
        });

        return {
          chapter: chapterNum,
          verses: convertedVerses
        };
      });

      // Create final JSON structure
      const jsonOutput = {
        book: {
          id: bookId,
          name: bookNames.hebrewname,
          nameEnglish: bookNames.name,
          testament: 'tanakh',
          order: order,
          totalChapters: chapters.length,
          totalVerses: totalVerses,
          language: 'he',
          abbreviation: bookNames.abbrev
        },
        chapters: convertedChapters
      };

      console.log(`📝 Total verses: ${totalVerses}`);

      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log('✅ Created output directory');
      }

      // Write JSON file
      fs.writeFileSync(
        outputPath,
        JSON.stringify(jsonOutput, null, 2),
        'utf-8'
      );

      console.log(`✅ JSON file created: ${outputPath}`);
    });

  } catch (error) {
    console.error(`❌ Error processing ${xmlFile}:`, error);
    throw error;
  }
}

async function convertAllBooks() {
  console.log('🚀 Starting Torah XML to JSON conversion...\n');
  console.log('📚 Converting 5 books of the Torah\n');

  for (const book of BOOKS) {
    await convertBookXMLToJSON(book.xmlFile, book.bookId, book.order);
  }

  console.log('\n✨ All conversions complete!');
  console.log('\n📊 Summary:');
  console.log(`   - Converted ${BOOKS.length} books`);
  console.log('   - Genesis (בראשית)');
  console.log('   - Exodus (שמות)');
  console.log('   - Leviticus (ויקרא)');
  console.log('   - Numbers (במדבר)');
  console.log('   - Deuteronomy (דברים)');
}

convertAllBooks().catch(error => {
  console.error('\n❌ Conversion failed:', error);
  process.exit(1);
});
