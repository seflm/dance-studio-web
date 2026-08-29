# Taneční studio Takt — web

Statický web pro **pronájem tanečního sálu** v Paláci Rytířská,
Rytířská 536/29, Praha 1 — Staré Město.

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
index.html            úvodní stránka (varianta A) — s interaktivním rozvrhem
prostory.html         oba sály, technický popis, vybavení
rezervace.html        ukázka rezervačního systému
partneri.html         Simply the West + podmínky partnerství
kontakt.html          adresa, doprava, kontaktní formulář

assets/css/site.css   jeden stylesheet pro celý web (varianta A)
assets/js/rozvrh.js   rozvrhový modul — obsazenost, ceny, výběr hodin
assets/js/site.js     hlavička, mobilní menu, animace při scrollu
assets/img/           fotografie a loga

mockupy/index.html    přehled pěti návrhů s náhledy
mockupy/b-sgraffito.html
mockupy/c-provoz.html
mockupy/d-salon.html
mockupy/e-atelier.html  čtyři alternativní návrhy úvodní stránky

context/              zadání — fotky z inzerátu, referenční návrhy, logo partnera
```

---

## Pět návrhů

Každá varianta je samostatná úvodní stránka se **stejným obsahem a stejnými
čísly**. Liší se paletou, typografií a kompozicí. Přehled a náhledy jsou na
`mockupy/index.html`.

| | Směr | Paleta | Písmo | Nosný prvek |
|---|---|---|---|---|
| **A** | **Trezor** — dotažena do celého webu | ink `#101317`, vápenec `#E7E0D2`, mosaz `#B08D3F`, měděnka `#4E6B60` | Bodoni Moda · Archivo · IBM Plex Mono | Rozvrh jako účetní kniha |
| **B** | Sgraffito | vápno `#EFEAE0`, škrábanec `#2E2A26`, železitá `#8C3B2E`, okr `#B98A2E` | Alegreya · Karla · Alegreya Sans SC | Oblouk a škrábaný pás |
| **C** | Provoz | papír `#F6F6F3`, ink `#16171A`, ultramarín `#1F3BEE` | Archivo Expanded · IBM Plex Sans · JetBrains Mono | Počet volných hodin místo hlavní fotky |
| **D** | Salon | noc `#171009`, krém `#F4EDE1`, wolfram `#D9A248` | Newsreader · Instrument Sans | Plovoucí lišta „najít termín“ |
| **E** | Ateliér | krém `#FDFBF7`, taupe `#E6DFD5`, espresso `#1A1817`, zlatá `#C5A880` | Cormorant Garamond · Plus Jakarta Sans | Rezervační lišta přes okraj hero sekce, kolotoč partnerů |

Mezi variantami se přepíná **lištou v horní části stránky** (`Návrh A – E`).
Je to jen pomůcka pro výběr — před spuštěním stačí smazat blok `.vsw`
z `index.html` a třídu `has-vsw` z jeho `<body>`; u variant B–E blok
`nav.ribbon`. Nic jiného na ní nezávisí.

Návrh **A** vychází z toho, že dům byl spořitelna a že se prodává *čas* —
proto rytá číslice, účetní linky a mosazné šrafování přes obsazené hodiny.
Návrh **D** je nejblíž referenčním ukázkám ze zadání. Návrh **E** vznikl
na zadanou paletu a typografii; má na telefonu spodní rezervační lištu
a v hero sekci počítá s krátkou video smyčkou místo fotografie.

**Společné pro všechny návrhy** po poslední revizi:

- Titulek je **„Prostory pro …“** a poslední slovo se střídá (tanec, zkoušky,
  workshopy, komunitu, focení, setkání). Animaci obstarává
  `assets/js/rotator.js`; při `prefers-reduced-motion` se nehýbe.
- **Žádná konkrétní adresa ani zmínka o klenbě.** Web mluví o Praze, ne
  o ulici. Sekce o historii domu jsou pryč ze všech variant, stejně jako
  věta o nezávislém nájemci.
- Partnerské školy: bez „první“, bez tabulky faktů, s **černobílým logem**.

**Návrhy D a E jsou nejdál:** mají sekci *Filozofie*, partnerské školy běží
jako **kolotoč** s řadou log jako navigací (Simply the West uprostřed),
hero vyplní celou výšku okna, rezervační lišta je uvnitř něj a pod ní se dá
rozbalit **týdenní rozvrh**. Pole „Do“ je koncový čas, ne počet hodin.

**Kontrast akcentů.** Zlatá `#C5A880` (E) a `#D9A248` (D) měly na světlém
podkladu poměr kolem 2 : 1, což je pod hranicí čitelnosti. Na světlých
pásech je teď `#8F6B2E`, resp. `#8A6A3A` (nad 4 : 1); na tmavých pásech
zůstává původní jasná zlatá, kde kontrast problém nebyl. Stejně se opravily
číslice ve variantě B.

Rozvrhový modul, ceník i texty jsou nezávislé na vzhledu — dají se přenést do
kterékoli varianty.

---

## Rezervační systém — co umí a co ne

`rezervace.html` je **ukázka průběhu rezervace**, ne funkční systém.

Co funguje doopravdy:

- výběr sálu (velký 122 m² / malý 20 m² / oba)
- rozvrh na 12 týdnů dopředu, posun po oknech; okno má 7 dní na desktopu,
  5 na tabletu, 3 na telefonu
- klikání volných hodin, souvislé bloky se slučují („Čt 19:00–21:00“)
- **správný výpočet ceny** včetně přechodu mezi tarify — blok 15:00–18:00
  se počítá jako 1 h mimo špičku + 2 h ve špičce
- **semestrální sazba** se zapne od 10 týdnů opakování a přepíše
  špičku i mimo špičku
- validace formuláře a potvrzení s referenčním číslem
- výběr hodin **se přenáší mezi stránkami** — co vyberete na úvodní stránce,
  najdete v rezervačním formuláři (`localStorage`)

Co je jen ukázka:

- **obsazené hodiny jsou vygenerované** deterministicky z data, takže se mezi
  načteními nemění, ale s realitou nemají nic společného
- **nic se nikam neposílá** — žádný e-mail, žádný server, žádná databáze
- obsazené bloky jsou popsané jen účelem („Kurz“, „Zkouška“, „Workshop“).
  Do rozvrhu se záměrně nedostalo jméno žádné školy — mockup nemá tvrdit,
  že si někdo termín rezervoval.

---

## Co je pravda a co je zástupné

Web se ukazuje bance, takže tohle je potřeba mít oddělené.

**Doložitelné a pravdivé**

- Plochy sálů 122 m² a 20 m² — ze zadání.
- **Simply the West**: taneční škola Jiřího Švarce a Miriam Zedníčkové,
  West Coast Swing, Praha. Logo je z `context/`.
- Fotografie sálu i fasády jsou skutečné, z inzerátu na prodej/pronájem
  prostoru.

**Vymyšlené — potřebuje potvrdit nebo přepsat**

| Co | Kde | Pozn. |
|---|---|---|
| Název „Taneční studio Takt“ | všude | **návrh** — „Studio 29“ bylo obsazené; ověřte doménu a ochrannou známku |
| Loga Puls, Krok, Rytmus, Vlna | kolotoč partnerů v D a E | **vymyšlené školy** — ukazují jen, jak bude sekce vypadat plná. Na stránce je to napsané. |
| Adresa „Karolíny Světlé 301/8“ | zápatí všech stránek, `kontakt.html` | **zástupná** — skutečnou adresu na přání neuvádíme |
| Ceny 590 / 790 / 640 Kč atd. | ceníkové tabulky, `rozvrh.js` | orientační, na webu označené jako orientační |
| Světlá výška 3,4 m | `prostory.html`, `index.html` | odhad z fotky |
| Podlaha, zrcadla, ozvučení, rekuperace, šatna | `prostory.html` | popis odpovídá *projektu*, ne současnému stavu |
| Kapacity 30 / 4 osoby | více míst | odhad |
| Provoz 7:00–22:00 | více míst | odhad |
| Storno 48 h, potvrzení do 12 h, vstup na kód | více míst | navržená pravidla |
| `rezervace@studiotakt.cz`, `+420 XXX XXX XXX` | zápatí, `kontakt.html` | zástupné |
| Doba chůze od Můstku / tramvají | `kontakt.html` | odhad |

Na webu je to přiznané: šedé rámečky **„Ukázka“** u rezervace, kontaktního
formuláře, mapy a u řady partnerských log.

**Adresa se na webu neuvádí.** Skutečné umístění zůstává mimo web na vaše
přání — stránky mluví jen o Praze a zápatí nese zástupnou adresu.

---

## Právní / etické poznámky

- Sekce o historii domu i věta o nezávislém nájemci jsou z webu pryč. Kdyby
  se adresa někdy zveřejnila, vraťte i upozornění, že studio s bankou
  sídlící v domě nijak nesouvisí.
- Fotografie mají **odstřižené vodoznaky inzertního serveru**. Pro veřejný web
  je potřeba mít k nim práva, nebo si nechat nafotit vlastní.
- Logo Simply the West je použité v barevné i **jednobarevné (výseková) verzi**
  (`assets/img/partner-simplythewest-mono.png`, vytvořená z podkladu
  v `context/`). Před spuštěním si vyžádejte souhlas s použitím a ideálně
  originál ve vektoru.
- Volná místa v pásu partnerů jsou popsaná jako **„Volné místo pro školu“** —
  žádné vymyšlené školy tam nejsou.

---

## Co změnit nejdřív

1. **Název studia** — je v `<title>`, v hlavičce (`.mark`), v zápatí a v textech.
2. **Ceny** — hlavní zdroj je `STUDIO.halls` v `assets/js/rozvrh.js`; tabulky
   v HTML jsou zvlášť, aby fungovaly i bez JavaScriptu. Seznam všech míst
   je v komentáři nad `STUDIO`.
3. **Kontakty** — `rezervace@studiotakt.cz` a `+420 XXX XXX XXX` v zápatí všech
   stránek a v `kontakt.html`.
4. **Mapa** — `kontakt.html` má zástupný plánek. Vložení mapy třetí strany
   znamená načítání z cizího serveru a řešení cookies.
5. **Provozní hodiny a tarify** — `openFrom`, `openTo`, `peakFrom`
   v `assets/js/rozvrh.js`.

---

## Technické

- Bez buildu, bez frameworku, bez závislostí.
- Písma z Google Fonts, všechna s podporou `latin-ext` (české diakritiky).
- Fotky jsou WebP, jednobarevné logo PNG s průhledností.
- Responzivní od 320 px; rozvrh mění počet zobrazených dní podle šířky.
- Přístupnost: jeden `<h1>` na stránku, popisky u všech ovládacích prvků,
  `alt` u všech obrázků, viditelný focus, respektuje
  `prefers-reduced-motion`, odkaz „Přeskočit na obsah“.
- Ověřeno v Chromiu na 390 / 700 / 1440 px.
