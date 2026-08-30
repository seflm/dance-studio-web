# Podkres hero sekce

Sem patří **`hero.mp4`** — video, které běží na pozadí úvodní sekce.

Na co si dát pozor:

- **Bez zvuku.** Přehrává se automaticky, takže musí být ztlumené; zvukovou
  stopu klidně z souboru rovnou vyhoďte, ušetří místo.
- **Černobílé být nemusí** — filtr `grayscale(1)` na `.hero__vid` to udělá za vás.
- **Velikost.** Cílem je nejvýš pár MB. 1280 px na šířku bohatě stačí, video
  je pod tmavým přechodem a textem.
- **Délka.** `index.html` má na `.hero__bg` atributy `data-from="20"`
  a `data-to="140"` — přehrává se tedy úsek 0:20–2:20 dokola. Když soubor
  sestříháte předem, oba atributy smažte a video se bude cyklit samo.

Jiný název nebo formát? Stačí přepsat `data-video` na `.hero__bg`.

Dokud soubor neexistuje, hero ukazuje tři vizualizace sálu — stejně jako když
se video nepodaří přehrát.
