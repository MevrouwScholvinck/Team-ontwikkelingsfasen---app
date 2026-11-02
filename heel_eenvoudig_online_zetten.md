# Heel eenvoudige stappen

## 1. Supabase
- Maak een project.
- Zet **Anonymous Sign-ins** aan.
- Open **SQL Editor**.
- Run `supabase/schema.sql`.

## 2. GitHub
- Maak een nieuwe repository.
- Upload alle bestanden uit deze map.

## 3. Vercel
- Log in met GitHub.
- Importeer de repository.
- Voeg 2 environment variables toe:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Klik op **Deploy**.

## 4. Brightspace
- Kopieer de Vercel-link.
- Maak in Brightspace een knop of link.
- Plak daar de Vercel-link achter.

## 5. In de app
- Docent maakt een ronde aan.
- Studenten klikken op **Start als student**.
- Studenten vullen individueel in.
- Daarna verschijnt het groepsdashboard.
