# [FIRMENNAME] – Landingpage

Statische Landingpage plus Rechtsseiten für ein Entrümpelungsunternehmen in
Pongau, Pinzgau und Tennengau (Bundesland Salzburg). Reines HTML, CSS und
Vanilla JavaScript – **kein Framework, kein Build-Step, keine Cookies, kein
Tracking, keine externen Skripte**.

---

## Inhalt

| Datei | Zweck |
|-------|-------|
| `index.html` | Startseite (Hero, Leistungen, Ablauf, Preise, Hausverwaltungen, Vertrauen, FAQ, Kontakt) |
| `impressum.html` | Impressum nach § 5 ECG und § 25 MedienG |
| `datenschutz.html` | Datenschutzerklärung nach DSGVO |
| `style.css` | Gesamtes Styling, mobile first, responsive |
| `script.js` | Sticky-Header, Mobile-Nav, Reveal-on-Scroll, Formularvalidierung/-versand |
| `robots.txt` | Suchmaschinen-Freigabe + Sitemap-Verweis |
| `sitemap.xml` | XML-Sitemap |
| `assets/favicon.svg` | Favicon |
| `fonts/` | Ablageort für optionale, selbst gehostete Schriften |

---

## Schnellstart (lokal ansehen)

Einfach `index.html` im Browser öffnen. Für saubere absolute Pfade
(`/style.css` etc.) empfiehlt sich ein kleiner lokaler Server, z. B.:

```bash
python -m http.server 8000
```

Danach `http://localhost:8000` aufrufen.

---

## ⚠️ Vor dem Livegang: Platzhalter ersetzen

Alle noch auszufüllenden Stellen sind mit `[PLATZHALTER]` bzw. `[...]`
markiert. Suchen Sie im gesamten Projekt nach `[` und ersetzen Sie:

| Platzhalter | Bedeutung |
|-------------|-----------|
| `[FIRMENNAME]` | Firmenwortlaut |
| `[VORNAME NACHNAME]` | Inhaber |
| `[DOMAIN]` | Domain **ohne** `https://`, z. B. `entruempelung-muster.at` |
| `[TELEFON]` | Telefonnummer in Anzeigeform, z. B. `+43 660 1234567` |
| `[TELEFON-CLEAN]` | dieselbe Nummer für `tel:`-Links **ohne Leerzeichen**, z. B. `+436601234567` |
| `[E-MAIL]` | E-Mail-Adresse |
| `[KONTAKT]` | Kontakt für Fotos (z. B. WhatsApp-Link `https://wa.me/436601234567` oder `mailto:`-Adresse) |
| `[STRASSE HAUSNUMMER]`, `[PLZ]`, `[ORT]` | Anschrift |
| `[GISA-ZAHL]` | GISA-Zahl aus dem Gewerberegister |
| `[UID falls vorhanden]` | UID-Nummer – falls keine vorhanden, den Eintrag im Impressum entfernen |
| `[PREIS]` | Richtpreise in der Preistabelle |
| `[FORMSPREE-ENDPOINT]` | Formspree-Endpoint (siehe unten) |
| `[PLATZHALTER: ...]` | diverse Detailangaben in Impressum/Datenschutz (Fachgruppe, Hoster, Speicherdauer, Stand-Datum …) |

> Tipp: In VS Code mit **Suchen & Ersetzen im Ordner** (Strg+Umschalt+H)
> arbeiten. Jeden Platzhalter einzeln prüfen, da manche in mehreren Dateien
> vorkommen.

Prüfen Sie zusätzlich in `index.html`:
- Ob die Preisangaben **netto oder brutto** sind (Platzhalter im Preis-Hinweis).
- Die `og:image`-Datei: legen Sie ein Bild unter `assets/og-image.jpg`
  (empfohlen 1200 × 630 px) ab oder entfernen Sie die OG-Image-Zeilen.
- `assets/apple-touch-icon.png` (180 × 180 px) ergänzen oder die Zeile entfernen.

---

## Kontaktformular mit Formspree einrichten

Das Formular sendet ohne Seitenwechsel per `fetch` an
[Formspree](https://formspree.io) (kostenloser Plan genügt für den Start).

1. Konto auf **formspree.io** anlegen.
2. Neues Formular erstellen; Formspree liefert einen Endpoint der Form
   `https://formspree.io/f/xxxxxxxx`.
3. In `index.html` das Attribut `action="[FORMSPREE-ENDPOINT]"` des
   `<form id="contact-form">` durch diesen Endpoint ersetzen.
4. Erste Testabsendung durchführen und in Formspree die E-Mail-Adresse
   bestätigen.

**Spamschutz:** Ein Honeypot-Feld (`_gotcha`) ist bereits eingebaut. Solange
der Endpoint noch ein Platzhalter ist, zeigt das Formular einen Hinweis statt
zu senden.

**Alternative ohne Formspree:** Wer keinen Drittanbieter möchte, kann das
`<form>` auf einen `mailto:`-Versand umstellen – dann entfällt der Komfort der
Ajax-Rückmeldung. Bei Bedarf hier nachfragen.

---

## Optional: eigene Schrift selbst hosten

Standardmäßig nutzt die Seite einen System-Font-Stack – das ist am schnellsten
und erzeugt **keinen externen Request** (gut für Lighthouse und Datenschutz).

Für eine eigene Marken-Schrift:

1. WOFF2-Dateien (nur selbst gehostete, lizenzkonforme Schriften!) nach
   `fonts/` legen.
2. In `style.css` den auskommentierten `@font-face`-Block aktivieren und die
   Dateinamen anpassen.
3. In `:root` die Variable `--font-sans` auf die neue Schrift setzen, z. B.
   `--font-sans: "Marke", system-ui, sans-serif;`.

Keine Google-Fonts-CDN einbinden – das würde ein Cookie-/Datenschutz-Thema
eröffnen.

---

## Veröffentlichen über GitHub + Vercel

### 1. Git-Repository initialisieren (lokal)

Im Projektordner:

```bash
git init
git add .
git commit -m "Initiale Landingpage"
git branch -M main
```

### 2. GitHub-Repository verbinden

Neues, **leeres** Repository auf github.com anlegen (ohne README/‌.gitignore),
dann:

```bash
git remote add origin https://github.com/[GITHUB-BENUTZER]/[REPO-NAME].git
git push -u origin main
```

### 3. Auf Vercel deployen

1. Auf [vercel.com](https://vercel.com) mit dem GitHub-Konto anmelden.
2. **Add New… → Project** und das eben gepushte Repository importieren.
3. Vercel erkennt ein statisches Projekt automatisch:
   - **Framework Preset:** *Other*
   - **Build Command:** leer lassen
   - **Output Directory:** leer lassen (Root wird direkt ausgeliefert)
4. **Deploy** klicken – nach wenigen Sekunden ist die Seite unter einer
   `*.vercel.app`-Adresse online.

Jeder weitere `git push` auf `main` löst automatisch ein neues Deployment aus.

### 4. Eigene Domain verbinden

In Vercel unter **Settings → Domains** die eigene Domain hinzufügen und die
angezeigten DNS-Einträge (A- bzw. CNAME-Record) beim Domain-Anbieter setzen.
Danach in allen Dateien `[DOMAIN]` durch die echte Domain ersetzen
(insbesondere `canonical`, Open Graph, `robots.txt`, `sitemap.xml`,
JSON-LD `@id`/`url`).

---

## Qualität & Technik

- **Semantisches HTML**, genau eine `<h1>` pro Seite, ARIA-Labels wo nötig.
- **Mobile first**, responsive über `@media`-Breakpoints.
- **Barrierefreiheit:** Skip-Link, sichtbarer Fokus, Tastaturbedienung der
  Navigation, `prefers-reduced-motion` wird respektiert.
- **Performance:** keine externen Ressourcen, Inline-SVG-Icons, `defer`-Skript.
  Lighthouse-Ziel > 95 in allen Kategorien.
- **SEO:** sprechende Titles/Descriptions, Open Graph, JSON-LD
  `LocalBusiness` mit `areaServed` für Pongau, Pinzgau und Tennengau,
  Sitemap und robots.txt.
- **Datenschutz:** keine Cookies, kein Tracking → **kein Cookie-Banner nötig**.

---

## Lizenzhinweis

Die Beispieltexte und der Code können frei für dieses Unternehmen verwendet und
angepasst werden. Für eingebundene eigene Schriften und Bilder ist auf die
jeweilige Lizenz zu achten.
