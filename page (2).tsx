"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { hasSupabaseConfig, supabase } from "../../lib/supabase";

const defaultSizes = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };

function randomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function TeacherPage() {
  const [title, setTitle] = useState("Ontwikkelingsfasen projectgroep");
  const [code, setCode] = useState(randomCode());
  const [groupSizes, setGroupSizes] = useState(defaultSizes);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const totalExpected = useMemo(
    () => Object.values(groupSizes).reduce((sum, value) => sum + Number(value || 0), 0),
    [groupSizes]
  );

  async function createRound() {
    if (!supabase) {
      setMessage("Supabase-instellingen ontbreken. Voeg eerst de 2 Vercel environment variables toe.");
      return;
    }

    setBusy(true);
    setMessage("");

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      const signInResult = await supabase.auth.signInAnonymously();
      if (signInResult.error) {
        setMessage(`Inloggen mislukt: ${signInResult.error.message}`);
        setBusy(false);
        return;
      }
    }

    const { error } = await supabase.from("rounds").insert({
      code,
      title,
      group_sizes: groupSizes,
      created_by: (await supabase.auth.getUser()).data.user?.id ?? null
    });

    if (error) {
      setMessage(`Opslaan mislukt: ${error.message}`);
    } else {
      setMessage(`Gelukt. Deel deze rondecode met studenten: ${code}`);
      setCode(randomCode());
    }

    setBusy(false);
  }

  return (
    <main className="page">
      <section className="hero">
        <div className="badge">Docent</div>
        <h1>Nieuwe ronde maken</h1>
        <p>
          Maak een ronde aan en geef per groep aan hoeveel studenten je verwacht.
          Studenten gebruiken daarna de rondecode om mee te doen.
        </p>
      </section>

      {!hasSupabaseConfig && (
        <div className="notice error" style={{ marginBottom: 20 }}>
          Deze app mist nog de Vercel-variabelen <strong>NEXT_PUBLIC_SUPABASE_URL</strong> en{" "}
          <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY</strong>.
        </div>
      )}

      <section className="grid two">
        <div className="card stack">
          <div>
            <label>Titel van de ronde</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div>
            <label>Rondecode</label>
            <div className="row">
              <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
              <button type="button" className="ghost" onClick={() => setCode(randomCode())}>
                Nieuwe code
              </button>
            </div>
          </div>

          <div className="grid two">
            {["1", "2", "3", "4", "5"].map((group) => (
              <div key={group}>
                <label>Verwacht aantal in groep {group}</label>
                <input
                  type="number"
                  min="0"
                  value={groupSizes[group as keyof typeof groupSizes]}
                  onChange={(e) =>
                    setGroupSizes((prev) => ({
                      ...prev,
                      [group]: Number(e.target.value || 0)
                    }))
                  }
                />
              </div>
            ))}
          </div>

          <div className="notice">
            Totaal verwacht aantal studenten: <strong>{totalExpected}</strong>
          </div>

          <div className="row">
            <button onClick={createRound} disabled={busy}>
              {busy ? "Bezig..." : "Ronde aanmaken"}
            </button>
            <Link href="/">
              <button className="secondary" type="button">Terug</button>
            </Link>
          </div>

          {message && <div className="notice success">{message}</div>}
        </div>

        <div className="card stack">
          <h2>Wat je daarna doet</h2>
          <ol className="outputList">
            <li>Noteer of kopieer de rondecode.</li>
            <li>Deel de link van de app via Brightspace.</li>
            <li>Laat studenten kiezen voor <strong>Start als student</strong>.</li>
            <li>Studenten vullen de rondecode, hun groep en beginletters in.</li>
            <li>Na alle individuele invoer verschijnt het dashboard per groep.</li>
          </ol>

          <div className="notice warn">
            Tip: zet in Brightspace een knop met tekst zoals <strong>Start ontwikkelingsfasen app</strong>.
          </div>
        </div>
      </section>
    </main>
  );
}
