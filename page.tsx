"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <div className="badge">Brightspace-ready webapp</div>
        <h1>Ontwikkelingsfasen in een projectgroep</h1>
        <p>
          Studenten vullen eerst individueel in waar hun groep nu staat en waar zij
          individueel naartoe willen. Zodra alle groepsleden klaar zijn, zien zij
          een groepsdashboard, kiezen zij samen per aspect A, B of C en maken zij
          concrete afspraken voor het scrumbord.
        </p>
      </section>

      <section className="grid two">
        <div className="card stack">
          <h2>Voor studenten</h2>
          <p className="small">
            Vul je rondecode, groep en beginletters in. Geef per aspect aan waar
            jullie nu staan en waar jij individueel naartoe wilt. Bekijk daarna met
            je groep het dashboard en maak samen keuzes.
          </p>
          <Link href="/student">
            <button>Start als student</button>
          </Link>
        </div>

        <div className="card stack">
          <h2>Voor docenten</h2>
          <p className="small">
            Maak een ronde aan, kies hoeveel studenten je per groep verwacht en
            deel de rondecode met de klas. Studenten gebruiken die code om mee te
            doen.
          </p>
          <Link href="/teacher">
            <button className="secondary">Start als docent</button>
          </Link>
        </div>
      </section>

      <section className="card stack" style={{ marginTop: 24 }}>
        <h2>Wat deze app doet</h2>
        <ul className="outputList">
          <li>individuele invoer per student</li>
          <li>groep 1 t/m 5 en beginletters</li>
          <li>live overzicht van ieders antwoorden binnen de groep</li>
          <li>gezamenlijke groepskeuze per aspect: A, B of C</li>
          <li>actieplan met wat, hoe, waar, wanneer, wie en scrumbord-verantwoordelijke</li>
          <li>eindoutput met checklist en scrumbord-overzicht</li>
        </ul>
      </section>
    </main>
  );
}
