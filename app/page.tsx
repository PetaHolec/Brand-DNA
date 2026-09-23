"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { steps, type Question } from "@/lib/questions";
import type { Answers, BrandDNA, Meta } from "@/lib/types";

const STORAGE_KEY = "skocdal-client-briefing-v1";

const emptyMeta: Meta = {
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  website: "",
};

type SaveStatus = { stored?: boolean; emailed?: boolean; databaseError?: string | null; emailError?: string | null };

export default function Home() {
  const [meta, setMeta] = useState<Meta>(emptyMeta);
  const [answers, setAnswers] = useState<Answers>({});
  const [stepIndex, setStepIndex] = useState(-1);
  const [consent, setConsent] = useState(false);
  const [brandDna, setBrandDna] = useState<BrandDNA | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({});
  const [toast, setToast] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.meta) setMeta(saved.meta);
        if (saved.answers) setAnswers(saved.answers);
        if (typeof saved.stepIndex === "number") setStepIndex(saved.stepIndex);
        if (saved.brandDna) setBrandDna(saved.brandDna);
        if (saved.consent) setConsent(saved.consent);
        if (saved.saveStatus) setSaveStatus(saved.saveStatus);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ meta, answers, stepIndex, brandDna, consent, saveStatus }));
  }, [meta, answers, stepIndex, brandDna, consent, saveStatus, loaded]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const progress = stepIndex < 0 ? 0 : stepIndex >= steps.length ? 100 : Math.round(((stepIndex + 1) / steps.length) * 100);

  const introValid = meta.companyName.trim() && meta.contactName.trim() && /^\S+@\S+\.\S+$/.test(meta.email.trim());

  const currentStepValid = useMemo(() => {
    if (stepIndex < 0 || stepIndex >= steps.length) return true;
    return steps[stepIndex].questions.every((q) => {
      if (!q.required) return true;
      const value = answers[q.id];
      return Array.isArray(value) ? value.length > 0 : Boolean(String(value || "").trim());
    });
  }, [answers, stepIndex]);

  function updateAnswer(id: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function toggleMulti(q: Question, option: string) {
    const current = Array.isArray(answers[q.id]) ? (answers[q.id] as string[]) : [];
    updateAnswer(q.id, current.includes(option) ? current.filter((x) => x !== option) : [...current, option]);
  }

  function next() {
    if (stepIndex === -1 && !introValid) return;
    if (stepIndex >= 0 && !currentStepValid) {
      setToast("Doplňte prosím označené povinné otázky.");
      return;
    }
    setStepIndex((s) => Math.min(s + 1, steps.length));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    setStepIndex((s) => Math.max(-1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function generateBrandDna() {
    const res = await fetch("/api/brand-dna", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meta, answers }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Generování Brand DNA selhalo.");
    setBrandDna(data.brandDna);
    return data.brandDna as BrandDNA;
  }

  async function submitBackup(dna: BrandDNA | null) {
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meta, answers, brandDna: dna }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Uložení briefingu selhalo.");
    setSaveStatus(data);
    return data;
  }

  async function finish() {
    if (!consent) {
      setToast("Potřebujeme souhlas s odesláním briefingu SkočDál.");
      return;
    }
    setLoading(true);
    let dna: BrandDNA | null = null;
    try {
      dna = await generateBrandDna();
    } catch (e) {
      console.error(e);
      setToast(e instanceof Error ? e.message : "AI Brand DNA se nepodařila vygenerovat.");
    }
    try {
      await submitBackup(dna);
    } catch (e) {
      console.error(e);
      setToast("Briefing zůstal uložený v prohlížeči, ale serverová záloha selhala.");
    }
    setStepIndex(steps.length + 1);
    setLoading(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function regenerate() {
    setLoading(true);
    try {
      const dna = await generateBrandDna();
      await submitBackup(dna);
      setToast("Brand DNA je znovu vygenerovaná a záloha aktualizovaná.");
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Generování selhalo.");
    } finally {
      setLoading(false);
    }
  }

  function clearAll() {
    if (!window.confirm("Opravdu chcete vymazat celý briefing z tohoto prohlížeče?")) return;
    localStorage.removeItem(STORAGE_KEY);
    setMeta(emptyMeta);
    setAnswers({});
    setBrandDna(null);
    setConsent(false);
    setSaveStatus({});
    setStepIndex(-1);
  }

  function downloadJson() {
    const blob = new Blob([JSON.stringify({ meta, answers, brandDna }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `skocdal-briefing-${meta.companyName.toLowerCase().replace(/[^a-z0-9]+/gi, "-") || "klient"}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function copySummary() {
    await navigator.clipboard.writeText(JSON.stringify(brandDna, null, 2));
    setToast("Brand DNA zkopírována.");
  }

  if (!loaded) return null;

  return (
    <div className="app-shell bg-motion">
      <header className="header">
        <div className="header-inner">
          <div className="header-row">
            <Image className="logo" src="/logo-full.png" alt="SkočDál" width={904} height={282} priority />
            <span className="header-note">Klientský briefing • průběžně ukládáme v tomto prohlížeči</span>
            {stepIndex >= 0 && stepIndex < steps.length && <span className="mobile-step">{stepIndex + 1}/{steps.length}</span>}
          </div>
          <div className="progress-track"><div className="progress-bar" style={{ width: `${progress}%` }} /></div>
        </div>
      </header>

      <main className="main">
        {loading ? (
          <Loading />
        ) : stepIndex === -1 ? (
          <Intro meta={meta} setMeta={setMeta} valid={Boolean(introValid)} onNext={next} />
        ) : stepIndex >= 0 && stepIndex < steps.length ? (
          <StepView
            stepIndex={stepIndex}
            answers={answers}
            updateAnswer={updateAnswer}
            toggleMulti={toggleMulti}
            onBack={back}
            onNext={next}
            currentStepValid={currentStepValid}
          />
        ) : stepIndex === steps.length ? (
          <Review consent={consent} setConsent={setConsent} onBack={back} onFinish={finish} />
        ) : (
          <Results
            brandDna={brandDna}
            meta={meta}
            saveStatus={saveStatus}
            onRegenerate={regenerate}
            onEdit={() => setStepIndex(0)}
            onCopy={copySummary}
            onJson={downloadJson}
            onClear={clearAll}
          />
        )}
      </main>

      <footer className="footer">
        Nezůstávej stát. Skoč dál. • <a href="https://skocdal.cz" target="_blank" rel="noreferrer">https://skocdal.cz</a>
      </footer>
      {toast && <div style={{position:"fixed",right:20,bottom:20,zIndex:80,background:"#FFD400",color:"#111",padding:"12px 16px",borderRadius:14,fontWeight:700,maxWidth:420}}>{toast}</div>}
    </div>
  );
}

function Intro({ meta, setMeta, valid, onNext }: { meta: Meta; setMeta: (m: Meta) => void; valid: boolean; onNext: () => void }) {
  const change = (key: keyof Meta, value: string) => setMeta({ ...meta, [key]: value });
  return (
    <section className="hero">
      <div>
        <div className="eyebrow">SkočDál / klientský briefing</div>
        <h1>Nezůstávej stát.<br/><span className="yellow">Postavme značku,</span><br/>která sedí vaší firmě.</h1>
        <p className="lead">Pár konkrétních odpovědí nám pomůže připravit Brand DNA, strukturu nového webu a doporučení, co má smysl řešit dál. Zabere to přibližně 10–15 minut.</p>
      </div>
      <div className="intro-card">
        <Field label="Název firmy" required><input className="input" value={meta.companyName} onChange={(e) => change("companyName", e.target.value)} /></Field>
        <Field label="Kontaktní osoba" required><input className="input" value={meta.contactName} onChange={(e) => change("contactName", e.target.value)} /></Field>
        <Field label="E-mail" required><input className="input" type="email" value={meta.email} onChange={(e) => change("email", e.target.value)} /></Field>
        <Field label="Telefon"><input className="input" value={meta.phone} onChange={(e) => change("phone", e.target.value)} /></Field>
        <Field label="Současný web"><input className="input" placeholder="https://" value={meta.website} onChange={(e) => change("website", e.target.value)} /></Field>
        <button className="btn btn-primary" style={{width:"100%",marginTop:8}} disabled={!valid} onClick={onNext}>Skočit dál →</button>
      </div>
    </section>
  );
}

function StepView({ stepIndex, answers, updateAnswer, toggleMulti, onBack, onNext, currentStepValid }: {
  stepIndex: number;
  answers: Answers;
  updateAnswer: (id: string, value: string | string[]) => void;
  toggleMulti: (q: Question, option: string) => void;
  onBack: () => void;
  onNext: () => void;
  currentStepValid: boolean;
}) {
  const step = steps[stepIndex];
  const technical = step.id === "technical";
  return (
    <section className="step-layout">
      <aside className="step-copy">
        <div className="step-number">{step.eyebrow}</div>
        <h2>{step.title}</h2>
        <p className="lead">{step.description}</p>
      </aside>
      <div className="form-card">
        {technical && <div className="security-note"><strong>Hesla ani přístupové údaje sem neposílejte.</strong><br/>Stačí nám vědět, kde jsou služby vedené a kdo k nim má přístup.</div>}
        {step.questions.map((q) => (
          <div className="question-block" key={q.id}>
            <Field label={q.label} hint={q.hint} required={q.required}>
              {q.type === "text" && <input className="input" value={(answers[q.id] as string) || ""} onChange={(e) => updateAnswer(q.id, e.target.value)} />}
              {q.type === "textarea" && <textarea className="textarea" value={(answers[q.id] as string) || ""} onChange={(e) => updateAnswer(q.id, e.target.value)} />}
              {(q.type === "single" || q.type === "multi") && (
                <div className="chips">
                  {q.options?.map((option) => {
                    const value = answers[q.id];
                    const active = q.type === "multi" ? Array.isArray(value) && value.includes(option) : value === option;
                    return <button key={option} type="button" className={`chip ${active ? "active" : ""}`} onClick={() => q.type === "multi" ? toggleMulti(q, option) : updateAnswer(q.id, option)}>{option}</button>;
                  })}
                </div>
              )}
            </Field>
          </div>
        ))}
        <div className="actions">
          <button className="btn btn-ghost" onClick={onBack}>← Zpět</button>
          <div className="actions-right"><button className="btn btn-primary" onClick={onNext} disabled={!currentStepValid}>{stepIndex === steps.length - 1 ? "Projít a dokončit →" : "Skočit dál →"}</button></div>
        </div>
      </div>
    </section>
  );
}

function Review({ consent, setConsent, onBack, onFinish }: { consent: boolean; setConsent: (v: boolean) => void; onBack: () => void; onFinish: () => void }) {
  return (
    <section style={{maxWidth:820,margin:"0 auto"}}>
      <div className="eyebrow">Poslední krok</div>
      <h2>Máme podklady.<br/><span className="yellow">Teď z nich složíme Brand DNA.</span></h2>
      <p className="lead">Po dokončení AI analyzuje vaše odpovědi a připraví positioning, cílové skupiny, tone of voice, doporučenou strukturu webu, CTA, SEO témata i další příležitosti. SkočDál zároveň dostane kopii briefingu, abychom o nic nepřišli.</p>
      <div className="consent">
        <input id="consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <label htmlFor="consent">Souhlasím s odesláním údajů uvedených v tomto briefingu společnosti SkočDál za účelem přípravy návrhu webu, Brand DNA a navazující komunikace.</label>
      </div>
      <div className="actions">
        <button className="btn btn-ghost" onClick={onBack}>← Zpět</button>
        <div className="actions-right"><button className="btn btn-primary" disabled={!consent} onClick={onFinish}>Vygenerovat Brand DNA →</button></div>
      </div>
    </section>
  );
}

function Loading() {
  return (
    <section className="loading-screen">
      <div>
        <Image className="loading-mark" src="/logo-symbol.png" alt="" width={273} height={282} />
        <div className="eyebrow" style={{marginTop:24}}>SkočDál AI</div>
        <h2>Skládáme vaši<br/><span className="yellow">Brand DNA…</span></h2>
        <p className="lead">Propojujeme vaše odpovědi do strategie, ze které půjde postavit web i další komunikaci.</p>
      </div>
    </section>
  );
}

function Results({ brandDna, meta, saveStatus, onRegenerate, onEdit, onCopy, onJson, onClear }: {
  brandDna: BrandDNA | null;
  meta: Meta;
  saveStatus: SaveStatus;
  onRegenerate: () => void;
  onEdit: () => void;
  onCopy: () => void;
  onJson: () => void;
  onClear: () => void;
}) {
  if (!brandDna) {
    return (
      <section style={{maxWidth:820,margin:"0 auto"}}>
        <div className="result-hero"><h1>Máme briefing.</h1><p>Odpovědi zůstaly uložené, ale AI Brand DNA se zatím nepodařila vygenerovat.</p></div>
        <div className="statuses">
          <span className={`status ${saveStatus.emailed ? "ok" : "warn"}`}>{saveStatus.emailed ? "✓ Kopie odeslána e-mailem" : "E-mailová kopie čeká na konfiguraci / selhala"}</span>
          <span className={`status ${saveStatus.stored ? "ok" : "warn"}`}>{saveStatus.stored ? "✓ Uloženo v databázi" : "Lokální kopie je v prohlížeči"}</span>
        </div>
        <div className="actions"><button className="btn btn-ghost" onClick={onEdit}>Upravit odpovědi</button><button className="btn btn-primary" onClick={onRegenerate}>Zkusit AI znovu →</button></div>
      </section>
    );
  }

  return (
    <section>
      <div className="result-hero">
        <div className="eyebrow" style={{color:"#111"}}>Briefing dokončen / {meta.companyName}</div>
        <h1>Máme to.<br/>Teď můžeme skočit dál.</h1>
        <p style={{fontSize:18,maxWidth:760}}>Z vašich odpovědí jsme připravili první strategickou Brand DNA. Berte ji jako pracovní základ pro nový web a další komunikaci.</p>
      </div>
      <div className="statuses">
        <span className={`status ${saveStatus.emailed ? "ok" : "warn"}`}>{saveStatus.emailed ? "✓ Kopie odeslána SkočDál" : "E-mailová kopie nebyla potvrzena"}</span>
        <span className={`status ${saveStatus.stored ? "ok" : "warn"}`}>{saveStatus.stored ? "✓ Serverová záloha uložena" : "✓ Lokální záloha v prohlížeči"}</span>
      </div>

      <div className="actions result-actions" style={{marginBottom:28,marginTop:0,justifyContent:"flex-start",flexWrap:"wrap"}}>
        <button className="btn btn-primary" onClick={onRegenerate}>Vygenerovat znovu →</button>
        <button className="btn btn-secondary" onClick={onCopy}>Kopírovat Brand DNA</button>
        <button className="btn btn-secondary" onClick={() => window.print()}>Tisk / PDF</button>
        <button className="btn btn-secondary" onClick={onJson}>Stáhnout JSON</button>
        <button className="btn btn-ghost" onClick={onEdit}>Upravit odpovědi</button>
      </div>

      <div className="results-grid">
        <Card title="Esence značky" wide><p>{brandDna.essence}</p></Card>
        <Card title="Positioning"><p>{brandDna.positioning}</p></Card>
        <Card title="Hodnotová nabídka"><p>{brandDna.valueProposition}</p></Card>
        <ListCard title="Primární cílové skupiny" items={brandDna.primaryAudiences} />
        <ListCard title="Potřeby zákazníků" items={brandDna.customerNeeds} />
        <Card title="Hodnoty značky" wide>{brandDna.values.map((v) => <div className="value-row" key={v.name}><strong>{v.name}</strong><p>{v.explanation}</p></div>)}</Card>
        <ListCard title="Osobnost značky" items={brandDna.personality} />
        <Card title="Značka je / není"><p><strong>Je:</strong> {brandDna.brandIs.join(" • ")}</p><p><strong>Není:</strong> {brandDna.brandIsNot.join(" • ")}</p></Card>
        <Card title="Archetyp" wide><p><strong>{brandDna.archetype.primary}</strong>{brandDna.archetype.secondary ? ` + ${brandDna.archetype.secondary}` : ""}</p><p>{brandDna.archetype.rationale}</p></Card>
        <Card title="Tone of Voice"><List items={brandDna.toneOfVoice.principles}/><p><strong>Vyhnout se:</strong></p><List items={brandDna.toneOfVoice.avoid}/></Card>
        <Card title="Jak může značka mluvit"><List items={brandDna.toneOfVoice.examples}/></Card>
        <Card title="Elevator pitch" wide><p>{brandDna.elevatorPitch}</p></Card>
        <ListCard title="Headline / claimy" items={brandDna.headlines} wide />
        <ListCard title="Vizuální směr" items={brandDna.visualDirection} />
        <ListCard title="Odlišení od konkurence" items={brandDna.differentiation} />
        <ListCard title="Důkazní body" items={brandDna.proofPoints} />
        <Card title="CTA"><p><strong>Primární:</strong> {brandDna.primaryCTA}</p><p><strong>Sekundární:</strong> {brandDna.secondaryCTA}</p></Card>
        <Card title="Doporučená struktura webu" wide>{brandDna.websiteStructure.map((x) => <div className="site-row" key={`${x.title}-${x.purpose}`}><strong>{x.title}</strong><span>{x.purpose}</span></div>)}</Card>
        <ListCard title="Obsahové priority" items={brandDna.contentPriorities} />
        <ListCard title="SEO témata" items={brandDna.seoThemes} />
        <ListCard title="Marketingové příležitosti" items={brandDna.marketingOpportunities} />
        <ListCard title="Dlouhodobá správa" items={brandDna.longTermCare} />
        <ListCard title="Co ještě potřebujeme doplnit" items={brandDna.gapsAndRisks} wide />
      </div>

      <div className="result-actions" style={{marginTop:34,textAlign:"center"}}>
        <button className="btn btn-ghost" onClick={onClear}>Vymazat odpovědi z tohoto zařízení</button>
      </div>
    </section>
  );
}

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return <div className="field"><label className="label">{label} {required && <span className="required">*</span>}</label>{hint && <div className="hint">{hint}</div>}{children}</div>;
}
function Card({ title, children, wide = false }: { title: string; children: React.ReactNode; wide?: boolean }) {
  return <article className={`result-card ${wide ? "wide" : ""}`}><h3>{title}</h3>{children}</article>;
}
function List({ items }: { items: string[] }) { return <ul>{(items || []).map((x, i) => <li key={`${x}-${i}`}>{x}</li>)}</ul>; }
function ListCard({ title, items, wide = false }: { title: string; items: string[]; wide?: boolean }) { return <Card title={title} wide={wide}><List items={items}/></Card>; }
