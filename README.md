# Taneční studio Takt — web

Statický web pro **pronájem tanečního sálu** v centru Prahy.

Pozice: **komunitní prostor k pronájmu po hodinách.** Dva sály otevřené
tanečním školám, lektorům a komunitám, které se scházejí kolem tance —
program, jméno i lektor jsou vždycky nájemcovy. Sál patří tomu, kdo v něm
právě učí. Partnerské školy web propaguje; první z nich je
[Simply the West](https://www.simplythewest.cz/).

Texty jsou psané **pozitivně** — web nikde netvrdí, čím studio *není*.
Kdyby se copy dál rozšiřovalo, držte se téhle linky: prostor, komunita,
„sál patří tomu, kdo v něm právě učí“.

---

## Jak si to otevřít

Web je čisté HTML, CSS a JavaScript — **žádný build, žádné závislosti**.

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

Otevřít `index.html` přímo ze souboru také funguje; přes server je to
spolehlivější (webfonty, relativní cesty).

---

## Struktura

```
index.html              úvodní stránka — hero, filozofie, kdo za tím stojí,
                        sály, jak to funguje, záznam, ceník, partneři
prostory.html           oba sály, technický popis, vybavení
rezervace.html          ukázka rezervačního systému
partneri.html           Simply the West + podmínky partnerství
kontakt.html            doprava, prohlídka, kontaktní formulář

assets/css/takt.css     jeden stylesheet pro celý web
assets/js/rozvrh.js     rozvrhový modul — obsazenost, ceny, výběr hodin
assets/js/takt.js       vyhledávač termínu v hero sekci a týdenní náhled
assets/js/rotator.js    střídání posledního slova v titulku
assets/js/rezervace.js  rezervační formulář, souhrn a potvrzení
assets/js/kontakt.js    kontaktní formulář
assets/img/             vizualizace sálu a loga

context/                zadání — fotky z inzerátu, referenční návrhy,
                        logo partnera
```

---

## Vzhled

Jeden návrh, **Salon**: noční hnědá `#171009`, krém `#F4EDE1`, wolframová
zlatá `#D9A248`; písma Newsreader (serif s pravou kurzívou) a Instrument
Sans. Nosný prvek je **plovoucí lišta „najít termín“** hned v hero sekci —
první věc, na kterou se dá na webu sáhnout — a pod ní rozbalitelný
týdenní rozvrh.

Vývoj prošel pěti variantami (Trezor, Sgraffito, Provoz, Salon, Ateliér);
zbylé čtyři jsou v historii gitu, na webu z nich nic nezůstalo.

Poznámky ke vzhledu, které je dobré neporušit:

- Titulek je **„Prostory pro …“** a poslední slovo se střídá (tanec, zkoušky,
  workshopy, komunitu, focení, setkání) přibližně po sekundě. Animaci
  obstarává `assets/js/rotator.js`; při `prefers-reduced-motion` se nehýbe.
- **Žádná konkrétní adresa ani zmínka o klenbě.** Web mluví o Praze, ne
  o ulici.
- **Kontrast akcentů.** Zlatá `#D9A248` měla na krémovém podkladu poměr
  kolem 2 : 1, což je pod hranicí čitelnosti. Na světlých pásech je proto
  `--tung-ink` `#8A6A3A` (nad 4 : 1); na tmavých pásech zůstává původní
  jasná zlatá, kde kontrast problém nebyl. Světlé komponenty (ceníková
  tabulka, formulář, potvrzení) mají v `takt.css` vlastní `.night` variantu —
  bez ní na tmavém pásu zmizí.

---

## Rezervační systém — co umí a co ne

`rezervace.html` je **ukázka průběhu rezervace**, ne funkční systém.

Co funguje doopravdy:

- výběr sálu (velký 122 m² / malý 20 m² / oba)
- rozvrh na 12 týdnů dopředu, posun po oknech; okno má 7 dní na desktopu,
  5 na tabletu, 3 na telefonu
- klikání volných hodin, souvislé bloky se slučují („Čt 19:00–21:00“)
- rozvrh kreslí **sloupec na sál a den**; „Oba sály" tedy znamená dva
  sloupce pod každým datem, ne třetí tarif. Přepínač nad rozvrhem je filtr —
  vybírá, které sály se kreslí.
- ceny jsou provázané se sály: karty na úvodní stránce, `prostory.html`
  i obě ceníkové tabulky ukazují stejné sazby a odkazují na sebe navzájem
  (`prostory.html#velky`, `#maly`, `#oba`)
- **správný výpočet ceny** včetně přechodu mezi tarify — blok 15:00–18:00
  se počítá jako 1 h mimo špičku + 2 h ve špičce
- výběr účelu z vyhledávače v hero sekci se přenese do formuláře
  (`localStorage`)

Co je jen ukázka:

- **formulář rezervace je záměrně vypnutý** (`<fieldset disabled>`) a panel
  vedle něj nabízí přihlášení, které nikam nevede. Stránka ukazuje, na co se
  rezervace ptá, ale netváří se, že ji přijme. Až bude systém skutečný,
  stačí sundat `disabled` a vrátit odesílací logiku.
- **obsazené hodiny jsou vygenerované** deterministicky z data, takže se mezi
  načteními nemění, ale s realitou nemají nic společného
- **nic se nikam neposílá** — žádný e-mail, žádný server, žádná databáze
- obsazené bloky jsou popsané jen účelem („Kurz“, „Zkouška“, „Workshop“).
  Do rozvrhu se záměrně nedostalo jméno žádné školy — mockup nemá tvrdit,
  že si někdo termín rezervoval.

---

## Co je pravda a co je zástupné

Web se ukazuje majiteli prostoru, takže tohle je potřeba mít oddělené.

**Doložitelné a pravdivé**

- Plochy sálů 122 m² a 20 m² — ze zadání.
- **Simply the West**: taneční škola Jiřího Švarce a Miriam Zedníčkové,
  West Coast Swing, Praha. Logo je z `context/`.
- **Jirka a Marek** v sekci *Kdo za tím stojí* — fotky i medailonky jsou
  od vás. Jirka tančí dvanáct let, těžiště má ve West Coast Swingu
  a s Miriam vede Simply the West; Marek přišel z IT a dnes se věnuje
  komunitám kolem tance. Na Jirkově fotce je Miriam zády ke kameře.
- **Jirka je zároveň spoluzakladatel studia i partnerské školy.** Web to
  říká na obou místech (`index.html#kdo`, `index.html#partneri`,
  `partneri.html`) spolu s větou, že podmínky platí pro všechny školy
  stejně. Nevyhazujte to — vypadalo by to, že se vztah zamlčuje.
- Obrázky sálu (`hall-empty`, `hall-party`, `hall-networking` a výřezy
  `hall-velky`, `hall-detail`, `hall-lide`) jsou **vizualizace dokončeného
  sálu**, ne fotky současného stavu. V hero sekci se tři z nich střídají
  po pěti sekundách.
- **Malý sál nemá vlastní vizualizaci.** Všechny podklady zachycují velký
  sál, takže u malého sálu je záměrně jen detail podlahy a osvětlení —
  materiál, ne dispozice — a na `prostory.html` je to i napsané pod
  obrázkem. Nevkládejte tam záběr velkého sálu; majitel prostor zná.

**Vymyšlené — potřebuje potvrdit nebo přepsat**

| Co | Kde | Pozn. |
|---|---|---|
| Název „Taneční studio Takt“ | všude | **návrh** — „Studio 29“ bylo obsazené; ověřte doménu a ochrannou známku |
| Role „Tanec a program“ / „Provoz a komunita“ | `index.html#kdo` | **náš návrh**, jak si práci rozdělit — přepište, jestli to máte jinak |
| Sliby o provozu | `index.html#kdo` | „Provozujeme sami“, „odpověď do dvanácti hodin“, „jeden kontaktní člověk“, „zvuk držíme uvnitř, úklid po každé hodině“ jsou **závazky, ne fakta**. Majiteli prostoru se čtou jako slib — potvrďte, že je chcete držet. |
| Loga Puls, Krok, Rytmus, Vlna | kolotoč na `index.html#partneri`, pás na `partneri.html` | **vymyšlené školy** — zástupná loga, dokud nebudou skutečné partnerské školy. Skutečná je jen Simply the West. |
| Automatický záznam lekce | `index.html#zaznam` (skryté) | **navržená služba**, zatím neexistuje |
| Video na pozadí hero sekce | `index.html`, `data-video` na `.hero__bg` | **cizí video z YouTube** (`-9wDcHE7H54`). Pro veřejný web potřebujete práva k němu, nebo natočit vlastní. Vkládá se přes `youtube-nocookie.com`, ale pořád to je požadavek na cizí server. Smyčka běží od 0:20 do 2:20 — úsek se nastavuje atributy `data-from` a `data-to` na `.hero__bg` (v sekundách). Fotky pod ním zůstávají — když se video nespustí, hero není prázdné. Video se navíc odkryje až po 2,5 s prokazatelného přehrávání, aby se nikdy neukázalo ovládání YouTube (tlačítko přehrát je uprostřed obrazu, takže oříznutím ho schovat nejde). Vypnete odebráním atributu `data-video`. |
| Kapacita 40–50 lidí, výška 3 m, sestava 4.4, vzduchotechnika | `prostory.html#velky` | podle vašeho zadání ze srpna 2026 |
| Ceny 590 / 790 / 640 Kč atd. | karty sálů na úvodní stránce, `prostory.html`, obě ceníkové tabulky, `rozvrh.js` | orientační. **Jsou teď na pěti místech** — při změně projděte komentář nad `STUDIO` v `rozvrh.js` |
| Světlá výška 3,4 m | `prostory.html`, `index.html` | odhad z vizualizace |
| Podlaha, zrcadla, ozvučení, rekuperace, šatna | `prostory.html` | popis odpovídá *projektu*, ne současnému stavu |
| Provoz 7:00–22:00 | `rozvrh.js`, zápatí | odhad |
| Storno 48 h, potvrzení do 12 h, vstup na kód | více míst | navržená pravidla |
| `rezervace@studiotakt.cz`, `+420 XXX XXX XXX` | zápatí, `kontakt.html` | zástupné |
| „3 minuty pěšky od metra“ | zápatí, `kontakt.html` | odhad |

**Na webu už to přiznané není.** Rámečky „Ukázka“ u rezervace, kontaktního
formuláře a mapy byly na přání odstraněné — web se má číst jako hotový web,
ne jako prototyp. Tenhle soubor je proto jediné místo, kde je rozdíl mezi
skutečností a návrhem zapsaný. Než web půjde ven, projděte tabulku výš.

**Adresa se na webu neuvádí.** Skutečné umístění zůstává mimo web na vaše
přání — stránky mluví jen o „Praze 1, centru“ a `kontakt.html` říká, že
přesnou adresu posíláme s potvrzením rezervace.

---

## Právní / etické poznámky

- **Loga Puls, Krok, Rytmus a Vlna jsou vymyšlené školy.** Kolotoč na
  úvodní stránce i pás na `partneri.html` je ukazují jako pět partnerů,
  ačkoli existuje jen Simply the West (uprostřed). Je to vědomé rozhodnutí
  — sekce má ukázat, jak bude vypadat, až budou školy doplněné. Než web
  půjde ven veřejně, vyměňte je za skutečná loga.
- Sekce o historii domu i věta o nezávislém nájemci jsou z webu pryč. Kdyby
  se adresa někdy zveřejnila, vraťte i upozornění, že studio s bankou
  sídlící v domě nijak nesouvisí.
- Vizualizace sálu vznikly z podkladů v `context/`. Pro veřejný web je
  potřeba mít k nim práva, nebo si nechat nafotit hotový prostor.
- Logo Simply the West je použité v barevné i **jednobarevné (výseková) verzi**
  (`assets/img/partner-simplythewest-mono.png`, vytvořená z podkladu
  v `context/`). Před spuštěním si vyžádejte souhlas s použitím a ideálně
  originál ve vektoru.

---

## Co změnit nejdřív

1. **Příjmení a role** v sekci *Kdo za tím stojí* — teď jsou tam jen
   křestní jména a role jsou náš odhad.
2. **Název studia** — je v `<title>`, v hlavičce (`.mk`), v zápatí a v textech.
3. **Ceny** — hlavní zdroj je `STUDIO.halls` v `assets/js/rozvrh.js`; tabulky
   v HTML jsou zvlášť, aby fungovaly i bez JavaScriptu. Seznam všech míst
   je v komentáři nad `STUDIO`.
4. **Kontakty** — `rezervace@studiotakt.cz` a `+420 XXX XXX XXX` v zápatí všech
   stránek a v `kontakt.html`.
5. **Mapa** — `kontakt.html` má zástupný plánek. Vložení mapy třetí strany
   znamená načítání z cizího serveru a řešení cookies.
6. **Provozní hodiny a tarify** — `openFrom`, `openTo`, `peakFrom`
   v `assets/js/rozvrh.js`.

---

## Technické

- Bez buildu, bez frameworku, bez závislostí.
- Písma z Google Fonts, obě s podporou `latin-ext` (české diakritiky).
- Obrázky jsou WebP, jednobarevné logo PNG s průhledností.
- Responzivní od 320 px; rozvrh mění počet zobrazených dní podle šířky.
- Přístupnost: jeden `<h1>` na stránku, popisky u všech ovládacích prvků,
  `alt` u všech obrázků, viditelný focus, respektuje
  `prefers-reduced-motion`, odkaz „Přeskočit na obsah“.
- Ověřeno v Chromiu na 390 / 700 / 1440 px: bez mrtvých odkazů, bez
  duplicitních `id`, bez vodorovného přetékání.
