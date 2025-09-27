const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const delay = ms => new Promise(res => setTimeout(res, ms));

async function autoScroll(page) {
  await page.evaluate(async () => {
    const scrollContainer = document.querySelector('div[role="feed"]');
    if (!scrollContainer) return;
    for (let i = 0; i < 20; i++) {
      scrollContainer.scrollBy(0, 1000);
      await new Promise(r => setTimeout(r, 1000));
    }
  });
}

async function scrapeGoogleMapsBusinesses(searchTerm = "restaurant Chișinău") {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    defaultViewport: { width: 1400, height: 1000 }, // important pentru afișarea panoului lateral
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
    ],
    ignoreDefaultArgs: ['--enable-automation'],
  });

  const page = await browser.newPage();

  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });

  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

  const url = 'https://www.google.com/maps/search/' + encodeURIComponent(searchTerm);
  await page.goto(url, { waitUntil: 'networkidle2' });

  await page.waitForSelector('div[role="feed"]', { timeout: 15000 });
  await autoScroll(page);
  await delay(3000);

  const results = [];
  const visitedBusinesses = new Set(); // pentru evitarea duplicatelor

  // Colectez toate link-urile o singură dată
  const businessLinks = await page.$$('a.hfpxzc');
  console.log(`🔍 Găsite ${businessLinks.length} afaceri în total pentru: "${searchTerm}"`);
  console.log(`📝 Încep procesarea tuturor afacerilor...\n`);

  for (let i = 0; i < businessLinks.length; i++) {
    try {
      console.log(`\n--- Procesez afacerea ${i + 1}/${businessLinks.length} ---`);
      
      // Refresh link-urile pentru a evita stale elements
      const currentBusinessLinks = await page.$$('a.hfpxzc');
      if (!currentBusinessLinks[i]) {
        console.log(`Nu există element la indexul ${i}.`);
        break;
      }

      console.log(`Fac click pe afacerea ${i + 1}...`);
      await currentBusinessLinks[i].click();
      
      // Aștept mai mult pentru încărcarea completă
      await page.waitForSelector('div.Io6YTe', { timeout: 10000 });
      await delay(3000); // Aștept 3 secunde pentru încărcare completă
      
      // Verific că sunt într-adevăr pe pagina restaurantului
      const isOnRestaurantPage = await page.evaluate(() => {
        return document.querySelector('h1') && 
               (document.querySelector('div.Io6YTe') || document.querySelector('[data-attrid="title"]'));
      });
      
      if (!isOnRestaurantPage) {
        console.log(`${i + 1}. Nu am ajuns pe pagina afacerii, sar...`);
        continue;
      }

      const data = await page.evaluate(() => {
        const getText = (selector) => {
          const el = document.querySelector(selector);
          return el ? el.textContent.trim() : '';
        };

        const name = getText('h1[data-attrid="title"]') || 
                     getText('h1[class*="fontHeadlineLarge"]') || 
                     getText('h1.DUwDvf') || 
                     getText('h1') || 
                     getText('[data-attrid="title"]') ||
                     'Nume nedeterminat';

        const infoDivs = Array.from(document.querySelectorAll('div.Io6YTe'));

        const address = infoDivs.find(div => {
          const text = div.textContent.trim();
          return text.includes('Republica Moldova') ||
                 text.match(/MD-\d{4}/) || // Moldova
                 text.includes('București') ||
                 text.includes('Bucharest') ||
                 text.includes('Sector') ||
                 text.match(/\d{6}\s*România/) || // Cod poștal România
                 text.includes('România');
        })?.textContent.trim() || '';

        const phone = infoDivs.find(div => {
          const text = div.textContent.trim();
          // Regex pentru telefoane românești și moldovenești
          return text.match(/^\+40\s?\d{2,3}[\s-]?\d{2,3}[\s-]?\d{2,3}$/) || // România (+40)
                 text.match(/^\+373\s?\d{2,3}[\s-]?\d{2,3}[\s-]?\d{2,3}$/) || // Moldova (+373)
                 text.match(/^0\d{2,3}[\s-]?\d{2,3}[\s-]?\d{2,3}$/) || // Format național românesc (0xxx)
                 text.match(/^\d{10}$/) || // 10 cifre fără prefix
                 text.match(/^\d{3}[\s-]?\d{3}[\s-]?\d{3}$/); // Format cu spații/liniuțe
        })?.textContent.trim() || '';

        const website = infoDivs.find(div =>
          div.textContent.includes('.md') || div.textContent.includes('.com') || div.textContent.includes('.ro')
        )?.textContent.trim() || '';

        const ratingEl = Array.from(document.querySelectorAll('span')).find(el =>
          el.getAttribute('aria-label')?.includes('stea') || 
          el.textContent.includes('stele') ||
          el.textContent.match(/^\d{1,2}[.,]\d\s?(stele|stars?)/) ||
          el.getAttribute('aria-label')?.match(/\d[.,]\d/)
        );
        const rating = ratingEl?.getAttribute('aria-label') || ratingEl?.textContent.trim() || 
                      getText('[jsaction*="pane.rating"]') || 
                      getText('.F7nice') || '';

        return { name, rating, address, phone, website };
      });

      // Verific dacă datele sunt valide înainte de a le procesa
      if (!data.name || data.name === 'Nume nedeterminat' || !data.name.trim()) {
        console.log(`${i + 1}. Date incomplete, sar...`);
        continue;
      }
      
      // Creez o cheie unică pentru verificarea duplicatelor - folosesc doar numele și telefonul
      const businessKey = `${data.name.trim()}_${data.phone.trim()}`.toLowerCase().replace(/\s+/g, '');
      
      if (visitedBusinesses.has(businessKey)) {
        console.log(`${i + 1}. DUPLICAT SĂRIT: ${data.name}`);
        continue;
      }
      
      visitedBusinesses.add(businessKey);
      console.log(`${i + 1}. ✅ ${data.name} | Rating: ${data.rating} | Tel: ${data.phone}`);
      results.push(data);

      // Încerc să mă întorc la lista principală prin multiple strategii
      try {
        // Strategia 1: Încerc să găsesc și să fac click pe butonul back
        let backSuccess = false;
        
        const backSelectors = [
          'button[data-value="back"]',
          'button[aria-label*="Back"]',
          'button[aria-label*="Înapoi"]',
          'button[jsaction*="back"]',
          '[data-value="back"]',
          '.VfPpkd-icon-LgbsSe[aria-label*="Back"]'
        ];
        
        for (const selector of backSelectors) {
          const backButton = await page.$(selector);
          if (backButton) {
            await backButton.click();
            await delay(1500);
            backSuccess = true;
            break;
          }
        }
        
        // Strategia 2: Dacă back nu funcționează, încerc Escape
        if (!backSuccess) {
          await page.keyboard.press('Escape');
          await delay(1000);
        }
        
        // Strategia 3: Verific dacă sunt înapoi în listă, altfel refresh
        await delay(1000); // Aștept să se finalizeze navigarea
        const feedExists = await page.$('div[role="feed"]');
        if (!feedExists) {
          console.log('Nu sunt în listă, fac refresh...');
          await page.reload({ waitUntil: 'networkidle2' });
          await page.waitForSelector('div[role="feed"]', { timeout: 10000 });
          await delay(2000);
        } else {
          console.log('✅ Înapoi în listă cu succes');
        }
        
      } catch (backError) {
        console.log(`Eroare la navigare înapoi: ${backError.message}`);
      }

      await delay(2000); // mică pauză înainte de următorul click

    } catch (err) {
      console.log(`Eroare la indexul ${i}: ${err.message}`);
    }
  }

  // Creez numele fișierului pe baza termenului de căutare
  const sanitizedSearchTerm = searchTerm.replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase();
  const filePath = path.join(__dirname, `results_${sanitizedSearchTerm}.csv`);
  
  const header = `"Nume","Rating","Adresă","Telefon","Website"\n`;
  const rows = results.map(r =>
    `"${r.name}","${r.rating}","${r.address}","${r.phone}","${r.website}"`
  ).join('\n');

  fs.writeFileSync(filePath, header + rows, 'utf8');
  console.log(`\n✅ Datele au fost salvate în: ${filePath}`);
  console.log(`📊 Total afaceri procesate: ${results.length} din ${businessLinks.length} găsite`);

  await browser.close();
}

// 🔧 MODIFICĂ AICI TIPUL DE BUSINESS ȘI LOCAȚIA:
// Format: scrapeGoogleMapsBusinesses("TIP_BUSINESS ORAȘ");

// Exemple de tipuri de business:
// scrapeGoogleMapsBusinesses("restaurant Chișinău");
// scrapeGoogleMapsBusinesses("cafenea Chișinău");
// scrapeGoogleMapsBusinesses("sala fitness Chișinău");
// scrapeGoogleMapsBusinesses("farmacie Chișinău");
// scrapeGoogleMapsBusinesses("hotel Chișinău");
// scrapeGoogleMapsBusinesses("clinica dentara Chișinău");
// scrapeGoogleMapsBusinesses("magazin alimentar Chișinău");
// scrapeGoogleMapsBusinesses("salon frumusețe Chișinău");
// scrapeGoogleMapsBusinesses("benzinarie Chișinău");
// scrapeGoogleMapsBusinesses("bancomat Chișinău");

// Pentru alte orașe:
// scrapeGoogleMapsBusinesses("restaurant Bălți");
// scrapeGoogleMapsBusinesses("cafenea Orhei");

// 👇 SCHIMBĂ ACEASTĂ LINIE CU CE VREI TU:
scrapeGoogleMapsBusinesses("restaurant Sectorul 5 București");
