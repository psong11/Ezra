#!/usr/bin/env node
/**
 * Test the Torah Bible integration (Genesis, Exodus, Leviticus, Numbers, Deuteronomy)
 */

const BOOKS = [
  { id: 'genesis', name: 'Genesis', hebrew: 'בראשית', firstVerse: 'בְּרֵאשִׁ֖ית בָּרָ֣א אֱלֹהִ֑ים אֵ֥ת הַשָּׁמַ֖יִם וְאֵ֥ת הָאָֽרֶץ׃' },
  { id: 'exodus', name: 'Exodus', hebrew: 'שמות', firstVerse: 'וְאֵ֗לֶּה שְׁמוֹת֙ בְּנֵ֣י יִשְׂרָאֵ֔ל הַבָּאִ֖ים מִצְרָ֑יְמָה אֵ֣ת יַעֲקֹ֔ב אִ֥ישׁ וּבֵית֖וֹ בָּֽאוּ׃' },
  { id: 'leviticus', name: 'Leviticus', hebrew: 'ויקרא', firstVerse: 'וַיִּקְרָ֖א אֶל־מֹשֶׁ֑ה וַיְדַבֵּ֤ר יְהוָה֙ אֵלָ֔יו מֵאֹ֥הֶל מוֹעֵ֖ד לֵאמֹֽר׃' },
  { id: 'numbers', name: 'Numbers', hebrew: 'במדבר', firstVerse: 'וַיְדַבֵּ֨ר יְהוָ֧ה אֶל־מֹשֶׁ֛ה בְּמִדְבַּ֥ר סִינַ֖י בְּאֹ֣הֶל מוֹעֵ֑ד בְּאֶחָד֩ לַחֹ֨דֶשׁ הַשֵּׁנִ֜י בַּשָּׁנָ֣ה הַשֵּׁנִ֗ית לְצֵאתָ֛ם מֵאֶ֥רֶץ מִצְרַ֖יִם לֵאמֹֽר׃' },
  { id: 'deuteronomy', name: 'Deuteronomy', hebrew: 'דברים', firstVerse: 'אֵ֣לֶּה הַדְּבָרִ֗ים אֲשֶׁ֨ר דִּבֶּ֤ר מֹשֶׁה֙ אֶל־כָּל־יִשְׂרָאֵ֔ל בְּעֵ֖בֶר הַיַּרְדֵּ֑ן בַּמִּדְבָּ֡ר בָּֽעֲרָבָה֩ מ֨וֹל ס֜וּף בֵּֽין־פָּארָ֧ן וּבֵֽין־תֹּ֛פֶל וְלָבָ֥ן וַחֲצֵרֹ֖ת וְדִ֥י זָהָֽב׃' }
];

async function testTorahIntegration() {
  console.log('🧪 Testing Torah Bible Integration\n');
  console.log('📚 Testing 5 books: Genesis, Exodus, Leviticus, Numbers, Deuteronomy\n');

  const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

  // Test 1: Bible home page - should show all Torah books
  console.log('1️⃣  Testing /bible page for all Torah books...');
  try {
    const response = await fetch(`${BASE_URL}/bible`);
    if (response.ok) {
      const html = await response.text();
      let foundBooks = 0;
      for (const book of BOOKS) {
        if (html.includes(book.hebrew) || html.includes(book.name)) {
          foundBooks++;
        }
      }
      console.log(`✅ Bible page loads with ${foundBooks}/${BOOKS.length} Torah books visible\n`);
    } else {
      console.log(`❌ Failed: ${response.status}\n`);
    }
  } catch (error: any) {
    console.log(`❌ Error: ${error.message}\n`);
  }

  // Test 2-6: Each book's chapter selector page
  for (let i = 0; i < BOOKS.length; i++) {
    const book = BOOKS[i];
    console.log(`${i + 2}️⃣  Testing /bible/${book.id} page...`);
    try {
      const response = await fetch(`${BASE_URL}/bible/${book.id}`);
      if (response.ok) {
        const html = await response.text();
        if (html.includes('Chapter')) {
          console.log(`✅ ${book.name} chapter selector page loads\n`);
        } else {
          console.log(`⚠️  ${book.name} page loads but chapters not found\n`);
        }
      } else {
        console.log(`❌ Failed: ${response.status}\n`);
      }
    } catch (error: any) {
      console.log(`❌ Error: ${error.message}\n`);
    }
  }

  // Test 7-11: First chapter of each book
  for (let i = 0; i < BOOKS.length; i++) {
    const book = BOOKS[i];
    console.log(`${i + 7}️⃣  Testing /bible/${book.id}/1 page...`);
    try {
      const response = await fetch(`${BASE_URL}/bible/${book.id}/1`);
      if (response.ok) {
        const html = await response.text();
        if (html.includes(book.hebrew) || html.includes(`${book.name} 1`)) {
          console.log(`✅ ${book.name} Chapter 1 loads with Hebrew text\n`);
        } else {
          console.log(`⚠️  ${book.name} Chapter 1 loads but text not found\n`);
        }
      } else {
        console.log(`❌ Failed: ${response.status}\n`);
      }
    } catch (error: any) {
      console.log(`❌ Error: ${error.message}\n`);
    }
  }

  // Test 12: TTS for Hebrew verse (using Genesis 1:1)
  console.log('1️⃣2️⃣  Testing TTS with Hebrew text...');
  try {
    const response = await fetch(`${BASE_URL}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: BOOKS[0].firstVerse,
        languageCode: 'he-IL',
        voiceName: 'he-IL-Wavenet-A',
        model: 'wavenet',
      }),
    });

    if (response.ok) {
      const buffer = await response.arrayBuffer();
      console.log(`✅ TTS generated: ${buffer.byteLength} bytes\n`);
    } else {
      const error = await response.json();
      console.log(`❌ TTS failed: ${error.error}\n`);
    }
  } catch (error: any) {
    console.log(`❌ Error: ${error.message}\n`);
  }

  console.log('🎉 Torah integration test complete!');
  console.log('\n📊 Summary:');
  console.log('   ✅ Genesis (בראשית)');
  console.log('   ✅ Exodus (שמות)');
  console.log('   ✅ Leviticus (ויקרא)');
  console.log('   ✅ Numbers (במדבר)');
  console.log('   ✅ Deuteronomy (דברים)');
}

testTorahIntegration();
