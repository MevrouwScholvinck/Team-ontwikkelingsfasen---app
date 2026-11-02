# Ontwikkelingsfasen App v2

Dit is een nieuwe, opgeschoonde versie van de app die geschikt is voor:

- **Vercel**
- **Supabase**
- **Brightspace via een knop/link**

## Wat is verbeterd

- schonere Next.js-structuur
- geen onnodige middleware of servercode
- werkt met **anonymous sign-in** in Supabase
- docent kan zelf een ronde aanmaken
- studenten vullen individueel in
- dashboard toont alle ingevulde antwoorden van de groep
- groep kiest daarna samen per aspect **A / B / C**
- daarna volgt een actieplan, checklist en scrumbord-overzicht

## Mappen

- `app/` → pagina's
- `lib/` → data, types en Supabase helper
- `supabase/schema.sql` → database-tabellen en rechten

## Supabase instellen

1. Maak een Supabase-project.
2. Zet **Anonymous sign-ins** aan.
3. Open **SQL Editor**.
4. Voer `supabase/schema.sql` uit.

## Lokaal testen

Maak een `.env.local` bestand op basis van `.env.example` en vul in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://jouw-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=jouw_publishable_key
```

Daarna:

```bash
npm install
npm run dev
```

Open dan `http://localhost:3000`.

## Deploy op Vercel

Voeg in Vercel deze 2 environment variables toe:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Daarna op **Deploy** klikken.

## Brightspace

Als Vercel klaar is, krijg je een link zoals:

`https://jouw-app.vercel.app`

Die link plak je in Brightspace achter een knop, bijvoorbeeld:

**Start ontwikkelingsfasen app**
