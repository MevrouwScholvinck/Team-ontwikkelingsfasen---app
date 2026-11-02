"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ASPECTS } from "../../lib/aspects";
import type { ActionPlan, Choice, GroupDecision, ResponseRow, Round, StudentProfile } from "../../lib/types";
import { hasSupabaseConfig, supabase } from "../../lib/supabase";

type AnswerMap = Record<string, { current: Choice; desired: Choice }>;
type PlanMap = Record<
  string,
  {
    decision: Choice;
    what_text: string;
    how_text: string;
    where_text: string;
    when_text: string;
    who_text: string;
    scrum_owner: string;
  }
>;

const emptyAnswers = ASPECTS.reduce((acc, aspect) => {
  acc[aspect.key] = { current: "A" as Choice, desired: "A" as Choice };
  return acc;
}, {} as AnswerMap);

const emptyPlans = ASPECTS.reduce((acc, aspect) => {
  acc[aspect.key] = {
    decision: "A" as Choice,
    what_text: "",
    how_text: "",
    where_text: "",
    when_text: "",
    who_text: "",
    scrum_owner: ""
  };
  return acc;
}, {} as PlanMap);

export default function StudentPage() {
  const [roundCode, setRoundCode] = useState("");
  const [groupNumber, setGroupNumber] = useState("1");
  const [initials, setInitials] = useState("");
  const [round, setRound] = useState<Round | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>(emptyAnswers);
  const [groupRows, setGroupRows] = useState<(ResponseRow & { initials?: string })[]>([]);
  const [decisions, setDecisions] = useState<Record<string, Choice>>({});
  const [plans, setPlans] = useState<PlanMap>(emptyPlans);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  const expectedCount = useMemo(() => {
    if (!round) return 0;
    return Number(round.group_sizes?.[groupNumber] || 0);
  }, [round, groupNumber]);

  const groupedMembers = useMemo(() => {
    const map = new Map<string, { initials: string; rows: (ResponseRow & { initials?: string })[] }>();
    for (const row of groupRows) {
      const key = row.user_id;
      if (!map.has(key)) {
        map.set(key, { initials: row.initials || "?", rows: [] });
      }
      map.get(key)!.rows.push(row);
    }
    return Array.from(map.values()).map((item) => ({
      initials: item.initials,
      completed: item.rows.length === ASPECTS.length,
      rows: item.rows
    }));
  }, [groupRows]);

  const everyoneCompleted = expectedCount > 0 && groupedMembers.length >= expectedCount && groupedMembers.every((m) => m.completed);

  const checklistItems = useMemo(() => {
    return ASPECTS.map((aspect) => {
      const plan = plans[aspect.key];
      if (!plan?.what_text) return null;
      return `${aspect.title}: ${plan.what_text} | Hoe: ${plan.how_text} | Waar: ${plan.where_text} | Wanneer: ${plan.when_text} | Wie: ${plan.who_text}`;
    }).filter(Boolean) as string[];
  }, [plans]);

  const scrumboardItems = useMemo(() => {
    return ASPECTS.map((aspect) => {
      const plan = plans[aspect.key];
      if (!plan?.what_text) return null;
      return `${aspect.title} – ${plan.what_text} | Wanneer: ${plan.when_text} | In scrumbord zetten door: ${plan.scrum_owner}`;
    }).filter(Boolean) as string[];
  }, [plans]);

  useEffect(() => {
    if (!everyoneCompleted || !round) return;
    loadDecisionAndPlans(round.id, Number(groupNumber));
  }, [everyoneCompleted, round, groupNumber]);

  async function ensureSession() {
    if (!supabase) return null;
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) return sessionData.session;
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    return data.session;
  }

  async function connectStudent() {
    if (!supabase) {
      setMessage("Supabase-instellingen ontbreken. Vraag of de beheerder de Vercel-variabelen invult.");
      return;
    }
    if (!roundCode.trim() || !initials.trim()) {
      setMessage("Vul eerst de rondecode en je beginletters in.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const session = await ensureSession();
      const userId = session?.user.id;
      const { data: roundData, error: roundError } = await supabase
        .from("rounds")
        .select("*")
        .eq("code", roundCode.trim().toUpperCase())
        .single();

      if (roundError || !roundData) {
        throw new Error("Ronde niet gevonden. Controleer de rondecode.");
      }

      const { error: profileError } = await supabase.from("student_profiles").upsert(
        {
          id: userId,
          round_id: roundData.id,
          group_number: Number(groupNumber),
          initials: initials.trim().toUpperCase()
        },
        { onConflict: "id" }
      );

      if (profileError) throw profileError;

      setRound(roundData as Round);
      setProfile({
        id: userId || "",
        round_id: roundData.id,
        group_number: Number(groupNumber),
        initials: initials.trim().toUpperCase(),
        updated_at: new Date().toISOString()
      });

      localStorage.setItem("ontwikkelingsfasen:lastRoundCode", roundCode.trim().toUpperCase());
      localStorage.setItem("ontwikkelingsfasen:lastGroup", groupNumber);
      localStorage.setItem("ontwikkelingsfasen:lastInitials", initials.trim().toUpperCase());

      await loadGroupData(roundData.id, Number(groupNumber));
      setMessage("Gelukt. Je bent gekoppeld aan de ronde.");
    } catch (error: any) {
      setMessage(error.message || "Koppelen mislukt.");
    } finally {
      setBusy(false);
    }
  }

  async function saveAnswers() {
    if (!supabase || !round || !profile) return;
    setBusy(true);
    setMessage("");
    try {
      const rows = ASPECTS.map((aspect) => ({
        round_id: round.id,
        user_id: profile.id,
        group_number: Number(groupNumber),
        aspect_key: aspect.key,
        current_choice: answers[aspect.key].current,
        desired_choice: answers[aspect.key].desired
      }));

      const { error } = await supabase.from("responses").upsert(rows, {
        onConflict: "round_id,user_id,aspect_key"
      });

      if (error) throw error;
      await loadGroupData(round.id, Number(groupNumber));
      setMessage("Jouw antwoorden zijn opgeslagen.");
    } catch (error: any) {
      setMessage(error.message || "Opslaan mislukt.");
    } finally {
      setBusy(false);
    }
  }

  async function loadGroupData(roundId: string, group: number) {
    if (!supabase) return;
    const [responsesRes, profilesRes] = await Promise.all([
      supabase.from("responses").select("*").eq("round_id", roundId).eq("group_number", group),
      supabase.from("student_profiles").select("*").eq("round_id", roundId).eq("group_number", group)
    ]);

    if (!responsesRes.error && !profilesRes.error) {
      const profileMap = new Map((profilesRes.data || []).map((p) => [p.id, p.initials]));
      const merged = (responsesRes.data || []).map((row) => ({
        ...(row as ResponseRow),
        initials: profileMap.get(row.user_id) || "?"
      }));
      setGroupRows(merged);
    }
  }

  async function loadDecisionAndPlans(roundId: string, group: number) {
    if (!supabase) return;
    const [decisionRes, planRes] = await Promise.all([
      supabase.from("group_decisions").select("*").eq("round_id", roundId).eq("group_number", group),
      supabase.from("action_plans").select("*").eq("round_id", roundId).eq("group_number", group)
    ]);

    if (!decisionRes.error) {
      const next: Record<string, Choice> = {};
      for (const row of (decisionRes.data || []) as GroupDecision[]) {
        next[row.aspect_key] = row.selected_choice;
      }
      setDecisions(next);
    }

    if (!planRes.error) {
      const nextPlans = { ...emptyPlans };
      for (const row of (planRes.data || []) as ActionPlan[]) {
        nextPlans[row.aspect_key] = {
          decision: row.decision_choice,
          what_text: row.what_text || "",
          how_text: row.how_text || "",
          where_text: row.where_text || "",
          when_text: row.when_text || "",
          who_text: row.who_text || "",
          scrum_owner: row.scrum_owner || ""
        };
      }
      setPlans(nextPlans);
    }
  }

  async function saveDecision(aspectKey: string) {
    if (!supabase || !round) return;
    setBusy(true);
    setMessage("");
    try {
      const { error } = await supabase.from("group_decisions").upsert(
        {
          round_id: round.id,
          group_number: Number(groupNumber),
          aspect_key: aspectKey,
          selected_choice: decisions[aspectKey] || "A"
        },
        { onConflict: "round_id,group_number,aspect_key" }
      );
      if (error) throw error;
      setMessage("Groepskeuze opgeslagen.");
    } catch (error: any) {
      setMessage(error.message || "Opslaan van groepskeuze mislukt.");
    } finally {
      setBusy(false);
    }
  }

  async function savePlan(aspectKey: string) {
    if (!supabase || !round) return;
    setBusy(true);
    setMessage("");
    try {
      const plan = plans[aspectKey];
      const { error } = await supabase.from("action_plans").upsert(
        {
          round_id: round.id,
          group_number: Number(groupNumber),
          aspect_key: aspectKey,
          decision_choice: decisions[aspectKey] || plan.decision,
          what_text: plan.what_text,
          how_text: plan.how_text,
          where_text: plan.where_text,
          when_text: plan.when_text,
          who_text: plan.who_text,
          scrum_owner: plan.scrum_owner
        },
        { onConflict: "round_id,group_number,aspect_key" }
      );
      if (error) throw error;
      setMessage("Actieplan opgeslagen.");
    } catch (error: any) {
      setMessage(error.message || "Opslaan van actieplan mislukt.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    setRoundCode(localStorage.getItem("ontwikkelingsfasen:lastRoundCode") || "");
    setGroupNumber(localStorage.getItem("ontwikkelingsfasen:lastGroup") || "1");
    setInitials(localStorage.getItem("ontwikkelingsfasen:lastInitials") || "");
  }, []);

  useEffect(() => {
    if (!round || !profile) return;
    const timer = setInterval(() => {
      loadGroupData(round.id, Number(groupNumber));
      setRefreshTick((v) => v + 1);
    }, 10000);
    return () => clearInterval(timer);
  }, [round, groupNumber, profile]);

  return (
    <main className="page">
      <section className="hero">
        <div className="badge">Student</div>
        <h1>Individueel invullen en daarna samen kiezen</h1>
        <p>
          Vul eerst in waar jullie groep nu staat en waar jij individueel naartoe
          wilt. Zodra iedereen in jouw groep klaar is, verschijnt het dashboard en
          kunnen jullie samen per aspect kiezen voor A, B of C.
        </p>
      </section>

      {!hasSupabaseConfig && (
        <div className="notice error" style={{ marginBottom: 20 }}>
          Deze app mist nog de Vercel-variabelen <strong>NEXT_PUBLIC_SUPABASE_URL</strong> en{" "}
          <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY</strong>.
        </div>
      )}

      <section id="koppelen" className="card stack sectionAnchor">
        <div className="row between">
          <h2>1. Koppel jezelf aan een ronde</h2>
          <Link href="/">
            <button className="secondary" type="button">Terug</button>
          </Link>
        </div>

        <div className="grid three">
          <div>
            <label>Rondecode</label>
            <input value={roundCode} onChange={(e) => setRoundCode(e.target.value.toUpperCase())} />
          </div>
          <div>
            <label>Groep</label>
            <select value={groupNumber} onChange={(e) => setGroupNumber(e.target.value)}>
              {["1", "2", "3", "4", "5"].map((group) => (
                <option key={group} value={group}>Groep {group}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Beginletter(s)</label>
            <input value={initials} onChange={(e) => setInitials(e.target.value.toUpperCase())} />
          </div>
        </div>

        <div className="row">
          <button onClick={connectStudent} disabled={busy}>
            {busy ? "Bezig..." : "Koppelen"}
          </button>
          {round && (
            <div className="badge">
              Verwacht in groep {groupNumber}: {expectedCount}
            </div>
          )}
        </div>

        {message && <div className="notice">{message}</div>}
      </section>

      <section id="invullen" className="card stack sectionAnchor" style={{ marginTop: 22 }}>
        <h2>2. Individueel invullen</h2>
        <p className="small">
          Kies per aspect waar jouw groep nu staat en waar jij individueel naartoe wilt.
        </p>

        <div className="stack">
          {ASPECTS.map((aspect) => (
            <div className="aspectCard" key={aspect.key}>
              <h3>{aspect.title}</h3>
              <p className="small">{aspect.intro}</p>

              <div className="choiceGrid">
                <div className="choiceBox">
                  <label>Waar staat jullie groep nu volgens jou?</label>
                  <select
                    value={answers[aspect.key].current}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        [aspect.key]: { ...prev[aspect.key], current: e.target.value as Choice }
                      }))
                    }
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>

                <div className="choiceBox">
                  <label>Waar wil jij individueel naartoe?</label>
                  <select
                    value={answers[aspect.key].desired}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        [aspect.key]: { ...prev[aspect.key], desired: e.target.value as Choice }
                      }))
                    }
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>
              </div>

              <div className="choices">
                <div><strong>A:</strong> {aspect.phases.A}</div>
                <div><strong>B:</strong> {aspect.phases.B}</div>
                <div><strong>C:</strong> {aspect.phases.C}</div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={saveAnswers} disabled={!round || !profile || busy}>
          {busy ? "Bezig..." : "Mijn antwoorden opslaan"}
        </button>
      </section>

      <section id="dashboard" className="card stack sectionAnchor" style={{ marginTop: 22 }}>
        <div className="row between">
          <h2>3. Dashboard van jouw groep</h2>
          <button className="ghost" type="button" onClick={() => round && loadGroupData(round.id, Number(groupNumber))}>
            Gegevens verversen
          </button>
        </div>

        <div className="grid three">
          <div className="kpi">
            Verwacht aantal in groep
            <strong>{expectedCount || "-"}</strong>
          </div>
          <div className="kpi">
            Aantal zichtbare groepsleden
            <strong>{groupedMembers.length}</strong>
          </div>
          <div className="kpi">
            Laatste automatische check
            <strong style={{ fontSize: 18 }}>{refreshTick ? "Zojuist ververst" : "Nog niet"}</strong>
          </div>
        </div>

        {!everyoneCompleted ? (
          <div className="notice warn">
            Het dashboard voor groepskeuzes wordt volledig zichtbaar zodra alle verwachte
            groepsleden in jouw groep alle vragen hebben ingevuld.
          </div>
        ) : (
          <div className="notice success">
            Iedereen in deze groep heeft ingevuld. Jullie kunnen nu samen per aspect kiezen voor A, B of C.
          </div>
        )}

        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Voltooid?</th>
                {ASPECTS.map((aspect) => (
                  <th key={aspect.key}>{aspect.title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groupedMembers.length === 0 && (
                <tr>
                  <td colSpan={ASPECTS.length + 2}>Nog geen groepsgegevens zichtbaar.</td>
                </tr>
              )}
              {groupedMembers.map((member) => (
                <tr key={member.initials}>
                  <td>{member.initials}</td>
                  <td>{member.completed ? "Ja" : "Nog niet"}</td>
                  {ASPECTS.map((aspect) => {
                    const row = member.rows.find((item) => item.aspect_key === aspect.key);
                    return (
                      <td key={aspect.key}>
                        {row ? (
                          <div className="small">
                            Nu: <strong>{row.current_choice}</strong><br />
                            Wil: <strong>{row.desired_choice}</strong>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {everyoneCompleted && (
        <>
          <section id="kiezen" className="card stack sectionAnchor" style={{ marginTop: 22 }}>
            <h2>4. Kies samen per aspect A, B of C</h2>
            <p className="small">
              Bespreek wat jullie als groep willen en leg daarna per aspect de gezamenlijke keuze vast.
            </p>

            <div className="stack">
              {ASPECTS.map((aspect) => (
                <div className="aspectCard" key={aspect.key}>
                  <div className="row between">
                    <h3>{aspect.title}</h3>
                    <div className="row">
                      <select
                        value={decisions[aspect.key] || "A"}
                        onChange={(e) =>
                          setDecisions((prev) => ({ ...prev, [aspect.key]: e.target.value as Choice }))
                        }
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                      </select>
                      <button onClick={() => saveDecision(aspect.key)} disabled={busy}>
                        Opslaan
                      </button>
                    </div>
                  </div>

                  <div className="choices">
                    <div><strong>A:</strong> {aspect.phases.A}</div>
                    <div><strong>B:</strong> {aspect.phases.B}</div>
                    <div><strong>C:</strong> {aspect.phases.C}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="actieplan" className="card stack sectionAnchor" style={{ marginTop: 22 }}>
            <h2>5. Maak samen een concreet actieplan</h2>
            <div className="notice warn">
              <strong>Reminder:</strong> benoem bij <em>wanneer</em> altijd een duidelijke begin- en eindtijd.
              Zet de afspraken daarna ook in het <strong>scrumbord</strong>. Spreek af wie dat doet.
            </div>

            <div className="stack">
              {ASPECTS.map((aspect) => (
                <div className="aspectCard" key={aspect.key}>
                  <h3>{aspect.title}</h3>
                  <p className="small">
                    Gekozen groepsoptie: <strong>{decisions[aspect.key] || "-"}</strong>
                  </p>

                  <div className="grid two">
                    <div>
                      <label>Wat gaan jullie doen of wat gaat er gebeuren?</label>
                      <textarea
                        value={plans[aspect.key].what_text}
                        onChange={(e) =>
                          setPlans((prev) => ({
                            ...prev,
                            [aspect.key]: { ...prev[aspect.key], what_text: e.target.value }
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label>Hoe gaan jullie het doen of hoe verloopt de taak?</label>
                      <textarea
                        value={plans[aspect.key].how_text}
                        onChange={(e) =>
                          setPlans((prev) => ({
                            ...prev,
                            [aspect.key]: { ...prev[aspect.key], how_text: e.target.value }
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label>Waar vindt het plaats?</label>
                      <textarea
                        value={plans[aspect.key].where_text}
                        onChange={(e) =>
                          setPlans((prev) => ({
                            ...prev,
                            [aspect.key]: { ...prev[aspect.key], where_text: e.target.value }
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label>Wanneer doen jullie het? Noem een duidelijke begin- en eindtijd.</label>
                      <textarea
                        value={plans[aspect.key].when_text}
                        onChange={(e) =>
                          setPlans((prev) => ({
                            ...prev,
                            [aspect.key]: { ...prev[aspect.key], when_text: e.target.value }
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label>Wie doen mee of met wie ben je?</label>
                      <textarea
                        value={plans[aspect.key].who_text}
                        onChange={(e) =>
                          setPlans((prev) => ({
                            ...prev,
                            [aspect.key]: { ...prev[aspect.key], who_text: e.target.value }
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label>Wie zet dit in het scrumbord?</label>
                      <textarea
                        value={plans[aspect.key].scrum_owner}
                        onChange={(e) =>
                          setPlans((prev) => ({
                            ...prev,
                            [aspect.key]: { ...prev[aspect.key], scrum_owner: e.target.value }
                          }))
                        }
                      />
                    </div>
                  </div>

                  <button onClick={() => savePlan(aspect.key)} disabled={busy}>
                    Actieplan opslaan
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section id="output" className="card stack sectionAnchor" style={{ marginTop: 22 }}>
            <h2>6. Output: checklist en scrumbord</h2>

            <div className="grid two">
              <div className="card" style={{ boxShadow: "none", margin: 0 }}>
                <h3>Checklist van afgesproken stappen</h3>
                {checklistItems.length === 0 ? (
                  <p className="small">Vul eerst één of meer actieplannen in.</p>
                ) : (
                  <ul className="outputList">
                    {checklistItems.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="card" style={{ boxShadow: "none", margin: 0 }}>
                <h3>Wat in het scrumbord moet komen</h3>
                <div className="notice warn">
                  Zet deze afspraken ook echt in het scrumbord.
                </div>
                {scrumboardItems.length === 0 ? (
                  <p className="small">Nog geen scrumbord-items vastgelegd.</p>
                ) : (
                  <ul className="outputList">
                    {scrumboardItems.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        </>
      )}

      <div className="footerNav">
        <div className="inner">
          <a href="#koppelen">Koppelen</a>
          <a href="#invullen">Invullen</a>
          <a href="#dashboard">Dashboard</a>
          {everyoneCompleted && (
            <>
              <a href="#kiezen">Kiezen</a>
              <a href="#actieplan">Actieplan</a>
              <a href="#output">Output</a>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
