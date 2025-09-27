# 🗺️ GM-Wind - Google Maps Business Scraper

**Scraper automat pentru extragerea informațiilor despre afaceri din Google Maps**

## 📋 Caracteristici Principale

- 🎯 **Extragere automată** - Restaurante, cafenele, săli fitness, farmacii, etc.
- 📱 **Suport complet telefoane** - România (+40) și Moldova (+373) 
- 🔍 **Detectare duplicate avansată** - Evită datele duplicate automat
- 📊 **Export CSV profesional** - Date structurate pentru analiza ulterioară
- 🚀 **Navigare robustă** - Puppeteer cu fallback-uri multiple
- ⚙️ **Configurabil** - Orice oraș, orice tip de business
- 🛡️ **Anti-detection** - Configurări pentru evitarea blocărilor

## 🔧 Instalare & Setup

```bash
# Clonează repository-ul
git clone https://github.com/alexlescinschi/gm-wind.git
cd gm-wind

# Instalează dependențele
npm install
```

## 🚀 Utilizare Rapidă

### 1. **Configurează căutarea**
Editează fișierul `scrape-maps.js` - linia finală:

```javascript
// Pentru Sectoarele București
scrapeGoogleMapsBusinesses("restaurant Sectorul 1 București");
scrapeGoogleMapsBusinesses("restaurant Sectorul 2 București");
scrapeGoogleMapsBusinesses("restaurant Sectorul 3 București");

// Pentru Chișinău
scrapeGoogleMapsBusinesses("restaurant Chișinău");
scrapeGoogleMapsBusinesses("cafenea Chișinău");

// Pentru alte orașe
scrapeGoogleMapsBusinesses("sala fitness Cluj-Napoca");
scrapeGoogleMapsBusinesses("farmacie Iași");
```

### 2. **Rulează scripul**
```bash
node scrape-maps.js
```

### 3. **Rezultate**
Fișierul CSV se generează automat: `results_[tip_business]_[locatie].csv`

## 📊 Exemple de Căutări Disponibile

```javascript
// 🍽️ RESTAURANTE
scrapeGoogleMapsBusinesses("restaurant Chișinău");
scrapeGoogleMapsBusinesses("restaurant Sectorul 1 București");
scrapeGoogleMapsBusinesses("pizzerie Cluj-Napoca");

// ☕ CAFENELE & BARURI  
scrapeGoogleMapsBusinesses("cafenea Chișinău");
scrapeGoogleMapsBusinesses("bar Timișoara");

// 🏋️ FITNESS & WELLNESS
scrapeGoogleMapsBusinesses("sala fitness Chișinău");
scrapeGoogleMapsBusinesses("salon frumusețe București");

// 🏥 SERVICII MEDICALE
scrapeGoogleMapsBusinesses("farmacie Bălți");
scrapeGoogleMapsBusinesses("clinica dentara Oradea");

// 🛒 SHOPPING & RETAIL
scrapeGoogleMapsBusinesses("magazin alimentar Constanța");
scrapeGoogleMapsBusinesses("benzinarie Brașov");

// 🏨 HOTELURI & TURISM
scrapeGoogleMapsBusinesses("hotel Sibiu");
scrapeGoogleMapsBusinesses("pensiune Maramureș");
```

## 📁 Structura Fișierelor CSV

Fiecare fișier CSV conține următoarele coloane:

| Coloană | Descriere | Exemple |
|---------|-----------|---------|
| **Nume** | Numele complet al afacerii | "Restaurant Provence", "La Moșu" |
| **Rating** | Rating-ul și numărul de review-uri | "4.2 stars 1,336 Reviews" |
| **Adresă** | Adresa completă cu cod poștal | "Bulevardul Alexandru Obregia 25, București 041727, Romania" |
| **Telefon** | Numărul de telefon formatat | "+40 786 683 683", "+373 22 123 456" |
| **Website** | Site-ul web al afacerii | "restaurantprovence.ro" |

## 🛠️ Stack Tehnologic

- **🤖 Puppeteer 24.9.0** - Automatizare browser Chrome
- **⚡ Node.js 23.11.0** - Runtime JavaScript  
- **📝 CSV Export** - Pentru procesarea datelor în Excel/Sheets
- **🔧 Path & FS** - Manipularea fișierelor
- **⏱️ Async/Await** - Programare asincronă modernă

## 📈 Performanță & Statistici

### 🎯 **Rate de Succes Demonstrate:**
- **Sectorul 1 București**: 69/80 restaurante (**86% succes**)
- **Sectorul 4 București**: 85/88 restaurante (**96.6% succes**)  
- **Sectorul 5 București**: În progres...

### ⚙️ **Optimizări Implementate:**
- ✅ **Delay-uri inteligente**: 3-5 secunde pentru încărcare completă
- ✅ **Refresh selectori**: Evită "stale element" errors  
- ✅ **Navigare multiplă**: Escape + Back button + Refresh fallbacks
- ✅ **Regex telefoane**: Suport complet +40 (România) și +373 (Moldova)
- ✅ **Duplicate detection**: Algoritmul cu nume + telefon

## 🚨 Configurări Anti-Detection

Scriptul include protecții împotriva detectării automate:

```javascript
// User Agent real
'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'

// Eliminare webdriver flags
Object.defineProperty(navigator, 'webdriver', { get: () => false });

// Chrome flags optimizate
'--disable-blink-features=AutomationControlled'
'--no-sandbox'
'--disable-setuid-sandbox'
```

## 📊 Progres Complet Bucharest

| Sector | Status | Restaurante | Rata Succes | Fișier CSV |
|--------|---------|-------------|-------------|------------|
| **Sectorul 1** | ✅ Complet | 69/80 | 86% | `results_restaurant_sectorul_1_bucuresti.csv` |
| **Sectorul 2** | ✅ Complet | - | - | `results_restaurant_sectorul_2_bucuresti.csv` |
| **Sectorul 3** | ✅ Complet | - | - | `results_restaurant_sectorul_3_bucuresti.csv` |
| **Sectorul 4** | ✅ Complet | 85/88 | 96.6% | `results_restaurant_sectorul_4_bucuresti.csv` |
| **Sectorul 5** | 🔄 În progres | - | - | `results_restaurant_sectorul_5_bucuresti.csv` |
| **Sectorul 6** | ⏳ Planificat | - | - | - |

## ⚠️ Recomandări de Utilizare

1. **🕒 Utilizare responsabilă** - Nu supraîncărca serverele Google
2. **⏱️ Delay-uri** - Păstrează delay-urile pentru stabilitate
3. **🔄 Batch processing** - Procesează câteva sute de rezultate odată
4. **💾 Backup** - Salvează regulat fișierele CSV generate
5. **🔧 Personalizare** - Adaptează regex-urile pentru alte țări

## 🤝 Contribuții

Contribuțiile sunt binevenite! Pentru schimbări majore:

1. 🍴 Fork repository-ul
2. 🌿 Creează o ramură pentru feature (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit schimbările (`git commit -m 'Add AmazingFeature'`)
4. 📤 Push la ramură (`git push origin feature/AmazingFeature`)
5. 🔄 Deschide un Pull Request

## 📄 Licență

Acest proiect este licențiat sub MIT License - vezi fișierul [LICENSE](LICENSE) pentru detalii.

## 📞 Contact & Support

- **👨‍💻 Autor**: Alex Lescinschi  
- **📧 Email**: [alex@lescinschi.art](mailto:alex@lescinschi.art)
- **🐛 Issues**: [GitHub Issues](https://github.com/alexlescinschi/gm-wind/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/alexlescinschi/gm-wind/discussions)

---

**⭐ Dacă proiectul te-a ajutat, lasă un star! Îți mulțumim! 🚀**

*Creat cu ❤️ pentru extragerea eficientă de date din Google Maps Business.*