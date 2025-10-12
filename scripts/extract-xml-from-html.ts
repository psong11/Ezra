/**
 * Extract XML content from GitHub HTML files
 * 
 * The .xml.html files downloaded from GitHub contain the XML content
 * embedded in JSON format within the HTML. This script extracts it.
 */

import * as fs from 'fs';
import * as path from 'path';

interface FileMapping {
  htmlFile: string;
  xmlFile: string;
  bookName: string;
}

const NT_BOOKS: FileMapping[] = [
  // Gospels
  { htmlFile: 'Mark.xml.html', xmlFile: 'Mark.xml', bookName: 'Mark' },
  { htmlFile: 'Luke.xml.html', xmlFile: 'Luke.xml', bookName: 'Luke' },
  { htmlFile: 'John.xml.html', xmlFile: 'John.xml', bookName: 'John' },
  
  // Acts
  { htmlFile: 'Acts.xml.html', xmlFile: 'Acts.xml', bookName: 'Acts' },
  
  // Paul's Letters
  { htmlFile: 'Rom.xml.html', xmlFile: 'Rom.xml', bookName: 'Romans' },
  { htmlFile: '1Cor.xml.html', xmlFile: '1Cor.xml', bookName: '1 Corinthians' },
  { htmlFile: '2Cor.xml.html', xmlFile: '2Cor.xml', bookName: '2 Corinthians' },
  { htmlFile: 'Gal.xml.html', xmlFile: 'Gal.xml', bookName: 'Galatians' },
  { htmlFile: 'Eph.xml.html', xmlFile: 'Eph.xml', bookName: 'Ephesians' },
  { htmlFile: 'Phil.xml.html', xmlFile: 'Phil.xml', bookName: 'Philippians' },
  { htmlFile: 'Col.xml.html', xmlFile: 'Col.xml', bookName: 'Colossians' },
  { htmlFile: '1Thess.xml.html', xmlFile: '1Thess.xml', bookName: '1 Thessalonians' },
  { htmlFile: '2Thess.xml.html', xmlFile: '2Thess.xml', bookName: '2 Thessalonians' },
  { htmlFile: '1Tim.xml.html', xmlFile: '1Tim.xml', bookName: '1 Timothy' },
  { htmlFile: '2Tim.xml.html', xmlFile: '2Tim.xml', bookName: '2 Timothy' },
  { htmlFile: 'Titus.xml.html', xmlFile: 'Titus.xml', bookName: 'Titus' },
  { htmlFile: 'Phlm.xml.html', xmlFile: 'Phlm.xml', bookName: 'Philemon' },
  
  // General Epistles
  { htmlFile: 'Heb.xml.html', xmlFile: 'Heb.xml', bookName: 'Hebrews' },
  { htmlFile: 'Jas.xml.html', xmlFile: 'Jas.xml', bookName: 'James' },
  { htmlFile: '1Pet.xml.html', xmlFile: '1Pet.xml', bookName: '1 Peter' },
  { htmlFile: '2Pet.xml.html', xmlFile: '2Pet.xml', bookName: '2 Peter' },
  { htmlFile: '1John.xml.html', xmlFile: '1John.xml', bookName: '1 John' },
  { htmlFile: '2John.xml.html', xmlFile: '2John.xml', bookName: '2 John' },
  { htmlFile: '3John.xml.html', xmlFile: '3John.xml', bookName: '3 John' },
  { htmlFile: 'Jude.xml.html', xmlFile: 'Jude.xml', bookName: 'Jude' },
  
  // Revelation
  { htmlFile: 'Rev.xml.html', xmlFile: 'Rev.xml', bookName: 'Revelation' },
];

function extractXMLFromHTML(htmlContent: string): string | null {
  try {
    // Find the rawLines JSON array in the HTML
    const match = htmlContent.match(/"rawLines":\[(.*?)\],"stylingDirectives"/s);
    if (!match) {
      console.error('Could not find rawLines in HTML');
      return null;
    }

    // Parse the JSON array
    const rawLinesStr = '[' + match[1] + ']';
    const rawLines = JSON.parse(rawLinesStr);

    // Decode HTML entities and join lines
    const xmlContent = rawLines
      .map((line: string) => {
        return line
          .replace(/\\u003c/g, '<')
          .replace(/\\u003e/g, '>')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\');
      })
      .join('\n');

    return xmlContent;
  } catch (error) {
    console.error('Error extracting XML:', error);
    return null;
  }
}

async function extractAllFiles() {
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║   XML EXTRACTION FROM GITHUB HTML FILES          ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  const dataDir = path.join(process.cwd(), 'data');
  let successCount = 0;
  let failCount = 0;

  for (const book of NT_BOOKS) {
    const htmlPath = path.join(dataDir, book.htmlFile);
    const xmlPath = path.join(dataDir, book.xmlFile);

    // Check if HTML file exists
    if (!fs.existsSync(htmlPath)) {
      console.log(`⚠️  ${book.bookName}: HTML file not found - ${book.htmlFile}`);
      failCount++;
      continue;
    }

    // Check if XML already exists
    if (fs.existsSync(xmlPath)) {
      console.log(`⏭️  ${book.bookName}: XML already exists - skipping`);
      continue;
    }

    // Read HTML and extract XML
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    const xmlContent = extractXMLFromHTML(htmlContent);

    if (xmlContent) {
      fs.writeFileSync(xmlPath, xmlContent, 'utf-8');
      console.log(`✅ ${book.bookName}: Extracted to ${book.xmlFile}`);
      successCount++;
    } else {
      console.log(`❌ ${book.bookName}: Failed to extract XML`);
      failCount++;
    }
  }

  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║              EXTRACTION COMPLETE!                 ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  console.log(`📊 Summary:`);
  console.log(`   Success: ${successCount} files`);
  console.log(`   Failed: ${failCount} files`);
  console.log(`   Total Processed: ${successCount + failCount} files\n`);

  if (successCount > 0) {
    console.log(`🚀 Next steps:`);
    console.log(`   1. Update scripts/convert-greek-nt.ts with new books`);
    console.log(`   2. Run: npx tsx scripts/convert-greek-nt.ts`);
    console.log(`   3. Integrate into bibleBooks.ts and bibleLoader.ts`);
  }
}

extractAllFiles().catch(console.error);
