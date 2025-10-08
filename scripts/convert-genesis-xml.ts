#!/usr/bin/env node
/**
 * Convert Genesis XML to JSON format for the app
 */

import { parseString } from 'xml2js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convertGenesisXMLToJSON() {
  console.log('🔄 Converting Genesis.xml to JSON...\n');

  const xmlPath = path.join(__dirname, '../data/Genesis.xml');
  const outputPath = path.join(__dirname, '../src/data/bible/hebrew/genesis.json');

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
        process.exit(1);
      }

      console.log('✅ XML parsed successfully');

      // Extract book metadata
      const bookData = result.Tanach.tanach.book;
      const bookNames = bookData.names;
      const chapters = Array.isArray(bookData.c) ? bookData.c : [bookData.c];

      console.log(`📖 Book: ${bookNames.name} (${bookNames.hebrewname})`);
      console.log(`📚 Chapters: ${chapters.length}`);

      // Convert to our JSON structure
      const verses: any[] = [];
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
          id: 'genesis',
          name: bookNames.hebrewname,
          nameEnglish: bookNames.name,
          testament: 'tanakh',
          order: parseInt(bookNames.number),
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
      console.log('\n🎉 Conversion complete!');
    });

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

convertGenesisXMLToJSON();
