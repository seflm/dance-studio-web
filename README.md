# Taneční studio Takt – web

Statický web pro **pronájem tanečního sálu** v centru Prahy.

Pozice: **komunitní prostor k pronájmu po hodinách.** Dva sály otevřené
tanečním školám, lektorům a komunitám, které se scházejí kolem tance –
program, jméno i lektor jsou vždycky nájemcovy. Sál patří tomu, kdo v něm
právě učí. Partnerské školy web propaguje; první z nich je
[Simply the West](https://www.simplythewest.cz/).

Texty jsou psané **pozitivně** – web nikde netvrdí, čím studio *není*.
Kdyby se copy dál rozšiřovalo, držte se téhle linky: prostor, komunita,
„sál patří tomu, kdo v něm právě učí“.

Pravidla, která drží texty krátké (a bez kterých se web zase nafoukne):

1. Odstavec má nejvýš dvě věty.
2. Každá věta obsahuje něco ověřitelného – číslo, věc v místnosti, čas, jméno.
3. Věta, která by stejně tak platila o jakémkoli jiném sále v Praze, jde pryč.
4. Žádné „Věříme, že…“, „Chceme, aby…“, „Smyslem je…“.
5. Řekni to jednou. Když fakt stojí na jedné stránce, ostatní na něj odkážou.

**Tanec je na prvním místě.** Focení, firemní akce a networking se v sále
dělat dají, ale nepatří do nadpisu, do hero sekce ani do animace v titulku –
jen do seznamů a do roletky u rezervace. Seznamy jsou dvojí: buď jmenují
konkrétní tance (a netaneční využití zmíní na konci), nebo jmenují druhy
akcí (kurz, workshop, party, focení) a pak už další tance nevypisují.

---

## Jak si to otevřít

Web je čisté HTML, CSS a JavaScript – **žádný build, žádné závislosti**.

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

Otevřít `index.html` přímo ze souboru také funguje; přes server je to
spolehlivější (webfonty, relativní cesty).

---

## Struktura

```
index.html              úvodní stránka – hero, sály, co se v sále dá dělat,
                        kdo za tím stojí, jak to funguje, záznam, partneři
prostory.html           oba sály, technický popis, vybavení
rezervace.html          ukázka rezervačního systému
partneri.html           Simply the West + podmínky partnerství
kontakt.html            doprava, prohlídka, kontaktní formulář
faq.html                časté dotazy – rozbalovací řádky

assets/css/takt.css     jeden stylesheet pro celý web
assets/js/rozvrh.js     rozvrhový modul – obsazenost, ceny, výběr hodin
assets/js/takt.js       vyhledávač termínu v hero sekci, menu, karusel
assets/js/rotator.js    střídání posledního slova v titulku
assets/js/rezervace.js  rezervační formulář, souhrn a potvrzení
assets/js/kontakt.js    kontaktní formulář
assets/img/             vizualizace sálu a loga
assets/img/og.jpg       náhled pro sdílení (1200×630, Open Graph)
assets/video/hero.mp4   podkres hero sekce (černobílý, bez zvuku, 18 MB)
assets/videos/          zdrojové video, ze kterého se hero.mp4 kóduje

robots.txt              povoluje indexaci, ukazuje na sitemapu
sitemap.xml             seznam šesti stránek pro vyhledávače

context/                zadání – fotky z inzerátu, referenční návrhy,
                        logo partnera
```

---

## Vzhled

Paleta: noční hnědá `#171009`, krém `#F4EDE1`, wolframová
zlatá `#D9A248`; písma Newsreader (serif s pravou kurzívou) a Instrument
Sans. Nosný prvek je **plovoucí lišta „najít termín“** hned v hero sekci –
první věc, na kterou se dá na webu sáhnout. Pod ní jsou dva odkazy: na celý
rozvrh a na kontaktní formulář. (Rozbalovací týdenní pásek pod lištou byl
odstraněný – odkaz vede rovnou do rozvrhu, takže pásek neměl co otevírat.)

Poznámky ke vzhledu, které je dobré neporušit:

- **Hlavičky podstránek (`.phead`) jsou krémové**, ne noční. Tmavý pruh nad
  nimi je lišta s navigací; od dalšího krémového pásu hlavičku odděluje
  vlasová linka. Kdo tam vrátí `--night`, musí vrátit i barvy `h1`, `em`
  a `.lede`.
- **`.cta .d .hl` je zlatá.** Na nočním pozadí měla `--tung-ink` kontrast
  okolo 1,9 : 1 a akcentované slovo v nadpisu bylo skoro nečitelné.
- **`.cloud`** v sekci „Co se v sále dá dělat“ je rozsyp názvů aktivit, ne
  mřížka karet: velikost nesou tance, druhy akcí a netaneční využití sedí
  menší za nimi. Rozsyp dělá `--r` a `--y` na každé položce v HTML nad
  zalamujícím se flexem, takže se na telefonu přeskládá místo překrývání;
  při `prefers-reduced-motion` se nevlní.
- **FAQ je `<details>`/`<summary>`**, žádný JavaScript – otevírá se i bez něj
  a klávesnice ho umí sama.
- **Na parketu bez odpružení nejmenujeme styly, které odpružení potřebují.**
  Balet, contemporary, hip hop a cokoli postavené na skocích a floorworku
  nepatří do rotátoru v titulku ani do rozsypu v „Co se v sále dá dělat“.
- **Slovník tlačítek má čtyři položky:** *Rezervovat* (→ `rezervace.html`),
  *Napsat nám* (→ `kontakt.html#dotaz`), *Domluvit prohlídku* a *Stát se
  partnerem*. Nepřidávejte pátou variantu na to samé – web měl v jednu chvíli
  sedm různých názvů pro dvě akce.
- **Na mobilu je v liště jen značka a hamburger.** Tlačítko *Rezervovat*
  (`.top__cta`) je skryté, aby se vešel podtitul značky; v menu je hned první.
  Hamburger je jen glyf – bez rámečku a bez podkladu.
- **`#jak` je `.flow`, ne `.steps`** – vlasová linka s tečkou a velká číslice,
  žádné karty.
- Na krémovém pásu je tlačítko `.btn` (tmavé). `.btn--l` je krémové, tedy
  jen pro noční pásy – na krému zmizí.

- Titulek je **„Prostory pro …“** a poslední slovo se střídá po 1,6 s.
  Slova jsou tance a to, co se na parketu děje (tanec, salsu, bachatu, swing,
  lindy hop, kizombu, zouk, tango, kurzy, workshopy) –
  **žádné netaneční využití**. „tanec“ je vždy první, zbytek se při každém
  načtení zamíchá. Slova se drží krátká záměrně: kontejner animuje šířku
  podle slova a dlouhé slovo rozdýchává celý řádek. Animaci obstarává
  `assets/js/rotator.js`; při `prefers-reduced-motion` se nehýbe.
- **Titulek nikdy nemění počet řádků.** Na úzkém displeji se „Prostory pro
  workshopy" na jeden řádek nevejde, zatímco „Prostory pro tanec" ano, takže
  titulek při přebíhání slov poskakoval mezi jedním a dvěma řádky.
  `fitLines()` v `rotator.js` proto změří nejdelší slovo proti skutečnému
  nadpisu, a pokud by zlomilo řádek, přidá na `h1` třídu `rot--stack`
  a slovo dostane vlastní řádek natrvalo. Dva stabilní řádky jsou lepší než
  jeden poskakující. Není to media query záměrně: bod zlomu závisí na
  načteném fontu, takže se měří znovu po `document.fonts.ready` a po každé
  změně velikosti okna.
- **Adresa je Rytířská 29, 110 00 Praha 1.** Je na webu veřejně: v zápatí,
  v mobilním menu, na `kontakt.html` i ve strukturovaných datech. Dopravní
  údaje k ní: metro Můstek (A, B) tři minuty pěšky, Národní třída (B) pět
  minut druhým směrem, tramvaj Národní třída nebo Václavské náměstí.
  (Do třetí revize web adresu záměrně neuváděl a mluvil jen o Praze; ta
  poznámka už neplatí.)
- **Kontrast akcentů.** Zlatá `#D9A248` měla na krémovém podkladu poměr
  kolem 2 : 1, což je pod hranicí čitelnosti. Na světlých pásech je proto
  `--tung-ink` `#8A6A3A` (nad 4 : 1); na tmavých pásech zůstává původní
  jasná zlatá, kde kontrast problém nebyl. Světlé komponenty (ceníková
  tabulka, formulář, potvrzení) mají v `takt.css` vlastní `.night` variantu –
  bez ní na tmavém pásu zmizí.

---

## SEO a sdílení

Kanonická doména je **`studiotakt.cz`** (soubor `CNAME`). Na ní stojí
`<link rel="canonical">`, `og:url` i `sitemap.xml` – kdyby se doména
změnila, přepište ji na všech třech místech (v substránkách ji generuje
skript, v `index.html` je psáná ručně).

Každá stránka má vlastní `title`, `description`, kanonický odkaz a sadu
Open Graph / Twitter meta tagů. Náhledový obrázek je pro všechny stránky
společný: `assets/img/og.jpg`, 1200×630.

`index.html` navíc nese strukturovaná data (JSON-LD, `LocalBusiness` +
`EventVenue`): název, popis, otevírací doba 7:00–2:00, ceny obou sálů
a vybavení. **Adresa je Rytířská 29, 110 00 Praha 1** –
stejně jako na webu. E-mail ani telefon ve strukturovaných datech nejsou, protože jsou
zatím zástupné; až budou skutečné, doplňte do JSON-LD `email`
a `telephone`. Ceny v JSON-LD jsou **páté místo**, kde jsou napsané –
při změně cen ho projděte také. Plná ceníková tabulka je po revizi obsahu
už jen na `rezervace.html#cenik`; úvodní stránka na ni odkazuje jedinou
cenou „od 290 Kč / hodina“.

---

## Rezervační systém – co umí a co ne

`rezervace.html` je **ukázka průběhu rezervace**, ne funkční systém.

Co funguje doopravdy:

- výběr sálu (velký 168 m² / malý 20 m² / oba)
- rozvrh na 12 týdnů dopředu, posun po oknech; okno má 7 dní na desktopu,
  5 na tabletu, 3 na telefonu
- klikání volných hodin, souvislé bloky se slučují („Čt 19:00–21:00“)
- rozvrh kreslí **sloupec na sál a den**; „Oba sály" tedy znamená dva
  sloupce pod každým datem, ne třetí tarif. Přepínač nad rozvrhem je filtr –
  vybírá, které sály se kreslí.
- ceny jsou provázané se sály: karty na úvodní stránce, `prostory.html`
  i obě ceníkové tabulky ukazují stejné sazby a odkazují na sebe navzájem
  (`prostory.html#velky`, `#maly`, `#oba`)
- **správný výpočet ceny** včetně přechodu mezi tarify – blok 15:00–18:00
  se počítá jako 1 h v denním tarifu + 2 h ve večerním. Součet se ukazuje
  v patičce rozvrhu a ještě jednou u odesílacího tlačítka, aby ho člověk
  viděl ve chvíli, kdy se rozhoduje
- výběr účelu z vyhledávače v hero sekci se přenese do formuláře
  (`localStorage`)

Co je jen ukázka:

- **formulář rezervace je záměrně vypnutý** (`<fieldset disabled>`).
  Stránka ukazuje, na co se rezervace ptá, ale netváří se, že ji přijme.
  Až bude systém skutečný, stačí sundat `disabled` a vrátit odesílací logiku.
  Přihlašovací panel vedle formuláře je odstraněný – viděli ho jen lidé,
  kteří účet z definice ještě nemají.
- **rozvrh nabízí hodiny do 22:00**, i když sál je k dispozici do 2:00.
  Pozdější hodiny se zatím řeší poznámkou u rezervace; až bude systém
  skutečný, posuňte `STUDIO.openTo` v `assets/js/rozvrh.js` a ošetřete
  hodiny po půlnoci (patří k předchozímu dni).
- **obsazené hodiny jsou vygenerované** deterministicky z data, takže se mezi
  načteními nemění, ale s realitou nemají nic společného
- **nic se nikam neposílá** – žádný e-mail, žádný server, žádná databáze
- obsazené bloky jsou popsané jen účelem („Kurz“, „Zkouška“, „Workshop“).
  Do rozvrhu se záměrně nedostalo jméno žádné školy – mockup nemá tvrdit,
  že si někdo termín rezervoval.

---

## Co je pravda a co je zástupné

Web se ukazuje majiteli prostoru, takže tohle je potřeba mít oddělené.

**Doložitelné a pravdivé**

- Plochy sálů 168 m² a 20 m², dohromady 188 m² – ze zadání.
- **Simply the West**: taneční škola Jiřího Švarce a Miriam Zedníčkové,
  West Coast Swing, Praha. Logo je z `context/`.
- **Jirka a Marek** v sekci *Kdo za tím stojí* – fotky i medailonky jsou
  od vás. Jirka tančí dvanáct let, těžiště má ve West Coast Swingu
  a s Miriam vede Simply the West; Marek přišel z IT a dnes se věnuje
  komunitám kolem tance. Na Jirkově fotce je Miriam zády ke kameře.
- **Jirka je zároveň spoluzakladatel studia i partnerské školy.** Web to
  říká na obou místech (`index.html#kdo`, `index.html#partneri`,
  `partneri.html`) spolu s větou, že podmínky platí pro všechny školy
  stejně. Nevyhazujte to – vypadalo by to, že se vztah zamlčuje.
- Obrázky sálu (`hall-empty`, `hall-party`, `hall-networking` a výřezy
  `hall-velky`, `hall-detail`, `hall-lide`) jsou **vizualizace dokončeného
  sálu**, ne fotky současného stavu. V hero sekci se tři z nich střídají
  po pěti sekundách.
- **Malý sál nemá vlastní vizualizaci.** Všechny podklady zachycují velký
  sál, takže u malého sálu je záměrně jen detail podlahy a osvětlení –
  materiál, ne dispozice – a na `prostory.html` je to i napsané pod
  obrázkem. Nevkládejte tam záběr velkého sálu; majitel prostor zná.

**Vymyšlené – potřebuje potvrdit nebo přepsat**

| Co | Kde | Pozn. |
|---|---|---|
| Název „Taneční studio Takt“ | všude | **návrh** – „Studio 29“ bylo obsazené; ověřte doménu a ochrannou známku |
| Role „Tanec a program“ / „Provoz a komunita“ | `index.html#kdo` | **náš návrh**, jak si práci rozdělit – přepište, jestli to máte jinak |
| Sliby o provozu | `index.html#kdo` | „Provozujeme sami“, „odpověď do dvanácti hodin“, „jeden kontaktní člověk“, „zvuk držíme uvnitř, úklid po každé hodině“ jsou **závazky, ne fakta**. Majiteli prostoru se čtou jako slib – potvrďte, že je chcete držet. |
| Loga Puls, Krok, Rytmus, Vlna | kolotoč na `index.html#partneri`, pás na `partneri.html` | **vymyšlené školy** – zástupná loga, dokud nebudou skutečné partnerské školy. Skutečná je jen Simply the West. |
| Automatický záznam lekce | `index.html#zaznam` (skryté) | **navržená služba**, zatím neexistuje |
| Video na pozadí hero sekce | `assets/video/hero.mp4`, atribut `data-video` na `.hero__bg` | **cizí video**, staženo z YouTube pro testovací web – před spuštěním ho nahraďte vlastním záběrem. Soubor je už sestříhaný na úsek 0:20–2:20, takže se cyklí sám; postup kódování je v `assets/video/README.md`. Načítá se až po `window.load`, takže na rychlost stránky nemá vliv. Fotky pod ním zůstávají: když soubor chybí, nejde dekódovat, prohlížeč odmítne autoplay nebo má návštěvník zapnuté šetření dat, hero ukáže je. |
| Kapacita 40–50 lidí, výška 3 m, sestava 4.4, vzduchotechnika | `prostory.html#velky` | podle vašeho zadání ze srpna 2026 |
| Ceny 590 / 790 / 640 Kč atd. | karty sálů na úvodní stránce, `prostory.html`, obě ceníkové tabulky, `rozvrh.js`, JSON-LD v `index.html` | orientační. **Jsou teď na šesti místech** – při změně projděte komentář nad `STUDIO` v `rozvrh.js` |
| Světlá výška 3,4 m | `prostory.html`, `index.html` | odhad z vizualizace |
| Podlaha, zrcadla, ozvučení, rekuperace, šatna | `prostory.html` | popis odpovídá *projektu*, ne současnému stavu |
| Provoz 7:00–22:00 | `rozvrh.js`, zápatí | odhad |
| Storno 48 h, potvrzení do 12 h, vstup na kód | více míst | navržená pravidla |
| `xxxxx@xxxxx.cz`, `+420 XXX XXX XXX` | zápatí, mobilní menu, `kontakt.html` | zástupné – e-mail je schválně vyplněný jako placeholder, ne jako funkční adresa, a není to odkaz |
| „8 minut pěšky od metra Florenc“ | zápatí, `index.html`, `kontakt.html` | od vás |

**Na webu už to přiznané není.** Rámečky „Ukázka“ u rezervace, kontaktního
formuláře a mapy byly na přání odstraněné – web se má číst jako hotový web,
ne jako prototyp. Tenhle soubor je proto jediné místo, kde je rozdíl mezi
skutečností a návrhem zapsaný. Než web půjde ven, projděte tabulku výš.

**Adresa se na webu neuvádí.** Skutečné umístění zůstává mimo web na vaše
přání – stránky mluví jen o „centru Prahy“ a o osmi minutách od metra
Florenc; `kontakt.html` říká, že přesnou adresu posíláme s potvrzením
rezervace.

**Městská část se neuvádí vůbec.** Web dřív uváděl „Praha 1 – centrum“.
To číslo pochází z původního zadání (Palác Rytířská, Staré Město), které
se neslučuje s pozdější informací „osm minut od metra Florenc“ – Rytířská
je od Florence asi 1,6 km a nejblíž je jí Můstek. Než se potvrdí, kde sál
opravdu je, uvádí web jen „centrum Prahy“ a stanici. Doplňujte městskou
část až s jistotou; je to údaj, který si pronajímatel ověří na první pokus.

---

## Právní / etické poznámky

- **Loga Puls, Krok, Rytmus a Vlna jsou vymyšlené školy.** Kolotoč na
  úvodní stránce i pás na `partneri.html` je ukazují jako pět partnerů,
  ačkoli existuje jen Simply the West (uprostřed). Je to vědomé rozhodnutí
  – sekce má ukázat, jak bude vypadat, až budou školy doplněné. Než web
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

1. **Příjmení a role** v sekci *Kdo za tím stojí* – teď jsou tam jen
   křestní jména a role jsou náš odhad.
2. **Název studia** – je v `<title>`, v hlavičce (`.mk`), v zápatí a v textech.
3. **Ceny** – hlavní zdroj je `STUDIO.halls` v `assets/js/rozvrh.js`; tabulky
   v HTML jsou zvlášť, aby fungovaly i bez JavaScriptu. Seznam všech míst
   je v komentáři nad `STUDIO`.
4. **Kontakty** – `rezervace@studiotakt.cz` a `+420 XXX XXX XXX` v zápatí všech
   stránek a v `kontakt.html`.
5. **Mapa** – `kontakt.html` má zástupný plánek. Vložení mapy třetí strany
   znamená načítání z cizího serveru a řešení cookies.
6. **Provozní hodiny a tarify** – `openFrom`, `openTo`, `peakFrom`
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

---

## Jedna opravená past v CSS

V `takt.css` byl blok deklarací **bez selektoru** (zbytek po smazaném pravidle
kolem patičky). Parser na něm skončí a **spolkne i pravidlo, které následuje** –
konkrétně celé `.rot`, takže střídající se slovo v titulku bylo krémové místo
zlaté. V konzoli se to nijak neprojeví; najdete to jen tak, že spočítáte
složené závorky:

```bash
python3 - <<'EOF'
d = 0
for i, line in enumerate(open("assets/css/takt.css"), 1):
    for ch in line:
        if ch == "{": d += 1
        elif ch == "}":
            d -= 1
            if d < 0:
                print("přebývající } na řádku", i); d = 0
print("konečná hloubka:", d)
EOF
```

Konečná hloubka musí být `0` a nic dalšího se nesmí vypsat.
