# SkočDál — Klientský briefing

Vlastní webová aplikace pro onboarding klienta, tvorbu Brand DNA, zadání webu a zjištění potřeb dlouhodobé správy.

## Co umí

- 8krokový responzivní briefing v identitě SkočDál
- autosave do `localStorage`
- AI Brand DNA z celého briefingu přes OpenAI Responses API
- strukturovaný výstup: positioning, cílovky, hodnoty, archetyp, tone of voice, headline, struktura webu, CTA, SEO témata, marketing a správa
- automatická e-mailová kopie na SkočDál přes Resend
- volitelná serverová záloha do Supabase
- tisk / PDF, kopírování a JSON export
- žádné API klíče ve frontendu

## 1. Lokální spuštění

```bash
npm install
cp .env.example .env.local
npm run dev
```

Aplikace poběží na `http://localhost:3000`.

## 2. OpenAI — AI Brand DNA

V `.env.local` nastav:

```env
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5
```

Model lze změnit bez zásahu do kódu pomocí `OPENAI_MODEL`.

## 3. Resend — e-mailová záloha

Vytvoř účet v Resend, ověř doménu `skocdal.cz` a nastav:

```env
RESEND_API_KEY=...
RESEND_FROM=SkočDál Briefing <briefing@skocdal.cz>
BRIEFING_RECIPIENT_EMAIL=petr.holec13@gmail.com
```

Pro první test může Resend používat testovacího odesílatele, ale pro ostrý provoz použij ověřenou doménu.

## 4. Supabase — volitelná databázová záloha

1. Založ Supabase projekt.
2. V SQL editoru spusť `supabase.sql`.
3. Do `.env.local` přidej:

```env
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Service-role klíč patří **pouze na server** a nikdy se nesmí dát do `NEXT_PUBLIC_*` proměnné.

Aplikace funguje i bez Supabase: odpovědi se drží lokálně a e-mail může fungovat samostatně.

## 5. Git

```bash
git init
git add .
git commit -m "Initial SkočDál client briefing"
git branch -M main
git remote add origin <URL_TVEHO_REPOZITARE>
git push -u origin main
```

`.env.local` je v `.gitignore`, takže klíče se do repozitáře neodešlou.

## 6. Nasazení

Nejjednodušší je připojit GitHub repozitář k Vercelu a v Project Settings → Environment Variables nastavit stejné proměnné jako v `.env.local`.

## Brand

Použité barvy:

- Jump Yellow `#FFD400`
- Near Black `#111111`
- Warm White `#F7F6F1`
- Graphite `#292929`
- Digital Gold `#E8B923` pouze doplňkově

Logo assety jsou v `public/logo-full.png` a `public/logo-symbol.png`.
