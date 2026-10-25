"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  Copy,
  Download,
  Lock,
  Palette,
  Sparkles,
  Sun,
} from "lucide-react";
import type {
  ColorAct,
  ProjectDraft,
  StoryConcept,
  VisualAnchorEntry,
  VisualBible,
} from "@/lib/production";

const NL = String.fromCharCode(10);

export const bibleLimits = { definition: 2000, lighting: 600, emotion: 300 } as const;

export function visualBibleProblems(bible: VisualBible): string[] {
  const problems: string[] = [];
  bible.anchors.forEach((anchor) => {
    if (anchor.definition.trim().length === 0) problems.push(`Definícia ${anchor.token} je prázdna.`);
    else if (anchor.definition.length > bibleLimits.definition) problems.push(`${anchor.token} má ${anchor.definition.length} znakov, maximum je ${bibleLimits.definition}.`);
  });
  bible.acts.forEach((act) => {
    if (act.lighting.trim().length === 0) problems.push(`„${act.title}“ nemá opis svetla.`);
    else if (act.lighting.length > bibleLimits.lighting) problems.push(`„${act.title}“: svetlo má viac ako ${bibleLimits.lighting} znakov.`);
    if (act.emotion.trim().length === 0) problems.push(`„${act.title}“ nemá emocionálny oblúk.`);
    else if (act.emotion.length > bibleLimits.emotion) problems.push(`„${act.title}“: emócia má viac ako ${bibleLimits.emotion} znakov.`);
    if (act.palette.length !== 4 || !act.palette.every((color) => /^#[0-9a-fA-F]{6}$/.test(color))) problems.push(`„${act.title}“ potrebuje štyri farby.`);
  });
  return problems;
}

export type VisualBibleViewProps = {
  draft: ProjectDraft;
  concept: StoryConcept | null;
  screenplayReady: boolean;
  bible: VisualBible | null;
  isSaved: boolean;
  isLoading: boolean;
  isGenerating: boolean;
  isSaving: boolean;
  error: string | null;
  onGenerate: () => void;
  onUpdate: (bible: VisualBible) => void;
  onSave: () => void;
  onBack: () => void;
  onGoToScript: () => void;
  onContinue: () => void;
};

function bibleAsText(bible: VisualBible, draft: ProjectDraft, concept: StoryConcept) {
  const anchors = bible.anchors
    .map((anchor) => [`${anchor.token} (${anchor.label})`, anchor.definition].join(NL))
    .join(NL + NL);
  const acts = bible.acts
    .map((act) =>
      [
        `${act.title} · ${act.timeRange}`,
        `Palette: ${act.palette.join(", ")}`,
        `Lighting: ${act.lighting}`,
        `Emócia: ${act.emotion}`,
      ].join(NL),
    )
    .join(NL + NL);

  return [
    `VIZUÁLNÁ KNIHA: ${draft.title}`,
    `VYBRANÝ NÁMET: ${concept.title}`,
    "",
    "UZAMKNUTÉ TOKENY",
    anchors,
    "",
    `REFERENCE WEIGHT: ${bible.referenceSettings}`,
    "",
    "DYNAMICKÝ FAREBNÝ SCENÁR",
    acts,
  ].join(NL + NL);
}

function downloadBible(bible: VisualBible, draft: ProjectDraft, concept: StoryConcept) {
  const data = {
    project: draft.title,
    concept: concept.title,
    visualBible: bible,
    text: bibleAsText(bible, draft, concept),
  };
  const file = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${draft.title.toLocaleLowerCase("sk").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "vizualna-kniha"}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function AnchorCard({
  anchor,
  index,
  onChange,
}: {
  anchor: VisualAnchorEntry;
  index: number;
  onChange: (definition: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${anchor.token} ${anchor.definition}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const empty = anchor.definition.trim().length === 0;
  const over = anchor.definition.length > bibleLimits.definition;
  const invalid = empty || over;

  return (
    <article className={`bible-anchor-card bible-anchor-${index} ${invalid ? "invalid" : ""}`}>
      <div className="bible-anchor-top">
        <span className="bible-anchor-token">{anchor.token}</span>
        <strong>{anchor.label}</strong>
        <button aria-label={`Kopírovať token ${anchor.token}`} className="bible-copy-chip" onClick={copy} type="button">
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Skopírované" : "Kopírovať"}
        </button>
      </div>
      <textarea
        aria-invalid={invalid}
        aria-label={`Definícia ${anchor.token}`}
        maxLength={bibleLimits.definition}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        value={anchor.definition}
      />
      <div className="bible-anchor-foot">
        <p className="bible-anchor-hint"><Lock size={11} /> {empty ? "Definícia nesmie zostať prázdna. Doplňte podobu postavy alebo sveta." : "Táto definícia sa bude doslovne vkladať do každého obrazového pokynu."}</p>
        <span className={`bible-counter ${over || anchor.definition.length > bibleLimits.definition * 0.9 ? "warn" : ""}`}>{anchor.definition.length} / {bibleLimits.definition}</span>
      </div>
    </article>
  );
}

function ActCard({
  act,
  index,
  onChange,
}: {
  act: ColorAct;
  index: number;
  onChange: (next: ColorAct) => void;
}) {
  return (
    <article className="bible-act-card">
      <div className="bible-act-swatch" style={{ background: `linear-gradient(120deg, ${act.palette.join(", ")})` }}>
        <span className="bible-act-index">{String(index + 1).padStart(2, "0")}</span>
        <span className="bible-act-time">{act.timeRange}</span>
      </div>
      <div className="bible-act-body">
        <h3>{act.title}</h3>
        <div className="bible-palette-row">
          {act.palette.map((color, colorIndex) => (
            <label className="bible-color-chip" key={`${act.id}-${colorIndex}`} title={color}>
              <input
                aria-label={`Farba ${colorIndex + 1} pre ${act.title}`}
                onChange={(event) => {
                  const palette = [...act.palette];
                  palette[colorIndex] = event.target.value;
                  onChange({ ...act, palette });
                }}
                type="color"
                value={color}
              />
              <span>{color.toUpperCase()}</span>
            </label>
          ))}
        </div>
        <label className={`bible-act-field ${act.lighting.trim().length === 0 ? "invalid" : ""}`}>
          <span>SVETLO A ATMOSFÉRA (EN) <em>{act.lighting.length} / {bibleLimits.lighting}</em></span>
          <textarea aria-invalid={act.lighting.trim().length === 0} maxLength={bibleLimits.lighting} onChange={(event) => onChange({ ...act, lighting: event.target.value })} rows={2} value={act.lighting} />
        </label>
        <label className={`bible-act-field ${act.emotion.trim().length === 0 ? "invalid" : ""}`}>
          <span>EMOCIONÁLNY OBLÚK (SK) <em>{act.emotion.length} / {bibleLimits.emotion}</em></span>
          <input aria-invalid={act.emotion.trim().length === 0} maxLength={bibleLimits.emotion} onChange={(event) => onChange({ ...act, emotion: event.target.value })} value={act.emotion} />
        </label>
      </div>
    </article>
  );
}

export function VisualBibleView({
  draft,
  concept,
  screenplayReady,
  bible,
  isSaved,
  isLoading,
  isGenerating,
  isSaving,
  error,
  onGenerate,
  onUpdate,
  onSave,
  onBack,
  onGoToScript,
  onContinue,
}: VisualBibleViewProps) {
  const [copiedAll, setCopiedAll] = useState(false);
  const canCreate = Boolean(concept && screenplayReady);

  if (!canCreate || !concept) {
    return (
      <section className="bible-view">
        <div className="bible-heading">
          <span className="eyebrow">KROK 05 Z 09 <span className="eyebrow-line" /></span>
          <h1>Vizuálna DNA <em>príbehu.</em></h1>
          <p>Uzamknuté podoby postáv, svet a farebný scenár držia každý budúci záber pokope.</p>
        </div>
        <div className="locked-step-card">
          <div className="locked-step-icon"><Lock size={18} /></div>
          <span className="eyebrow-small">NAJPRV DOKONČITE SCENÁR</span>
          <h2>Vizuálna kniha potrebuje uložený scenár.</h2>
          <p>Keď je scenár potvrdený, zafixujeme tokeny postáv a sveta presne podľa neho, aby sa podoby nemenili medzi zábermi.</p>
          <button className="primary-button" onClick={onGoToScript} type="button">Späť k scenáru <ArrowRight size={15} /></button>
        </div>
      </section>
    );
  }

  const problems = bible ? visualBibleProblems(bible) : [];
  const bibleValid = problems.length === 0;

  const copyAll = async () => {
    if (!bible) return;
    try {
      await navigator.clipboard.writeText(bibleAsText(bible, draft, concept));
      setCopiedAll(true);
      window.setTimeout(() => setCopiedAll(false), 1600);
    } catch {
      setCopiedAll(false);
    }
  };

  const updateAnchor = (index: number, definition: string) => {
    if (!bible) return;
    onUpdate({
      ...bible,
      anchors: bible.anchors.map((anchor, i) => (i === index ? { ...anchor, definition } : anchor)),
    });
  };

  const updateAct = (index: number, next: ColorAct) => {
    if (!bible) return;
    onUpdate({ ...bible, acts: bible.acts.map((act, i) => (i === index ? next : act)) });
  };

  return (
    <section className="bible-view">
      <div className="bible-heading">
        <div>
          <span className="eyebrow">KROK 05 Z 09 <span className="eyebrow-line" /></span>
          <h1>Vizuálna DNA <em>príbehu.</em></h1>
          <p>Tri uzamknuté tokeny a štvorfarebný oblúk svetla. Všetko, čo musí v každom zábere zostať rovnaké.</p>
        </div>
        <button className="quiet-action bible-back" onClick={onBack} type="button">Späť k scenáru <ArrowRight size={14} /></button>
      </div>

      <div className="bible-context-banner">
        <div className="bible-context-mark"><Palette size={18} /></div>
        <div className="bible-context-copy">
          <span className="eyebrow-small">VIZUÁLNÁ KNIHA PRE NÁMET</span>
          <h2>{concept.title}</h2>
          <p>{draft.heroName} a {draft.sideName} · {draft.aspectRatio} · {draft.duration} min</p>
        </div>
        {bible ? <span className={`status-pill ${isSaved ? "is-saved" : ""}`}><span className="status-dot" />{isSaved ? "ULOŽENÉ" : "ZMENENÉ"}</span> : null}
      </div>

      {error ? <div className="step-error" role="alert">{error}</div> : null}
      {isLoading ? <div className="concept-loading"><span className="mini-spinner" /> Načítavam vizuálnu knihu...</div> : null}

      {!isLoading && !bible ? (
        <div className="concept-start-card">
          <div className="concept-start-mark"><Sparkles size={18} /></div>
          <div>
            <span className="eyebrow-small">PAMÄŤ OBRAZU</span>
            <h2>Zafixujme podoby skôr, než vznikne prvý záber.</h2>
            <p>Pripravíme doslovné definície [CHAR_HERO], [CHAR_SIDE] a [ENV_WORLD], nastavenie referenčnej váhy a farebný scenár pre všetky štyri akty.</p>
          </div>
          <button className="primary-button" disabled={isGenerating} onClick={onGenerate} type="button">
            {isGenerating ? <span className="button-spinner" /> : <Sparkles size={16} />}
            {isGenerating ? "Fixujem vizuálnu DNA..." : "Vytvoriť vizuálnu knihu"}
            {!isGenerating ? <ArrowRight size={15} /> : null}
          </button>
        </div>
      ) : null}

      {!isLoading && bible ? (
        <>
          <div className="bible-section-title">
            <span className="bible-section-icon"><Lock size={15} /></span>
            <div><span className="eyebrow-small">UZAMKNUTÉ KOTVY</span><h2>Anchor tokeny</h2></div>
          </div>
          <div className="bible-anchor-grid">
            {bible.anchors.map((anchor, index) => (
              <AnchorCard anchor={anchor} index={index} key={anchor.token} onChange={(definition) => updateAnchor(index, definition)} />
            ))}
          </div>

          <div className="bible-reference-card">
            <div className="bible-reference-copy">
              <span className="eyebrow-small">REFERENČNÁ VÁHA POSTAVY</span>
              <p>Parametre Midjourney držia tvár hrdinu konzistentnú. URL referenčného obrázka doplníte po prvom schválenom rendere.</p>
            </div>
            <code className="bible-reference-code">{bible.referenceSettings}</code>
          </div>

          <div className="bible-section-title">
            <span className="bible-section-icon warm"><Sun size={15} /></span>
            <div><span className="eyebrow-small">DYNAMICKÝ FAREBNÝ SCENÁR</span><h2>Emocionálny oblúk svetla</h2></div>
          </div>

          <div className="bible-color-curve" aria-label="Farebný oblúk filmu">
            {bible.acts.map((act) => (
              <div className="bible-curve-segment" key={act.id} style={{ background: `linear-gradient(120deg, ${act.palette.join(", ")})` }} title={`${act.title}: ${act.timeRange}`}>
                <span>{act.timeRange}</span>
              </div>
            ))}
          </div>

          <div className="bible-act-grid">
            {bible.acts.map((act, index) => (
              <ActCard act={act} index={index} key={act.id} onChange={(next) => updateAct(index, next)} />
            ))}
          </div>

          {!bibleValid ? (
            <div className="bible-problems" role="alert">
              <strong>Pred uložením doplňte:</strong>
              <ul>{problems.map((problem) => <li key={problem}>{problem}</li>)}</ul>
            </div>
          ) : null}

          <div className="bible-save-row">
            <div className="continue-copy">
              <span className="continue-check"><Palette size={15} /></span>
              <span><strong>{isSaved ? "Vizuálna kniha je uzamknutá a uložená." : bibleValid ? "Zmeny sú pripravené na uloženie." : "Kniha zatiaľ nie je úplná."}</strong><small>Tokeny sa budú vkladať doslovne do obrazových pokynov v kroku 07.</small></span>
            </div>
            <div className="bible-actions">
              <button className="quiet-action" onClick={copyAll} type="button">{copiedAll ? <Check size={14} /> : <Copy size={14} />}{copiedAll ? "Skopírované" : "Kopírovať knihu"}</button>
              <button className="quiet-action" onClick={() => downloadBible(bible, draft, concept)} type="button"><Download size={14} /> Exportovať .json</button>
              <button className="primary-button" disabled={isSaved || isSaving || !bibleValid} onClick={onSave} title={bibleValid ? undefined : "Doplňte prázdne alebo pridlhé polia"} type="button">
                {isSaving ? "Ukladám knihu..." : isSaved ? "Kniha je uložená" : "Uložiť vizuálnu knihu"}
                {!isSaving && !isSaved ? <ArrowRight size={15} /> : null}
              </button>
              {isSaved ? <button className="primary-button" onClick={onContinue} type="button">Pokračovať na záberovú maticu <ArrowRight size={15} /></button> : null}
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
