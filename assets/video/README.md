# Podkres hero sekce

`hero.mp4` – video na pozadí úvodní sekce. Odkazuje se na něj atribut
`data-video` na `.hero__bg` v `index.html`.

## Jak vzniklo

Zdroj je `../videos/video_original.mp4` (1280×720, H.264, 2:59, se zvukem).
Z něj se vyřízne úsek **0:20–2:20**, zahodí zvuk, převede do šedé a znovu
zakóduje:

```sh
ffmpeg -ss 20 -t 120 -i assets/videos/video_original.mp4 \
  -an -vf "format=gray,format=yuv420p" \
  -c:v libx264 -profile:v high -crf 26 -preset slow -tune film -g 50 \
  -movflags +faststart assets/video/hero.mp4
```

Výsledek: 18,0 MB, 1253 kb/s, 2:00.

## Proč zrovna takhle

- **H.264, ne H.265.** První verze souboru byla HEVC – tu Chrome na většině
  platforem a Firefox vůbec nepřehrají a hero by u nich zůstal na fotkách.
- **Jedno video, žádný WebM.** VP9 jsme změřili vedle: při stejné kvalitě
  vyšel větší (10,5 MB proti 8,7 MB), takže by stál místo v repu za nic.
- **Šedotón přímo v souboru.** Šedá se stejně aplikuje filtrem v CSS, ale
  když se zahodí barva už při kódování, soubor je znatelně menší.
- **Bez zvuku.** Přehrává se automaticky, takže musí být ztlumené – stopa
  by se jen vezla.
- **CRF 26.** Na CRF 33 (8,7 MB) se na rychlém pohybu objevovaly duchy
  a obličeje v publiku se rozpadaly – vypadalo to měkčeji, než jaký je
  zdroj. CRF 26 je od zdroje k nerozeznání; CRF 22 už jen zvětší soubor
  na 28 MB bez viditelného rozdílu. Menší varianty, kdyby bylo potřeba:
  CRF 30 ≈ 12 MB, CRF 33 ≈ 8,7 MB.
- **Strop je rozlišení zdroje.** Video je 1280×720. Na monitoru širokém
  2560 px se roztahuje na dvojnásobek, takže i dokonale zakódované bude
  působit měkce. Ostřejší to bude jedině z ostřejšího zdroje (1440p+).
- **Načítá se až po zbytku stránky.** `takt.js` čeká na `window.load`
  a pak na `requestIdleCallback` – dokud se video nestáhne, hero ukazuje
  fotky, takže na rychlost načtení stránky nemá vliv.

## Když budete měnit

Sestříhaný soubor se cyklí sám. Kdybyste chtěli jiný úsek bez stříhání,
vraťte na `.hero__bg` atributy `data-from` a `data-to` (v sekundách) –
`takt.js` si smyčku pohlídá sám.

Dokud soubor neexistuje nebo se nepřehraje, hero ukazuje tři vizualizace
sálu. Totéž platí, když prohlížeč odmítne autoplay nebo má návštěvník
zapnuté šetření dat.
