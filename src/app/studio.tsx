"use client";

import { useEffect, useMemo, useRef, useState, useTransition, type FormEvent } from "react";
import {
  generateScreenplay,
  generateSongPackage,
  generateCueSheet,
  generateImagePrompts,
  generateFinalPackage,
  generateMotionPackage,
  generateStoryConcepts,
  runtimeTimeline,
  generateVisualBible,
  sampleDraft,
  worldCaptionFor,
  worldImageFor,
  worldPresets,
  wordBudget,
  type AspectRatio,
  type ProjectDraft,
  type SavedConceptSet,
  type SavedProject,
  type SavedScreenplay,
  type SavedSongSet,
  type SavedCueSheet,
  type SavedImagePrompts,
  type SavedFinalPackage,
  type SavedMotionPackage,
  type SavedVisualBible,
  type ScreenplayPackage,
  type SongPackage,
  type CueSheet,
  type ImagePromptPackage,
  type FinalPackage,
  type MotionPackage,
  type StoryConcept,
  type VisualBible,
  type WorldPreset,
} from "@/lib/production";
import { ConceptsView, ScreenplayView, SongsView, TimelineView } from "./production-steps";
import { VisualBibleView } from "./visual-bible";
import { CueSheetView } from "./cue-sheet";
import { ImagePromptsView } from "./image-prompts";
import { MotionView } from "./motion";
import { FinalizeView } from "./finalize";
import { AnimaticView } from "./animatic";

type View = "studio" | "concepts" | "timeline" | "songs" | "script" | "bible" | "shots" | "preview" | "prompts" | "motion" | "finalize" | "library" | "map";
type Notice = { message: string; kind: "success" | "error" } | null;
type IconName =
  | "spark"
  | "grid"
  | "book"
  | "map"
  | "arrow"
  | "check"
  | "chevron"
  | "clock"
  | "camera"
  | "copy"
  | "download"
  | "plus"
  | "save"
  | "play"
  | "layers"
  | "heart"
  | "lock"
  | "trash";

const iconPaths: Record<IconName, string> = {
  spark: "M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3z M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z",
  grid: "M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z",
  book: "M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17H7.5A2.5 2.5 0 0 0 5 21.5z M5 4.5v17 M8 6h8 M8 10h7",
  map: "M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z M9 3v15 M15 6v15",
  arrow: "M5 12h14 M13 6l6 6-6 6",
  check: "M5 12l4 4L19 6",
  chevron: "M9 18l6-6-6-6",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2",
  camera: "M4 7h3l1.5-2h7L17 7h3v12H4z M12 10a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z",
  copy: "M8 8V4h12v12h-4 M4 8h12v12H4z",
  download: "M12 3v12 M7 10l5 5 5-5 M5 20h14",
  plus: "M12 5v14 M5 12h14",
  save: "M5 3h12l3 3v15H4V3z M8 3v6h8V3 M8 21v-8h8v8",
  play: "M8 5v14l11-7z",
  layers: "M12 3L3 8l9 5 9-5-9-5z M3 12l9 5 9-5 M3 16l9 5 9-5",
  heart: "M20.8 8.8c0 5-8.8 10-8.8 10s-8.8-5-8.8-10A4.8 4.8 0 0 1 12 6.4a4.8 4.8 0 0 1 8.8 2.4z",
  lock: "M6 10V7a6 6 0 0 1 12 0v3 M5 10h14v11H5z M12 14v3",
  trash: "M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13 M10 11v6 M14 11v6",
};

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={iconPaths[name]} />
    </svg>
  );
}

const productionSteps = [
  { number: "01", title: "Produkčný pas", detail: "Svet, postavy a cieľ filmu", icon: "book" as const },
  { number: "02", title: "Príbehová os", detail: "Päť námetov a voľba smeru", icon: "layers" as const },
  { number: "03", title: "Rytmus a piesne", detail: "Časový plán a dve skladby", icon: "clock" as const },
  { number: "04", title: "Scenár", detail: "Dialógy, zvuky a herecké značky", icon: "play" as const },
  { number: "05", title: "Vizuálna kniha", detail: "Uzamknuté podoby a farebný oblúk", icon: "camera" as const },
  { number: "06", title: "Zábery a zvuk", detail: "Obrazová a zvuková synchronizácia", icon: "layers" as const },
  { number: "07", title: "Obrázkové pokyny", detail: "Samostatné pokyny pre každý záber", icon: "camera" as const },
  { number: "08", title: "Pohyb", detail: "Herectvo, fyzika a emócie", icon: "play" as const },
  { number: "09", title: "Filmový balík", detail: "Miniatúry, strih a výstupy", icon: "download" as const },
];

const stepViews: View[] = ["studio", "concepts", "timeline", "script", "bible", "shots", "prompts", "motion", "finalize"];

const draftTextKeys: (keyof ProjectDraft)[] = [
  "title",
  "audienceAge",
  "languageRegister",
  "heroName",
  "heroDescription",
  "sideName",
  "sideDescription",
  "environment",
  "plot",
  "moral",
];

function formatDate(value: SavedProject["createdAt"]) {
  return new Intl.DateTimeFormat("sk-SK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function Sidebar({
  activeView,
  setActiveView,
  projectCount,
  isSaved,
  selectedConceptId,
  songsSaved,
  screenplaySaved,
  bibleSaved,
  cueSaved,
  promptsSaved,
  motionSaved,
  finalSaved,
}: {
  activeView: View;
  setActiveView: (view: View) => void;
  projectCount: number;
  isSaved: boolean;
  selectedConceptId: number | null;
  songsSaved: boolean;
  screenplaySaved: boolean;
  bibleSaved: boolean;
  cueSaved: boolean;
  promptsSaved: boolean;
  motionSaved: boolean;
  finalSaved: boolean;
}) {
  return (
    <aside className="sidebar">
      <a className="brand" href="#domov" onClick={() => setActiveView("studio")}>
        <span className="brand-mark">
          <Icon name="spark" size={22} />
        </span>
        <span className="brand-words">
          <span>ROZPRÁVKOVÝ</span>
          <strong>ATELIÉR</strong>
        </span>
      </a>

      <div className="sidebar-section-label">TVORIVÝ PRIESTOR</div>
      <nav className="sidebar-nav" aria-label="Hlavná navigácia">
        <button
          className={`nav-item ${activeView === "studio" ? "active" : ""}`}
          aria-label="Pracovný stôl"
          title="Pracovný stôl"
          onClick={() => setActiveView("studio")}
          type="button"
        >
          <Icon name="grid" />
          <span>Pracovný stôl</span>
          <span className="nav-number">01</span>
        </button>
        <button
          className={`nav-item ${activeView === "concepts" ? "active" : ""}`}
          aria-label="Príbehová os"
          title="Príbehová os"
          onClick={() => setActiveView("concepts")}
          type="button"
        >
          <Icon name="layers" />
          <span>Príbehová os</span>
          <span className="nav-number">02</span>
        </button>
        <button
          className={`nav-item ${activeView === "timeline" ? "active" : ""}`}
          aria-label="Rytmus filmu"
          title="Rytmus filmu"
          onClick={() => setActiveView("timeline")}
          type="button"
        >
          <Icon name="clock" />
          <span>Rytmus filmu</span>
          <span className="nav-number">03</span>
        </button>
        <button
          className={`nav-item ${activeView === "library" ? "active" : ""}`}
          aria-label="Moje príbehy"
          title="Moje príbehy"
          onClick={() => setActiveView("library")}
          type="button"
        >
          <Icon name="book" />
          <span>Moje príbehy</span>
          <span className="nav-count">{projectCount}</span>
        </button>
        <button
          className={`nav-item ${activeView === "map" ? "active" : ""}`}
          aria-label="Mapa výroby"
          title="Mapa výroby"
          onClick={() => setActiveView("map")}
          type="button"
        >
          <Icon name="map" />
          <span>Mapa výroby</span>
          <Icon name="chevron" size={15} />
        </button>
      </nav>

      <div className="sidebar-divider" />
      <div className="sidebar-section-label">POSTUP PRÍBEHU</div>
      <div className="sidebar-steps">
        {productionSteps.slice(0, 9).map((step, index) => {
          const complete = index === 0
            ? isSaved
            : index === 1
              ? Boolean(selectedConceptId)
              : index === 2
                ? songsSaved
                : index === 3
                  ? screenplaySaved
                  : index === 4
                    ? bibleSaved
                    : index === 5
                      ? cueSaved
                      : index === 6
                        ? promptsSaved
                        : index === 7
                          ? motionSaved
                          : index === 8
                            ? finalSaved
                            : false;
          const currentIndex = !isSaved ? 0 : !selectedConceptId ? 1 : !songsSaved ? 2 : !screenplaySaved ? 3 : !bibleSaved ? 4 : !cueSaved ? 5 : !promptsSaved ? 6 : !motionSaved ? 7 : !finalSaved ? 8 : 9;
          const current = !complete && index === currentIndex;

          return (
            <button
              aria-label={`${step.number} ${step.title}`}
              className={`sidebar-step ${complete ? "complete" : current ? "current" : "locked"}`}
              key={step.number}
              onClick={() => setActiveView(stepViews[index])}
              title={complete ? "Hotový krok, otvoriť" : current ? "Práve otvorený krok" : "Otvorí prehľad kroku s podmienkou dokončenia"}
              type="button"
            >
              <span className="sidebar-step-dot">
                {complete ? <Icon name="check" size={11} /> : current ? <span /> : <Icon name="lock" size={11} />}
              </span>
              <span className="sidebar-step-copy">
                <strong>{step.title}</strong>
                <small>{complete ? "Potvrdené" : current ? "Práve otvorené" : "Nasleduje po potvrdení"}</small>
              </span>
              <Icon name="chevron" size={12} />
            </button>
          );
        })}
        <button className="all-steps-link" onClick={() => setActiveView("map")} type="button">
          Zobraziť všetkých 9 krokov <Icon name="arrow" size={14} />
        </button>
      </div>

      <div className="sidebar-spacer" />
      <div className="sidebar-note">
        <span className="sidebar-note-icon"><Icon name="heart" size={16} /></span>
        <p>Každý veľký film sa začína jedným malým nápadom.</p>
      </div>
      <div className="sidebar-profile">
        <div className="profile-avatar">R</div>
        <div>
          <strong>Rodinný projekt</strong>
          <span>Tvorivý režim</span>
        </div>
        <span className="profile-menu">···</span>
      </div>
    </aside>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  multiline = false,
  required = true,
  maxLength = 140,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  hint?: string;
  multiline?: boolean;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <label className={`field ${multiline ? "field-multiline" : ""}`}>
      <span className="field-label">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={3}
          maxLength={600}
          required={required}
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          required={required}
        />
      )}
      {hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}

function FormSectionHeading({
  number,
  title,
  detail,
}: {
  number: string;
  title: string;
  detail: string;
}) {
  return (
    <div className="form-section-heading">
      <span className="form-section-number">{number}</span>
      <div>
        <h3>{title}</h3>
        <p>{detail}</p>
      </div>
    </div>
  );
}

function PassportPreview({
  draft,
  isSaved,
  onCopy,
  onDownload,
  copied,
}: {
  draft: ProjectDraft;
  isSaved: boolean;
  onCopy: () => void;
  onDownload: () => void;
  copied: boolean;
}) {
  const budget = wordBudget(draft.duration);
  const filledFields = draftTextKeys.filter((key) => String(draft[key]).trim().length > 0).length;
  const completion = Math.round((filledFields / draftTextKeys.length) * 100);

  return (
    <div className="right-rail">
      <section className="passport-card">
        <div className="passport-card-top">
          <span className="eyebrow-small">ŽIVÝ NÁHĽAD</span>
          <span className={`status-pill ${isSaved ? "is-saved" : ""}`}>
            <span className="status-dot" />
            {isSaved ? "ULOŽENÉ" : "ROZPRACOVANÉ"}
          </span>
        </div>
        <div
          className="passport-art"
          role="img"
          aria-label={`${draft.heroName || "Hrdina"} a ${draft.sideName || "kamarát"} vo svete ${worldCaptionFor(draft)}`}
          style={{ backgroundImage: `url(${worldImageFor(draft)})` }}
        />
        <div className="passport-content">
          <div className="passport-kicker">PRODUKČNÝ PAS · 01</div>
          <h3>{draft.title || "Nový príbeh"}</h3>
          <p className="passport-summary">{draft.plot || "Zápletka sa ukáže tu, keď ju doplníte."}</p>
          <div className="passport-meter-label">
            <span>Úplnosť zadania</span>
            <strong>{completion}%</strong>
          </div>
          <div className="meter-track"><span style={{ width: `${completion}%` }} /></div>
          <div className="passport-stats">
            <div>
              <span className="stat-label">ROZSAH SCENÁRA</span>
              <strong>{budget.words.toLocaleString("sk-SK")} <small>slov</small></strong>
              <span className="stat-sub">± {budget.words - budget.minimum} slov</span>
            </div>
            <div>
              <span className="stat-label">DĹŽKA FILMU</span>
              <strong>{draft.duration} <small>min</small></strong>
              <span className="stat-sub">125 slov za minútu</span>
            </div>
          </div>
          <div className="passport-format-row">
            <span>OBRAZOVÝ FORMÁT</span>
            <strong><Icon name="camera" size={14} /> {draft.aspectRatio}</strong>
          </div>
        </div>
      </section>

      <section className="anchor-card">
        <div className="anchor-card-heading">
          <span className="eyebrow-small">PAMÄŤ PRÍBEHU</span>
          <Icon name="lock" size={15} />
        </div>
        <p className="anchor-intro">Tieto mená a miesta sa prenesú do ďalších tvorivých krokov.</p>
        <div className="anchor-row">
          <span className="anchor-token">[CHAR_HERO]</span>
          <strong>{draft.heroName || "Hlavný hrdina"}</strong>
        </div>
        <div className="anchor-row">
          <span className="anchor-token">[CHAR_SIDE]</span>
          <strong>{draft.sideName || "Kamarát"}</strong>
        </div>
        <div className="anchor-row">
          <span className="anchor-token">[ENV_WORLD]</span>
          <strong>{draft.environment ? draft.environment.split(" ").slice(0, 3).join(" ") : "Svet príbehu"}</strong>
        </div>
      </section>

      <div className="export-actions">
        <button className="quiet-action" onClick={onCopy} type="button">
          <Icon name={copied ? "check" : "copy"} size={15} />
          {copied ? "Pas skopírovaný" : "Kopírovať súhrn"}
        </button>
        <button className="quiet-action" onClick={onDownload} type="button">
          <Icon name="download" size={15} /> Stiahnuť údaje
        </button>
      </div>
    </div>
  );
}

function StudioView({
  draft,
  setDraft,
  projects,
  savedProject,
  isSaving,
  notice,
  onSubmit,
  onReset,
  isSaved,
  onCopy,
  onDownload,
  copied,
  onOpenMap,
  onOpenConcepts,
  onSelectPreset,
  restoredDraft,
  onDismissRestore,
}: {
  draft: ProjectDraft;
  setDraft: (draft: ProjectDraft) => void;
  projects: SavedProject[];
  savedProject: SavedProject | null;
  isSaving: boolean;
  notice: Notice;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
  isSaved: boolean;
  onCopy: () => void;
  onDownload: () => void;
  copied: boolean;
  onOpenMap: () => void;
  onOpenConcepts: () => void;
  onSelectPreset: (preset: WorldPreset) => void;
  restoredDraft: boolean;
  onDismissRestore: () => void;
}) {
  const update = <Key extends keyof ProjectDraft>(key: Key, value: ProjectDraft[Key]) => {
    setDraft({ ...draft, [key]: value });
  };

  return (
    <>
      <section className="welcome-row">
        <div>
          <span className="eyebrow">TVORIVÝ STÔL <span className="eyebrow-line" /></span>
          <h1>Najprv malé <em>„čo keby?“</em></h1>
        </div>
        <p>Tu sa z iskry v hlave stáva príbeh, ktorý môže ožiť na plátne.</p>
      </section>

      <section className="keyart-banner">
        <div className="keyart-background" style={{ backgroundImage: `url(${worldImageFor(draft)})` }} />
        <div className="keyart-shade" />
        <span aria-hidden="true" className="firefly firefly-1" />
        <span aria-hidden="true" className="firefly firefly-2" />
        <span aria-hidden="true" className="firefly firefly-3" />
        <span aria-hidden="true" className="firefly firefly-4" />
        <div className="keyart-copy">
          <span className="keyart-label"><Icon name="spark" size={14} /> {isSaved ? "ULOŽENÝ PRÍBEH" : "ROZPRACOVANÝ NÁMET"} · {draft.duration} MIN</span>
          <h2>{draft.title ? draft.title : <>Každá iskra<br />potrebuje <em>kamaráta.</em></>}</h2>
          <p>{draft.heroName && draft.sideName ? `${draft.heroName} a ${draft.sideName} · ${draft.audienceAge || "vek podľa pasu"}` : "Začnite s pripravenou rozprávkovou ukážkou alebo si vymyslite vlastný svet."}</p>
          <button className="keyart-link" onClick={onReset} type="button">
            Načítať odporúčaný návrh <Icon name="arrow" size={15} />
          </button>
        </div>
        <div className="keyart-caption"><span>01</span> {worldCaptionFor(draft).toLocaleUpperCase("sk")} · {draft.aspectRatio}</div>
      </section>

      <section className="preset-section" aria-label="Galéria hotových svetov">
        <div className="preset-section-head">
          <span className="eyebrow-small">ALEBO ZAČNITE OD HOTOVÉHO SVETA</span>
          <span className="preset-count">{worldPresets.length} svety pripravené na jeden klik</span>
        </div>
        <div className="preset-strip">
          {worldPresets.map((preset, presetIndex) => (
            <button
              className="preset-card"
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              style={{ animationDelay: `${presetIndex * 70}ms` }}
              title={`Načítať celý produkčný pas sveta ${preset.name}`}
              type="button"
            >
              <span className="preset-card-art" style={{ backgroundImage: `url(${preset.image})` }}>
                <span className="preset-age-chip">{preset.ageTag}</span>
              </span>
              <span className="preset-card-body">
                <strong>{preset.name}</strong>
                <span className="preset-duo">{preset.draft.heroName} a {preset.draft.sideName}</span>
                <span className="preset-tagline">{preset.tagline}</span>
                <span className="preset-card-foot">
                  <span className="preset-moral">{preset.moralTag}</span>
                  <span className="preset-use">Použiť svet <Icon name="arrow" size={12} /></span>
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {restoredDraft && !isSaved ? (
        <div className="restore-chip" role="status">
          <Icon name="clock" size={14} />
          <span>Obnovili sme váš rozpracovaný koncept z poslednej relácie.</span>
          <button onClick={onDismissRestore} type="button">Ponechať</button>
          <button onClick={onReset} type="button">Začať od ukážky</button>
        </div>
      ) : null}

      <div className="section-toolbar">
        <div>
          <span className="eyebrow-small">KROK 01 Z 09</span>
          <h2>Produkčný pas</h2>
          <p>Najskôr uzamkneme základné pravidlá príbehu.</p>
        </div>
        <button className="text-button" onClick={onOpenMap} type="button">
          Mapa výroby <Icon name="arrow" size={15} />
        </button>
      </div>

      <div className="progress-strip" aria-label="Postup výroby">
        {productionSteps.slice(0, 5).map((step, index) => (
          <button
            className={`progress-step ${index === 0 ? "active" : "locked"}`}
            key={step.number}
            onClick={onOpenMap}
            type="button"
            aria-label={`${step.number} ${step.title}. Otvoriť mapu výroby.`}
          >
            <span className="progress-step-number">{index === 0 ? <Icon name="check" size={14} /> : step.number}</span>
            <span className="progress-step-name">{step.title}</span>
            {index < 4 ? <span className="progress-connector" /> : null}
          </button>
        ))}
      </div>

      <div className="workspace-grid">
        <form className="intake-card" id="intake-form" onSubmit={onSubmit}>
          <div className="intake-card-heading">
            <div>
              <span className="eyebrow-small">ZÁKLADNÉ NASTAVENIE</span>
              <h2>Váš filmový zámer</h2>
            </div>
            <button className="reset-button" onClick={onReset} type="button">Obnoviť ukážku</button>
          </div>

          <div className="form-section">
            <FormSectionHeading number="01" title="Divák a tón" detail="Pre koho rozprávame a akým hlasom." />
            <div className="form-grid two-columns">
              <TextField
                label="Pracovný názov"
                value={draft.title}
                onChange={(value) => update("title", value)}
                placeholder="Napríklad: Kiko a stratená iskra"
              />
              <TextField
                label="Vekové rozpätie"
                value={draft.audienceAge}
                onChange={(value) => update("audienceAge", value)}
                placeholder="Napríklad: 5 - 7 rokov"
                maxLength={40}
                hint="Presný vek pomáha nastaviť slovník aj tempo."
              />
              <div className="full-width-field">
                <TextField
                  label="Jazykový register"
                  value={draft.languageRegister}
                  onChange={(value) => update("languageRegister", value)}
                  placeholder="Spisovná, hravá slovenčina bez cudzích výrazov"
                  hint="Odporúčanie: spisovná, hravá a zvukomalebná slovenčina."
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <FormSectionHeading number="02" title="Dve srdcia príbehu" detail="Hrdina a kamarát majú byť každý trochu iný." />
            <div className="character-grid">
              <div className="character-panel hero-panel">
                <div className="character-panel-top">
                  <span className="character-symbol hero-symbol"><Icon name="spark" size={17} /></span>
                  <span className="character-role">HLAVNÝ HRDINA</span>
                  <span className="character-anchor">[CHAR_HERO]</span>
                </div>
                <TextField
                  label="Slovenské meno"
                  value={draft.heroName}
                  onChange={(value) => update("heroName", value)}
                  placeholder="Meno hrdinu"
                  maxLength={80}
                />
                <TextField
                  label="Druh, znaky, túžba alebo slabosť"
                  value={draft.heroDescription}
                  onChange={(value) => update("heroDescription", value)}
                  placeholder="Kto je, ako vyzerá, čo veľmi chce a čo mu bráni?"
                  multiline
                />
              </div>
              <div className="character-panel friend-panel">
                <div className="character-panel-top">
                  <span className="character-symbol friend-symbol"><Icon name="heart" size={17} /></span>
                  <span className="character-role">KAMARÁT / SPOJENEC</span>
                  <span className="character-anchor">[CHAR_SIDE]</span>
                </div>
                <TextField
                  label="Slovenské meno"
                  value={draft.sideName}
                  onChange={(value) => update("sideName", value)}
                  placeholder="Meno kamaráta"
                  maxLength={80}
                />
                <TextField
                  label="Druh, úloha a kontrastná povaha"
                  value={draft.sideDescription}
                  onChange={(value) => update("sideDescription", value)}
                  placeholder="V čom je iný a ako pomáha príbehu?"
                  multiline
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <FormSectionHeading number="03" title="Svet a zmysel" detail="Miesto, ktoré cítime, a ponaučenie bez poučovania." />
            <div className="form-grid">
              <TextField
                label="Prostredie a jeho hmatové detaily"
                value={draft.environment}
                onChange={(value) => update("environment", value)}
                placeholder="Názov sveta, materiály, svetlo, vône či drobné zázraky..."
                multiline
                hint="Tento opis sa neskôr uzamkne ako [ENV_WORLD]."
              />
              <TextField
                label="Hlavná zápletka"
                value={draft.plot}
                onChange={(value) => update("plot", value)}
                placeholder="Čo chce hrdina dosiahnuť a čo mu stojí v ceste?"
                multiline
              />
              <TextField
                label="Ponaučenie na konci"
                value={draft.moral}
                onChange={(value) => update("moral", value)}
                placeholder="Čo hrdina pochopí cez svoje rozhodnutie?"
                multiline
              />
            </div>
          </div>

          <div className="form-section technical-section">
            <FormSectionHeading number="04" title="Technický rámec" detail="Dĺžka určí slovný rozpočet, formát zas obrazový výrez." />
            <div className="technical-grid">
              <div className="choice-group">
                <span className="field-label">Presná dĺžka</span>
                <div className="segmented-control duration-control" role="group" aria-label="Dĺžka filmu">
                  {([8, 9, 10] as const).map((minutes) => (
                    <button
                      className={draft.duration === minutes ? "selected" : ""}
                      key={minutes}
                      onClick={() => update("duration", minutes)}
                      type="button"
                    >
                      <strong>{minutes}</strong><span>min</span>
                    </button>
                  ))}
                </div>
                <span className="field-hint">{wordBudget(draft.duration).words.toLocaleString("sk-SK")} slov pri tempe 125 slov za minútu.</span>
              </div>
              <div className="choice-group">
                <span className="field-label">Pomer strán</span>
                <div className="segmented-control ratio-control" role="group" aria-label="Pomer strán">
                  {([
                    { ratio: "16:9" as AspectRatio, label: "Širokouhlý", icon: "▰" },
                    { ratio: "9:16" as AspectRatio, label: "Zvislý", icon: "▯" },
                  ]).map(({ ratio, label, icon }) => (
                    <button
                      className={draft.aspectRatio === ratio ? "selected" : ""}
                      key={ratio}
                      onClick={() => update("aspectRatio", ratio)}
                      type="button"
                    >
                      <span className="ratio-glyph">{icon}</span>
                      <span><strong>{ratio}</strong><small>{label}</small></span>
                    </button>
                  ))}
                </div>
                <span className="field-hint">Výrez obrazu sa prenesie do všetkých obrazových pokynov.</span>
              </div>
            </div>
          </div>

          <div className="form-submit-row">
            <div className="submit-copy">
              <span className="submit-check"><Icon name="check" size={15} /></span>
              <span><strong>Každé pole je dôležitá nitka.</strong><small>Pas môžete kedykoľvek upraviť.</small></span>
            </div>
            <button className="primary-button" disabled={isSaving || isSaved} type="submit">
              <Icon name={isSaving ? "clock" : isSaved ? "check" : "save"} size={17} />
              {isSaving ? "Ukladám pas..." : isSaved ? "Produkčný pas je uložený" : savedProject ? "Uložiť zmeny pasu" : "Uložiť produkčný pas"}
              {!isSaving && !isSaved ? <Icon name="arrow" size={16} /> : null}
            </button>
          </div>
          {notice ? (
            <div className={`notice ${notice.kind}`} role="status">
              <Icon name={notice.kind === "success" ? "check" : "spark"} size={16} />
              {notice.message}
              {notice.kind === "success" && projects.length > 0 ? (
                <button onClick={onOpenConcepts} type="button">Pokračovať k príbehovým námetom</button>
              ) : null}
            </div>
          ) : null}
        </form>

        <PassportPreview
          draft={draft}
          isSaved={isSaved}
          onCopy={onCopy}
          onDownload={onDownload}
          copied={copied}
        />
      </div>

      <section className="closing-note">
        <span className="closing-spark"><Icon name="spark" size={17} /></span>
        <p><strong>Malý režijný tip</strong> Kontrast postáv je najkrajší vtedy, keď sa navzájom niečo naučia, nie keď sa navzájom zmenia.</p>
        <button onClick={isSaved ? onOpenConcepts : onOpenMap} type="button">{isSaved ? "Pokračovať k príbehovým námetom" : "Pozrieť ďalšie kroky"} <Icon name="arrow" size={14} /></button>
      </section>
    </>
  );
}

function LibraryView({
  projects,
  isLoading,
  onLoad,
  onStart,
  onDelete,
  onDuplicate,
}: {
  projects: SavedProject[];
  isLoading: boolean;
  onLoad: (project: SavedProject) => void;
  onStart: () => void;
  onDelete: (project: SavedProject) => Promise<void>;
  onDuplicate: (project: SavedProject) => Promise<void>;
}) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [duplicateId, setDuplicateId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  const handleDelete = async (project: SavedProject) => {
    setBusyId(project.id);
    setDeleteError(null);
    try {
      await onDelete(project);
      setConfirmId(null);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Zmazanie sa nepodarilo.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDuplicate = async (project: SavedProject) => {
    setDuplicateId(project.id);
    setDuplicateError(null);
    try {
      await onDuplicate(project);
    } catch (error) {
      setDuplicateError(error instanceof Error ? error.message : "Duplikovanie sa nepodarilo.");
    } finally {
      setDuplicateId(null);
    }
  };

  return (
    <section className="library-view">
      <div className="welcome-row library-welcome">
        <div>
          <span className="eyebrow">VAŠE TVORIVÉ SVETY <span className="eyebrow-line" /></span>
          <h1>Príbehy, ktoré <em>rastú.</em></h1>
        </div>
        <button className="primary-button library-create" onClick={onStart} type="button">
          <Icon name="plus" size={17} /> Nový produkčný pas
        </button>
      </div>
      <div className="library-intro">
        <div className="library-icon"><Icon name="book" size={22} /></div>
        <div><strong>{projects.length} uložených {projects.length === 1 ? "príbeh" : "príbehov"}</strong><p>Všetky produkčné pasy na jednom mieste.</p></div>
        {isLoading ? <span className="loading-label"><span className="mini-spinner" /> Načítavam knižnicu</span> : null}
      </div>
      {deleteError ? <div className="step-error" role="alert">{deleteError}</div> : null}
      {duplicateError ? <div className="step-error" role="alert">{duplicateError}</div> : null}
      {projects.length ? (
        <div className="library-grid">
          {projects.map((project) => (
            <div className="library-card-wrap" key={project.id}>
              <button className="library-card" onClick={() => onLoad(project)} type="button">
                <div className="library-card-art" style={{ backgroundImage: `url(${worldImageFor(project)})` }} />
                <div className="library-card-body">
                  <div className="library-card-top"><span>PRODUKČNÝ PAS</span><span>{formatDate(project.createdAt)}</span></div>
                  <h3>{project.title}</h3>
                  <p>{project.heroName} a {project.sideName} <span>·</span> {project.audienceAge}</p>
                  <div className="library-progress" aria-label={`Hotové kroky: ${project.completedSteps ?? 1} z 9`}>
                    <span className="library-progress-dots">
                      {Array.from({ length: 9 }).map((_, stepIndex) => (
                        <i className={stepIndex < (project.completedSteps ?? 1) ? "done" : ""} key={stepIndex} />
                      ))}
                    </span>
                    <span className="library-progress-label">{project.completedSteps ?? 1}/9 krokov</span>
                  </div>
                  <div className="library-card-footer"><span>{project.duration} min</span><span>{project.aspectRatio}</span><span className="open-label">Otvoriť <Icon name="arrow" size={13} /></span></div>
                </div>
              </button>
              <div className="library-card-actions">
                <button
                  className="library-duplicate"
                  disabled={duplicateId === project.id}
                  onClick={(event) => {
                    event.stopPropagation();
                    void handleDuplicate(project);
                  }}
                  title="Vytvoriť kópiu tohto projektu"
                  type="button"
                >
                  {duplicateId === project.id ? <span className="mini-spinner" /> : <Icon name="copy" size={13} />}
                  {duplicateId === project.id ? "Kopírujem..." : "Duplikovať"}
                </button>
                <button
                  aria-label={confirmId === project.id ? `Potvrdiť zmazanie ${project.title}` : `Zmazať ${project.title}`}
                  className={`library-delete ${confirmId === project.id ? "confirm" : ""}`}
                  disabled={busyId === project.id}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (confirmId === project.id) {
                      void handleDelete(project);
                    } else {
                      setConfirmId(project.id);
                    }
                  }}
                  title={confirmId === project.id ? "Kliknutím potvrďte zmazanie celého projektu" : "Zmazať projekt"}
                  type="button"
                >
                  {busyId === project.id ? <span className="mini-spinner" /> : confirmId === project.id ? <>Naozaj zmazať?</> : <Icon name="trash" size={13} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-library">
          <div className="empty-illustration"><Icon name="spark" size={35} /></div>
          <span className="eyebrow-small">PRVÁ STRANA JE PRÁZDNA</span>
          <h2>Čaká na svoj príbeh.</h2>
          <p>Odporúčaný návrh je už pripravený. Upravte ho podľa seba a uložte prvý produkčný pas.</p>
          <button className="primary-button" onClick={onStart} type="button">Otvoriť pracovný stôl <Icon name="arrow" size={16} /></button>
        </div>
      )}
      <div className="library-footnote"><Icon name="lock" size={14} /> Projekty sú uložené v pracovnom priestore tejto aplikácie.</div>
    </section>
  );
}

function MapView({
  onBack,
  isSaved,
  selectedConceptId,
  songsSaved,
  screenplaySaved,
  bibleSaved,
  cueSaved,
  promptsSaved,
  motionSaved,
  finalSaved,
  canExport,
  isExporting,
  onExportAll,
  onOpenStage,
  onPreview,
  canPreview,
}: {
  onBack: () => void;
  isSaved: boolean;
  selectedConceptId: number | null;
  songsSaved: boolean;
  screenplaySaved: boolean;
  bibleSaved: boolean;
  cueSaved: boolean;
  promptsSaved: boolean;
  motionSaved: boolean;
  finalSaved: boolean;
  canExport: boolean;
  isExporting: boolean;
  onExportAll: () => void;
  onOpenStage: (index: number) => void;
  onPreview: () => void;
  canPreview: boolean;
}) {
  const currentIndex = !isSaved ? 0 : !selectedConceptId ? 1 : !songsSaved ? 2 : !screenplaySaved ? 3 : !bibleSaved ? 4 : !cueSaved ? 5 : !promptsSaved ? 6 : !motionSaved ? 7 : !finalSaved ? 8 : 9;

  return (
    <section className="map-view">
      <div className="welcome-row map-welcome">
        <div>
          <span className="eyebrow">OD NÁPADU K FILMU <span className="eyebrow-line" /></span>
          <h1>Jeden krok <em>za druhým.</em></h1>
        </div>
        <div className="map-welcome-actions">
          <button
            className="quiet-action map-preview"
            disabled={!canPreview}
            onClick={onPreview}
            title={canPreview ? "Prehrať animatik z uloženej záberovej matice" : "Najprv uložte záberovú maticu (krok 06)"}
            type="button"
          >
            <Icon name="play" size={14} /> {canPreview ? "Prehrať animatik" : "Animatik uzamknutý"}
          </button>
          <button className="primary-button map-export" disabled={!canExport || isExporting} onClick={onExportAll} title={canExport ? "Stiahne všetky uložené kroky projektu v jednom súbore" : "Najprv uložte produkčný pas"} type="button">
            {isExporting ? <span className="button-spinner" /> : <Icon name="download" size={15} />}
            {isExporting ? "Balím projekt..." : "Stiahnuť celý projekt"}
          </button>
          <button className="text-button" onClick={onBack} type="button"><Icon name="arrow" size={15} /> Späť na pracovný stôl</button>
        </div>
      </div>
      <div className="map-intro-card">
        <div className="map-intro-icon"><Icon name="layers" size={22} /></div>
        <div>
          <span className="eyebrow-small">DEVIATKA PREHĽADNÝCH KROKOV</span>
          <h2>Najprv pevný základ, potom filmové kúzlo.</h2>
          <p>Každá etapa nadväzuje na predchádzajúci výstup. Postavy, svet, jazyk aj technické nastavenia zostávajú počas celej výroby zladené.</p>
        </div>
      </div>
      <div className="roadmap-list">
        {productionSteps.map((step, index) => {
          const complete = index === 0
            ? isSaved
            : index === 1
              ? Boolean(selectedConceptId)
              : index === 2
                ? songsSaved
                : index === 3
                  ? screenplaySaved
                  : index === 4
                    ? bibleSaved
                    : index === 5
                      ? cueSaved
                      : index === 6
                        ? promptsSaved
                        : index === 7
                          ? motionSaved
                          : index === 8
                            ? finalSaved
                            : false;
          const current = !complete && index === currentIndex;
          const outputs = [
            "Uzamknutý produkčný pas",
            "Päť príbehových námetov",
            "Časový plán a skladby",
            "Scenár s hlasovými značkami",
            "Vizuálna kniha postáv a sveta",
            "Záberová matica so zvukom",
            "Obrazové pokyny po častiach",
            "Pohybové predpisy pre zábery",
            "Balík pre strih a zverejnenie",
          ];

          return (
            <article className={`roadmap-card ${complete ? "roadmap-complete" : current ? "roadmap-current" : "roadmap-locked"}`} key={step.number}>
              <div className="roadmap-number">{step.number}</div>
              <div className="roadmap-icon"><Icon name={step.icon} size={19} /></div>
              <div className="roadmap-copy">
                <div className="roadmap-title-row"><h3>{step.title}</h3><span className={`roadmap-state ${complete ? "ready" : current ? "now" : "locked"}`}>{complete ? "HOTOVO" : current ? "PRÁVE TERAZ" : "NASLEDUJE"}</span></div>
                <p>{step.detail}</p>
              </div>
              <div className="roadmap-output"><span>VÝSTUP</span><strong>{outputs[index]}</strong></div>
              {index < 9 ? (
                <button className="roadmap-access roadmap-open-button" onClick={() => onOpenStage(index)} type="button" aria-label={`Otvoriť krok ${step.number}: ${step.title}`}>
                  <Icon name={complete ? "check" : index <= currentIndex ? "arrow" : "lock"} size={15} />
                </button>
              ) : (
                <span className="roadmap-access"><Icon name="lock" size={15} /></span>
              )}
            </article>
          );
        })}
      </div>
      <div className="roadmap-footer"><Icon name="spark" size={17} /><span>Odporúčaný rytmus: potvrdiť každý výstup pred otvorením ďalšej etapy.</span></div>
    </section>
  );
}

function projectToDraft(project: SavedProject): ProjectDraft {
  return {
    title: project.title,
    audienceAge: project.audienceAge,
    languageRegister: project.languageRegister,
    heroName: project.heroName,
    heroDescription: project.heroDescription,
    sideName: project.sideName,
    sideDescription: project.sideDescription,
    environment: project.environment,
    plot: project.plot,
    moral: project.moral,
    duration: project.duration,
    aspectRatio: project.aspectRatio,
  };
}

export default function Studio() {
  const [, startTransition] = useTransition();
  const [activeView, setActiveView] = useState<View>("studio");
  const [draft, setDraft] = useState<ProjectDraft>(sampleDraft);
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [savedProject, setSavedProject] = useState<SavedProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [notice, setNotice] = useState<Notice>(null);
  const [copied, setCopied] = useState(false);
  const [concepts, setConcepts] = useState<StoryConcept[]>([]);
  const [selectedConceptId, setSelectedConceptId] = useState<number | null>(null);
  const [conceptsLoading, setConceptsLoading] = useState(false);
  const [isGeneratingConcepts, setIsGeneratingConcepts] = useState(false);
  const [isSavingSelection, setIsSavingSelection] = useState(false);
  const [conceptError, setConceptError] = useState<string | null>(null);
  const [songPackage, setSongPackage] = useState<SongPackage | null>(null);
  const [songsLoading, setSongsLoading] = useState(false);
  const [isGeneratingSongs, setIsGeneratingSongs] = useState(false);
  const [isSavingSongs, setIsSavingSongs] = useState(false);
  const [songsSaved, setSongsSaved] = useState(false);
  const [songError, setSongError] = useState<string | null>(null);
  const [screenplay, setScreenplay] = useState<ScreenplayPackage | null>(null);
  const [screenplayLoading, setScreenplayLoading] = useState(false);
  const [isGeneratingScreenplay, setIsGeneratingScreenplay] = useState(false);
  const [isSavingScreenplay, setIsSavingScreenplay] = useState(false);
  const [screenplaySaved, setScreenplaySaved] = useState(false);
  const [screenplayError, setScreenplayError] = useState<string | null>(null);
  const [bible, setBible] = useState<VisualBible | null>(null);
  const [bibleLoading, setBibleLoading] = useState(false);
  const [isGeneratingBible, setIsGeneratingBible] = useState(false);
  const [isSavingBible, setIsSavingBible] = useState(false);
  const [bibleSaved, setBibleSaved] = useState(false);
  const [bibleError, setBibleError] = useState<string | null>(null);
  const [cueSheet, setCueSheet] = useState<CueSheet | null>(null);
  const [cueLoading, setCueLoading] = useState(false);
  const [isGeneratingCue, setIsGeneratingCue] = useState(false);
  const [isSavingCue, setIsSavingCue] = useState(false);
  const [cueSaved, setCueSaved] = useState(false);
  const [cueError, setCueError] = useState<string | null>(null);
  const [promptPack, setPromptPack] = useState<ImagePromptPackage | null>(null);
  const [promptsLoading, setPromptsLoading] = useState(false);
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);
  const [isSavingPrompts, setIsSavingPrompts] = useState(false);
  const [promptsSaved, setPromptsSaved] = useState(false);
  const [promptsError, setPromptsError] = useState<string | null>(null);
  const [motionPack, setMotionPack] = useState<MotionPackage | null>(null);
  const [motionLoading, setMotionLoading] = useState(false);
  const [isGeneratingMotion, setIsGeneratingMotion] = useState(false);
  const [isSavingMotion, setIsSavingMotion] = useState(false);
  const [motionSaved, setMotionSaved] = useState(false);
  const [motionError, setMotionError] = useState<string | null>(null);
  const [finalPack, setFinalPack] = useState<FinalPackage | null>(null);
  const [finalLoading, setFinalLoading] = useState(false);
  const [isGeneratingFinal, setIsGeneratingFinal] = useState(false);
  const [isSavingFinal, setIsSavingFinal] = useState(false);
  const [finalSaved, setFinalSaved] = useState(false);
  const [finalError, setFinalError] = useState<string | null>(null);
  const [isExportingAll, setIsExportingAll] = useState(false);
  const [restoredDraft, setRestoredDraft] = useState(false);
  const draftRestoreRef = useRef<ProjectDraft | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("atelier-draft-v1");
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<ProjectDraft>;
      const valid =
        draftTextKeys.every((key) => typeof parsed[key] === "string" && (parsed[key] as string).length > 0) &&
        (parsed.duration === 8 || parsed.duration === 9 || parsed.duration === 10) &&
        (parsed.aspectRatio === "16:9" || parsed.aspectRatio === "9:16");
      if (valid && JSON.stringify(parsed) !== JSON.stringify(sampleDraft)) {
        draftRestoreRef.current = parsed as ProjectDraft;
        startTransition(() => {
          setDraft(parsed as ProjectDraft);
          setRestoredDraft(true);
        });
      }
    } catch {
      // localStorage may be unavailable; keep the sample draft.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("atelier-draft-v1", JSON.stringify(draft));
    } catch {
      // Best effort only; the database remains the source of truth.
    }
  }, [draft]);

  useEffect(() => {
    let active = true;

    fetch("/api/projects")
      .then(async (response) => {
        const result = (await response.json()) as {
          projects?: SavedProject[];
          error?: string;
        };
        if (!response.ok) {
          throw new Error(result.error || "Nepodarilo sa načítať knižnicu.");
        }
        return result;
      })
      .then(({ projects: saved = [] }) => {
        if (active) {
          setProjects(saved);
          setApiAvailable(true);

          try {
            const lastId = window.localStorage.getItem("atelier-last-project");
            const last = lastId ? saved.find((item) => item.id === lastId) : undefined;
            if (last) {
              const kept = draftRestoreRef.current;
              if (!(kept && kept.title === last.title)) {
                setDraft(projectToDraft(last));
                setRestoredDraft(false);
              }
              setSavedProject(last);
              setNotice({
                message: `Vrátili sme vám posledný príbeh „${last.title}“. Rozpracované zmeny zostali zachované.`,
                kind: "success",
              });
            }
          } catch {
            // localStorage unavailable; start fresh instead.
          }
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setApiAvailable(false);
          setNotice({
            message:
              error instanceof Error
                ? error.message
                : "Ukladanie nie je dostupné. Skontrolujte pripojenie k databáze.",
            kind: "error",
          });
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (activeView !== "concepts" && activeView !== "timeline" && activeView !== "songs" && activeView !== "script" && activeView !== "bible" && activeView !== "shots" && activeView !== "prompts" && activeView !== "motion" && activeView !== "finalize" && activeView !== "preview") return;

    let active = true;

    if (!savedProject?.id) {
      return;
    }

    startTransition(() => {
      setConceptsLoading(true);
      setConceptError(null);
    });

    fetch(`/api/projects/${savedProject.id}/concepts`)
      .then(async (response) => {
        const result = (await response.json()) as {
          conceptSet?: SavedConceptSet | null;
          error?: string;
        };
        if (!response.ok) throw new Error(result.error || "Námety sa nepodarilo načítať.");
        return result;
      })
      .then(({ conceptSet }) => {
        if (!active) return;
        setConcepts(conceptSet?.concepts ?? []);
        setSelectedConceptId(conceptSet?.selectedConceptId ?? null);
      })
      .catch((error) => {
        if (active) {
          setConceptError(error instanceof Error ? error.message : "Námety sa nepodarilo načítať.");
        }
      })
      .finally(() => {
        if (active) setConceptsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [activeView, savedProject?.id]);

  useEffect(() => {
    if (activeView !== "songs" && activeView !== "script" && activeView !== "bible" && activeView !== "shots" && activeView !== "prompts" && activeView !== "motion" && activeView !== "finalize" && activeView !== "preview") return;

    let active = true;

    if (!savedProject?.id) {
      return;
    }

    startTransition(() => {
      setSongsLoading(true);
      setSongError(null);
    });

    fetch(`/api/projects/${savedProject.id}/songs`)
      .then(async (response) => {
        const result = (await response.json()) as {
          songSet?: SavedSongSet | null;
          error?: string;
        };
        if (!response.ok) throw new Error(result.error || "Skladby sa nepodarilo načítať.");
        return result;
      })
      .then(({ songSet }) => {
        if (!active) return;
        setSongPackage(songSet?.songPackage ?? null);
        setSongsSaved(Boolean(songSet));
      })
      .catch((error) => {
        if (active) {
          setSongError(error instanceof Error ? error.message : "Skladby sa nepodarilo načítať.");
        }
      })
      .finally(() => {
        if (active) setSongsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [activeView, savedProject?.id]);

  useEffect(() => {
    if (activeView !== "script" && activeView !== "bible" && activeView !== "shots" && activeView !== "prompts" && activeView !== "motion" && activeView !== "finalize" && activeView !== "preview") return;

    let active = true;

    if (!savedProject?.id) {
      return;
    }

    startTransition(() => {
      setScreenplayLoading(true);
      setScreenplayError(null);
    });

    fetch(`/api/projects/${savedProject.id}/screenplay`)
      .then(async (response) => {
        const result = (await response.json()) as {
          screenplaySet?: SavedScreenplay | null;
          error?: string;
        };
        if (!response.ok) throw new Error(result.error || "Scenár sa nepodarilo načítať.");
        return result;
      })
      .then(({ screenplaySet }) => {
        if (!active) return;
        setScreenplay(screenplaySet?.screenplay ?? null);
        setScreenplaySaved(Boolean(screenplaySet));
      })
      .catch((error) => {
        if (active) {
          setScreenplayError(error instanceof Error ? error.message : "Scenár sa nepodarilo načítať.");
        }
      })
      .finally(() => {
        if (active) setScreenplayLoading(false);
      });

    return () => {
      active = false;
    };
  }, [activeView, savedProject?.id]);

  useEffect(() => {
    if (activeView !== "bible" && activeView !== "shots" && activeView !== "prompts" && activeView !== "motion" && activeView !== "finalize" && activeView !== "preview") return;

    let active = true;

    if (!savedProject?.id) {
      return;
    }

    startTransition(() => {
      setBibleLoading(true);
      setBibleError(null);
    });

    fetch(`/api/projects/${savedProject.id}/visual-bible`)
      .then(async (response) => {
        const result = (await response.json()) as {
          bibleSet?: SavedVisualBible | null;
          error?: string;
        };
        if (!response.ok) throw new Error(result.error || "Vizuálnu knihu sa nepodarilo načítať.");
        return result;
      })
      .then(({ bibleSet }) => {
        if (!active) return;
        setBible(bibleSet?.visualBible ?? null);
        setBibleSaved(Boolean(bibleSet));
      })
      .catch((error) => {
        if (active) {
          setBibleError(error instanceof Error ? error.message : "Vizuálnu knihu sa nepodarilo načítať.");
        }
      })
      .finally(() => {
        if (active) setBibleLoading(false);
      });

    return () => {
      active = false;
    };
  }, [activeView, savedProject?.id]);

  useEffect(() => {
    if (activeView !== "shots" && activeView !== "prompts" && activeView !== "motion" && activeView !== "finalize" && activeView !== "preview") return;

    let active = true;

    if (!savedProject?.id) {
      return;
    }

    startTransition(() => {
      setCueLoading(true);
      setCueError(null);
    });

    fetch(`/api/projects/${savedProject.id}/cue-sheet`)
      .then(async (response) => {
        const result = (await response.json()) as {
          cueSheetSet?: SavedCueSheet | null;
          error?: string;
        };
        if (!response.ok) throw new Error(result.error || "Záberovú maticu sa nepodarilo načítať.");
        return result;
      })
      .then(({ cueSheetSet }) => {
        if (!active) return;
        setCueSheet(cueSheetSet?.cueSheet ?? null);
        setCueSaved(Boolean(cueSheetSet));
      })
      .catch((error) => {
        if (active) {
          setCueError(error instanceof Error ? error.message : "Záberovú maticu sa nepodarilo načítať.");
        }
      })
      .finally(() => {
        if (active) setCueLoading(false);
      });

    return () => {
      active = false;
    };
  }, [activeView, savedProject?.id]);

  useEffect(() => {
    if (activeView !== "prompts" && activeView !== "motion" && activeView !== "finalize" && activeView !== "preview") return;

    let active = true;

    if (!savedProject?.id) {
      return;
    }

    startTransition(() => {
      setPromptsLoading(true);
      setPromptsError(null);
    });

    fetch(`/api/projects/${savedProject.id}/image-prompts`)
      .then(async (response) => {
        const result = (await response.json()) as {
          promptSet?: SavedImagePrompts | null;
          error?: string;
        };
        if (!response.ok) throw new Error(result.error || "Obrazové pokyny sa nepodarilo načítať.");
        return result;
      })
      .then(({ promptSet }) => {
        if (!active) return;
        setPromptPack(promptSet?.imagePrompts ?? null);
        setPromptsSaved(Boolean(promptSet));
      })
      .catch((error) => {
        if (active) {
          setPromptsError(error instanceof Error ? error.message : "Obrazové pokyny sa nepodarilo načítať.");
        }
      })
      .finally(() => {
        if (active) setPromptsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [activeView, savedProject?.id]);

  useEffect(() => {
    if (activeView !== "motion" && activeView !== "finalize" && activeView !== "preview") return;

    let active = true;

    if (!savedProject?.id) {
      return;
    }

    startTransition(() => {
      setMotionLoading(true);
      setMotionError(null);
    });

    fetch(`/api/projects/${savedProject.id}/motion`)
      .then(async (response) => {
        const result = (await response.json()) as {
          motionSet?: SavedMotionPackage | null;
          error?: string;
        };
        if (!response.ok) throw new Error(result.error || "Pohybové predpisy sa nepodarilo načítať.");
        return result;
      })
      .then(({ motionSet }) => {
        if (!active) return;
        setMotionPack(motionSet?.motionPackage ?? null);
        setMotionSaved(Boolean(motionSet));
      })
      .catch((error) => {
        if (active) {
          setMotionError(error instanceof Error ? error.message : "Pohybové predpisy sa nepodarilo načítať.");
        }
      })
      .finally(() => {
        if (active) setMotionLoading(false);
      });

    return () => {
      active = false;
    };
  }, [activeView, savedProject?.id]);

  useEffect(() => {
    if (activeView !== "finalize" && activeView !== "preview") return;

    let active = true;

    if (!savedProject?.id) {
      return;
    }

    startTransition(() => {
      setFinalLoading(true);
      setFinalError(null);
    });

    fetch(`/api/projects/${savedProject.id}/final-package`)
      .then(async (response) => {
        const result = (await response.json()) as {
          finalSet?: SavedFinalPackage | null;
          error?: string;
        };
        if (!response.ok) throw new Error(result.error || "Záverečný balík sa nepodarilo načítať.");
        return result;
      })
      .then(({ finalSet }) => {
        if (!active) return;
        setFinalPack(finalSet?.finalPackage ?? null);
        setFinalSaved(Boolean(finalSet));
      })
      .catch((error) => {
        if (active) {
          setFinalError(error instanceof Error ? error.message : "Záverečný balík sa nepodarilo načítať.");
        }
      })
      .finally(() => {
        if (active) setFinalLoading(false);
      });

    return () => {
      active = false;
    };
  }, [activeView, savedProject?.id]);

  const isSaved = useMemo(
    () =>
      Boolean(
        savedProject &&
          draftTextKeys.every((key) => savedProject[key] === draft[key]),
      ),
    [draft, savedProject],
  );
  const selectedConcept = concepts.find((concept) => concept.id === selectedConceptId) ?? null;
  const activeStepIndex = activeView === "concepts" ? 1 : activeView === "timeline" || activeView === "songs" ? 2 : activeView === "script" ? 3 : activeView === "bible" ? 4 : activeView === "shots" || activeView === "preview" ? 5 : activeView === "prompts" ? 6 : activeView === "motion" ? 7 : activeView === "finalize" ? 8 : 0;
  const activeStep = productionSteps[activeStepIndex];

  const updateDraft = (nextDraft: ProjectDraft) => {
    const isDirtyRelativeToSaved = Boolean(
      savedProject &&
        draftTextKeys.some((key) => savedProject[key] !== nextDraft[key]),
    );

    setDraft(nextDraft);
    setNotice(null);

    if (isDirtyRelativeToSaved) {
      setConcepts([]);
      setSelectedConceptId(null);
      clearDerivedProjectState();
      setNotice({
        message: "Zmeny v produkčnom pase zrušili predchádzajúce námety a tvorivé výstupy. Uložte projekt, aby ste ich obnovili.",
        kind: "success",
      });
    }
  };

  const clearDerivedProjectState = () => {
    setSongPackage(null);
    setSongsSaved(false);
    setSongError(null);
    setScreenplay(null);
    setScreenplaySaved(false);
    setScreenplayError(null);
    setBible(null);
    setBibleSaved(false);
    setBibleError(null);
    setCueSheet(null);
    setCueSaved(false);
    setCueError(null);
    setPromptPack(null);
    setPromptsSaved(false);
    setPromptsError(null);
    setMotionPack(null);
    setMotionSaved(false);
    setMotionError(null);
    setFinalPack(null);
    setFinalSaved(false);
    setFinalError(null);
  };

  const clearLaterStages = (fromStage: "songs" | "screenplay" | "bible" | "cue" | "prompts" | "motion") => {
    const resetTargets: Record<typeof fromStage, Array<"screenplay" | "bible" | "cue" | "prompts" | "motion" | "final">> = {
      songs: ["screenplay", "bible", "cue", "prompts", "motion", "final"],
      screenplay: ["bible", "cue", "prompts", "motion", "final"],
      bible: ["cue", "prompts", "motion", "final"],
      cue: ["prompts", "motion", "final"],
      prompts: ["motion", "final"],
      motion: ["final"],
    };

    const setters = {
      screenplay: () => {
        setScreenplay(null);
        setScreenplaySaved(false);
        setScreenplayError(null);
      },
      bible: () => {
        setBible(null);
        setBibleSaved(false);
        setBibleError(null);
      },
      cue: () => {
        setCueSheet(null);
        setCueSaved(false);
        setCueError(null);
      },
      prompts: () => {
        setPromptPack(null);
        setPromptsSaved(false);
        setPromptsError(null);
      },
      motion: () => {
        setMotionPack(null);
        setMotionSaved(false);
        setMotionError(null);
      },
      final: () => {
        setFinalPack(null);
        setFinalSaved(false);
        setFinalError(null);
      },
    };

    for (const target of resetTargets[fromStage]) {
      setters[target]();
    }
  };

  const resetDraft = () => {
    updateDraft({ ...sampleDraft });
    draftRestoreRef.current = null;
    setRestoredDraft(false);
    rememberLastProject(null);
    setSavedProject(null);
    setConcepts([]);
    setSelectedConceptId(null);
    setConceptError(null);
    clearDerivedProjectState();
  };

  const rememberLastProject = (projectId: string | null) => {
    try {
      if (projectId) window.localStorage.setItem("atelier-last-project", projectId);
      else window.localStorage.removeItem("atelier-last-project");
    } catch {
      // Session memory is best effort only.
    }
  };

  const openProject = (project: SavedProject) => {
    const loadedDraft = projectToDraft(project);
    rememberLastProject(project.id);
    setDraft(loadedDraft);
    setSavedProject(project);
    setConcepts([]);
    setSelectedConceptId(null);
    setConceptError(null);
    setNotice(null);
    clearDerivedProjectState();
    setActiveView("studio");
  };

  const saveProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setNotice(null);

    try {
      const response = await fetch(savedProject ? `/api/projects/${savedProject.id}` : "/api/projects", {
        method: savedProject ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const result = (await response.json()) as { project?: SavedProject; error?: string };
      if (!response.ok || !result.project) {
        throw new Error(result.error || "Produkčný pas sa nepodarilo uložiť.");
      }

      const project = result.project;
      setProjects((current) => [project, ...current.filter((item) => item.id !== project.id)].slice(0, 20));
      if (savedProject) {
        setConcepts([]);
        setSelectedConceptId(null);
        clearDerivedProjectState();
      }
      setSavedProject(project);
      rememberLastProject(project.id);
      setApiAvailable(true);
      setNotice({ message: "Produkčný pas je bezpečne uložený. Základ príbehu je pripravený.", kind: "success" });
    } catch (error) {
      setNotice({
        message: error instanceof Error ? error.message : "Uloženie sa nepodarilo. Skúste to znova.",
        kind: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const prepareConcepts = async () => {
    if (!savedProject || !isSaved) {
      setConceptError("Najprv uložte aktuálny produkčný pas.");
      return;
    }

    setIsGeneratingConcepts(true);
    setConceptError(null);

    try {
      await new Promise<void>((resolve) => window.setTimeout(resolve, 160));
      const generated = generateStoryConcepts(draft);
      const response = await fetch(`/api/projects/${savedProject.id}/concepts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concepts: generated, selectedConceptId: null }),
      });
      const result = (await response.json()) as {
        conceptSet?: SavedConceptSet;
        error?: string;
      };

      if (!response.ok || !result.conceptSet) {
        throw new Error(result.error || "Námety sa nepodarilo uložiť.");
      }

      setConcepts(result.conceptSet.concepts);
      setSelectedConceptId(null);
      clearDerivedProjectState();
      setApiAvailable(true);
    } catch (error) {
      setConceptError(error instanceof Error ? error.message : "Námety sa nepodarilo pripraviť.");
    } finally {
      setIsGeneratingConcepts(false);
    }
  };

  const selectConcept = async (conceptId: number) => {
    if (!savedProject || !isSaved || concepts.length !== 5) return;

    setIsSavingSelection(true);
    setConceptError(null);

    try {
      const response = await fetch(`/api/projects/${savedProject.id}/concepts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concepts, selectedConceptId: conceptId }),
      });
      const result = (await response.json()) as {
        conceptSet?: SavedConceptSet;
        error?: string;
      };

      if (!response.ok || !result.conceptSet) {
        throw new Error(result.error || "Výber sa nepodarilo uložiť.");
      }

      setConcepts(result.conceptSet.concepts);
      setSelectedConceptId(result.conceptSet.selectedConceptId);
      clearDerivedProjectState();
      setApiAvailable(true);
    } catch (error) {
      setConceptError(error instanceof Error ? error.message : "Výber sa nepodarilo uložiť.");
    } finally {
      setIsSavingSelection(false);
    }
  };

  const prepareSongs = async () => {
    if (!savedProject || !isSaved || !selectedConcept) {
      setSongError("Najprv uložte produkčný pas a vyberte príbehový smer.");
      return;
    }

    setIsGeneratingSongs(true);
    setSongError(null);

    try {
      await new Promise<void>((resolve) => window.setTimeout(resolve, 160));
      const generated = generateSongPackage(draft, selectedConcept);
      const response = await fetch(`/api/projects/${savedProject.id}/songs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songPackage: generated }),
      });
      const result = (await response.json()) as {
        songSet?: SavedSongSet;
        error?: string;
      };

      if (!response.ok || !result.songSet) {
        throw new Error(result.error || "Skladby sa nepodarilo uložiť.");
      }

      setSongPackage(result.songSet.songPackage);
      setSongsSaved(true);
      clearLaterStages("songs");
      setApiAvailable(true);
    } catch (error) {
      setSongError(error instanceof Error ? error.message : "Skladby sa nepodarilo pripraviť.");
    } finally {
      setIsGeneratingSongs(false);
    }
  };

  const updateSongDraft = (nextPackage: SongPackage) => {
    setSongPackage(nextPackage);
    setSongsSaved(false);
    setSongError(null);
    clearLaterStages("songs");
  };

  const saveSongs = async () => {
    if (!savedProject || !isSaved || !selectedConcept || !songPackage) {
      setSongError("Najprv uložte produkčný pas a vyberte príbehový smer.");
      return;
    }

    setIsSavingSongs(true);
    setSongError(null);

    try {
      const response = await fetch(`/api/projects/${savedProject.id}/songs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songPackage }),
      });
      const result = (await response.json()) as {
        songSet?: SavedSongSet;
        error?: string;
      };

      if (!response.ok || !result.songSet) {
        throw new Error(result.error || "Skladby sa nepodarilo uložiť.");
      }

      setSongPackage(result.songSet.songPackage);
      setSongsSaved(true);
      clearLaterStages("songs");
      setApiAvailable(true);
    } catch (error) {
      setSongError(error instanceof Error ? error.message : "Skladby sa nepodarilo uložiť.");
    } finally {
      setIsSavingSongs(false);
    }
  };

  const prepareScreenplay = async () => {
    if (!savedProject || !isSaved || !selectedConcept || !songPackage || !songsSaved) {
      setScreenplayError("Najprv uložte produkčný pas, vyberte príbeh a uložte obe piesne.");
      return;
    }

    setIsGeneratingScreenplay(true);
    setScreenplayError(null);

    try {
      await new Promise<void>((resolve) => window.setTimeout(resolve, 160));
      const generated = generateScreenplay(draft, selectedConcept, songPackage);
      // Show the draft immediately so it stays editable even if saving fails.
      setScreenplay(generated);
      setScreenplaySaved(false);
      const response = await fetch(`/api/projects/${savedProject.id}/screenplay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ screenplay: generated }),
      });
      const result = (await response.json()) as {
        screenplaySet?: SavedScreenplay;
        error?: string;
      };

      if (!response.ok || !result.screenplaySet) {
        throw new Error(result.error || "Scenár sa nepodarilo uložiť.");
      }

      setScreenplay(result.screenplaySet.screenplay);
      setScreenplaySaved(true);
      clearLaterStages("screenplay");
      setApiAvailable(true);
    } catch (error) {
      setScreenplayError(
        `${error instanceof Error ? error.message : "Scenár sa nepodarilo uložiť."} Náčrt môžeš skrátiť priamo v scénach a skúsiť znova.`,
      );
    } finally {
      setIsGeneratingScreenplay(false);
    }
  };

  const updateScreenplayDraft = (nextScreenplay: ScreenplayPackage) => {
    setScreenplay(nextScreenplay);
    setScreenplaySaved(false);
    setScreenplayError(null);
    clearLaterStages("screenplay");
  };

  const saveScreenplay = async () => {
    if (!savedProject || !isSaved || !selectedConcept || !songPackage || !songsSaved || !screenplay) {
      setScreenplayError("Scenár musí nadväzovať na uložené piesne a vybraný príbeh.");
      return;
    }

    setIsSavingScreenplay(true);
    setScreenplayError(null);

    try {
      const response = await fetch(`/api/projects/${savedProject.id}/screenplay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ screenplay }),
      });
      const result = (await response.json()) as {
        screenplaySet?: SavedScreenplay;
        error?: string;
      };

      if (!response.ok || !result.screenplaySet) {
        throw new Error(result.error || "Scenár sa nepodarilo uložiť.");
      }

      setScreenplay(result.screenplaySet.screenplay);
      setScreenplaySaved(true);
      clearLaterStages("screenplay");
      setApiAvailable(true);
    } catch (error) {
      setScreenplayError(error instanceof Error ? error.message : "Scenár sa nepodarilo uložiť.");
    } finally {
      setIsSavingScreenplay(false);
    }
  };

  const prepareBible = async () => {
    if (!savedProject || !isSaved || !selectedConcept || !screenplaySaved) {
      setBibleError("Najprv uložte scenár vybraného príbehu.");
      return;
    }

    setIsGeneratingBible(true);
    setBibleError(null);

    try {
      await new Promise<void>((resolve) => window.setTimeout(resolve, 160));
      const generated = generateVisualBible(draft, selectedConcept);
      // Keep the draft on screen so it stays editable even if saving is rejected.
      setBible(generated);
      setBibleSaved(false);
      const response = await fetch(`/api/projects/${savedProject.id}/visual-bible`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visualBible: generated }),
      });
      const result = (await response.json()) as {
        bibleSet?: SavedVisualBible;
        error?: string;
      };

      if (!response.ok || !result.bibleSet) {
        throw new Error(result.error || "Vizuálnu knihu sa nepodarilo uložiť.");
      }

      setBible(result.bibleSet.visualBible);
      setBibleSaved(true);
      clearLaterStages("bible");
      setApiAvailable(true);
    } catch (error) {
      setBibleError(
        `${error instanceof Error ? error.message : "Vizuálnu knihu sa nepodarilo uložiť."} Návrh môžete upraviť nižšie a uložiť znova.`,
      );
    } finally {
      setIsGeneratingBible(false);
    }
  };

  const updateBibleDraft = (nextBible: VisualBible) => {
    setBible(nextBible);
    setBibleSaved(false);
    setBibleError(null);
    clearLaterStages("bible");
  };

  const saveBible = async () => {
    if (!savedProject || !isSaved || !selectedConcept || !screenplaySaved || !bible) {
      setBibleError("Vizuálna kniha musí nadväzovať na uložený scenár.");
      return;
    }

    setIsSavingBible(true);
    setBibleError(null);

    try {
      const response = await fetch(`/api/projects/${savedProject.id}/visual-bible`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visualBible: bible }),
      });
      const result = (await response.json()) as {
        bibleSet?: SavedVisualBible;
        error?: string;
      };

      if (!response.ok || !result.bibleSet) {
        throw new Error(result.error || "Vizuálnu knihu sa nepodarilo uložiť.");
      }

      setBible(result.bibleSet.visualBible);
      setBibleSaved(true);
      clearLaterStages("bible");
      setApiAvailable(true);
    } catch (error) {
      setBibleError(error instanceof Error ? error.message : "Vizuálnu knihu sa nepodarilo uložiť.");
    } finally {
      setIsSavingBible(false);
    }
  };

  const prepareCueSheet = async () => {
    if (!savedProject || !isSaved || !selectedConcept || !bibleSaved || !screenplay) {
      setCueError("Najprv uložte vizuálnu knihu a scenár vybraného príbehu.");
      return;
    }

    setIsGeneratingCue(true);
    setCueError(null);

    try {
      await new Promise<void>((resolve) => window.setTimeout(resolve, 160));
      const generated = generateCueSheet(draft, selectedConcept, screenplay);
      const response = await fetch(`/api/projects/${savedProject.id}/cue-sheet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cueSheet: generated }),
      });
      const result = (await response.json()) as {
        cueSheetSet?: SavedCueSheet;
        error?: string;
      };

      if (!response.ok || !result.cueSheetSet) {
        throw new Error(result.error || "Záberovú maticu sa nepodarilo uložiť.");
      }

      setCueSheet(result.cueSheetSet.cueSheet);
      setCueSaved(true);
      clearLaterStages("cue");
      setApiAvailable(true);
    } catch (error) {
      setCueError(error instanceof Error ? error.message : "Záberovú maticu sa nepodarilo pripraviť.");
    } finally {
      setIsGeneratingCue(false);
    }
  };

  const saveCueSheet = async () => {
    if (!savedProject || !isSaved || !selectedConcept || !bibleSaved || !cueSheet) {
      setCueError("Matica musí nadväzovať na uloženú vizuálnu knihu.");
      return;
    }

    setIsSavingCue(true);
    setCueError(null);

    try {
      const response = await fetch(`/api/projects/${savedProject.id}/cue-sheet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cueSheet }),
      });
      const result = (await response.json()) as {
        cueSheetSet?: SavedCueSheet;
        error?: string;
      };

      if (!response.ok || !result.cueSheetSet) {
        throw new Error(result.error || "Záberovú maticu sa nepodarilo uložiť.");
      }

      setCueSheet(result.cueSheetSet.cueSheet);
      setCueSaved(true);
      clearLaterStages("cue");
      setApiAvailable(true);
    } catch (error) {
      setCueError(error instanceof Error ? error.message : "Záberovú maticu sa nepodarilo uložiť.");
    } finally {
      setIsSavingCue(false);
    }
  };

  const preparePrompts = async () => {
    if (!savedProject || !isSaved || !selectedConcept || !cueSaved || !bible || !cueSheet) {
      setPromptsError("Najprv uložte záberovú maticu a vizuálnu knihu.");
      return;
    }

    setIsGeneratingPrompts(true);
    setPromptsError(null);

    try {
      await new Promise<void>((resolve) => window.setTimeout(resolve, 160));
      const generated = generateImagePrompts(draft, selectedConcept, bible, cueSheet);
      const response = await fetch(`/api/projects/${savedProject.id}/image-prompts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagePrompts: generated }),
      });
      const result = (await response.json()) as {
        promptSet?: SavedImagePrompts;
        error?: string;
      };

      if (!response.ok || !result.promptSet) {
        throw new Error(result.error || "Obrazové pokyny sa nepodarilo uložiť.");
      }

      setPromptPack(result.promptSet.imagePrompts);
      setPromptsSaved(true);
      clearLaterStages("prompts");
      setApiAvailable(true);
    } catch (error) {
      setPromptsError(error instanceof Error ? error.message : "Obrazové pokyny sa nepodarilo pripraviť.");
    } finally {
      setIsGeneratingPrompts(false);
    }
  };

  const savePrompts = async () => {
    if (!savedProject || !isSaved || !selectedConcept || !cueSaved || !promptPack) {
      setPromptsError("Pokyny musia zodpovedať uloženej záberovej matici.");
      return;
    }

    setIsSavingPrompts(true);
    setPromptsError(null);

    try {
      const response = await fetch(`/api/projects/${savedProject.id}/image-prompts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagePrompts: promptPack }),
      });
      const result = (await response.json()) as {
        promptSet?: SavedImagePrompts;
        error?: string;
      };

      if (!response.ok || !result.promptSet) {
        throw new Error(result.error || "Obrazové pokyny sa nepodarilo uložiť.");
      }

      setPromptPack(result.promptSet.imagePrompts);
      setPromptsSaved(true);
      clearLaterStages("prompts");
      setApiAvailable(true);
    } catch (error) {
      setPromptsError(error instanceof Error ? error.message : "Obrazové pokyny sa nepodarilo uložiť.");
    } finally {
      setIsSavingPrompts(false);
    }
  };

  const prepareMotion = async () => {
    if (!savedProject || !isSaved || !selectedConcept || !promptsSaved || !cueSheet) {
      setMotionError("Najprv uložte obrazové pokyny a záberovú maticu.");
      return;
    }

    setIsGeneratingMotion(true);
    setMotionError(null);

    try {
      await new Promise<void>((resolve) => window.setTimeout(resolve, 160));
      const generated = generateMotionPackage(draft, selectedConcept, cueSheet);
      const response = await fetch(`/api/projects/${savedProject.id}/motion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motionPackage: generated }),
      });
      const result = (await response.json()) as {
        motionSet?: SavedMotionPackage;
        error?: string;
      };

      if (!response.ok || !result.motionSet) {
        throw new Error(result.error || "Pohybové predpisy sa nepodarilo uložiť.");
      }

      setMotionPack(result.motionSet.motionPackage);
      setMotionSaved(true);
      clearLaterStages("motion");
      setApiAvailable(true);
    } catch (error) {
      setMotionError(error instanceof Error ? error.message : "Pohybové predpisy sa nepodarilo pripraviť.");
    } finally {
      setIsGeneratingMotion(false);
    }
  };

  const saveMotion = async () => {
    if (!savedProject || !isSaved || !selectedConcept || !promptsSaved || !motionPack) {
      setMotionError("Pohybové predpisy musia zodpovedať uloženým obrazovým pokynom.");
      return;
    }

    setIsSavingMotion(true);
    setMotionError(null);

    try {
      const response = await fetch(`/api/projects/${savedProject.id}/motion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motionPackage: motionPack }),
      });
      const result = (await response.json()) as {
        motionSet?: SavedMotionPackage;
        error?: string;
      };

      if (!response.ok || !result.motionSet) {
        throw new Error(result.error || "Pohybové predpisy sa nepodarilo uložiť.");
      }

      setMotionPack(result.motionSet.motionPackage);
      setMotionSaved(true);
      clearLaterStages("motion");
      setApiAvailable(true);
    } catch (error) {
      setMotionError(error instanceof Error ? error.message : "Pohybové predpisy sa nepodarilo uložiť.");
    } finally {
      setIsSavingMotion(false);
    }
  };

  const activeSavedProject = projects.find((item) => item.id === savedProject?.id);
  const canPreviewFilm = Boolean(cueSheet) || (activeSavedProject?.completedSteps ?? 0) >= 6;

  const prepareFinal = async () => {
    if (!savedProject || !isSaved || !selectedConcept || !motionSaved || !bible) {
      setFinalError("Najprv uložte pohybové predpisy a vizuálnu knihu.");
      return;
    }

    setIsGeneratingFinal(true);
    setFinalError(null);

    try {
      await new Promise<void>((resolve) => window.setTimeout(resolve, 160));
      const generated = generateFinalPackage(draft, selectedConcept, bible);
      const response = await fetch(`/api/projects/${savedProject.id}/final-package`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finalPackage: generated }),
      });
      const result = (await response.json()) as {
        finalSet?: SavedFinalPackage;
        error?: string;
      };

      if (!response.ok || !result.finalSet) {
        throw new Error(result.error || "Záverečný balík sa nepodarilo uložiť.");
      }

      setFinalPack(result.finalSet.finalPackage);
      setFinalSaved(true);
      setApiAvailable(true);
    } catch (error) {
      setFinalError(error instanceof Error ? error.message : "Záverečný balík sa nepodarilo pripraviť.");
    } finally {
      setIsGeneratingFinal(false);
    }
  };

  const saveFinal = async () => {
    if (!savedProject || !isSaved || !selectedConcept || !motionSaved || !finalPack) {
      setFinalError("Balík musí nadväzovať na uložený pohybový motor.");
      return;
    }

    setIsSavingFinal(true);
    setFinalError(null);

    try {
      const response = await fetch(`/api/projects/${savedProject.id}/final-package`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finalPackage: finalPack }),
      });
      const result = (await response.json()) as {
        finalSet?: SavedFinalPackage;
        error?: string;
      };

      if (!response.ok || !result.finalSet) {
        throw new Error(result.error || "Záverečný balík sa nepodarilo uložiť.");
      }

      setFinalPack(result.finalSet.finalPackage);
      setFinalSaved(true);
      setApiAvailable(true);
    } catch (error) {
      setFinalError(error instanceof Error ? error.message : "Záverečný balík sa nepodarilo uložiť.");
    } finally {
      setIsSavingFinal(false);
    }
  };

  const selectPreset = (preset: WorldPreset) => {
    updateDraft({ ...preset.draft });
    setSavedProject(null);
    setRestoredDraft(false);
    setConcepts([]);
    setSelectedConceptId(null);
    setSongPackage(null);
    setSongsSaved(false);
    setScreenplay(null);
    setScreenplaySaved(false);
    setBible(null);
    setBibleSaved(false);
    setCueSheet(null);
    setCueSaved(false);
    setPromptPack(null);
    setPromptsSaved(false);
    setMotionPack(null);
    setMotionSaved(false);
    setFinalPack(null);
    setFinalSaved(false);
    setNotice({
      message: `Svet „${preset.name}“ je načítaný v produkčnom pase. Upravte detaily a uložte ho.`,
      kind: "success",
    });
    window.setTimeout(() => {
      document.getElementById("intake-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  const duplicateProject = async (project: SavedProject) => {
    const template = projectToDraft(project);
    const rawTitle = template.title.trim();
    const duplicateTitle = rawTitle ? `${rawTitle.replace(/\s*\(kópia\)$/i, "")} (kópia)` : "Kópia projektu";
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...template, title: duplicateTitle }),
    });
    const result = (await response.json()) as { project?: SavedProject; error?: string };
    if (!response.ok || !result.project) {
      throw new Error(result.error || "Duplikovanie sa nepodarilo.");
    }

    const created = result.project;
    setProjects((current) => [created, ...current.filter((item) => item.id !== created.id)].slice(0, 20));
    rememberLastProject(created.id);
    setDraft(projectToDraft(created));
    setSavedProject(created);
    setConcepts([]);
    setSelectedConceptId(null);
    setNotice({
      message: `Projekt „${duplicateTitle}“ bol vytvorený ako nová kópia. Môžete ho ihneď upravovať alebo posunúť ďalej v procese.`,
      kind: "success",
    });
    clearDerivedProjectState();
    setActiveView("studio");
  };

  const deleteProject = async (project: SavedProject) => {
    const response = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
    const result = (await response.json()) as { ok?: boolean; error?: string };
    if (!response.ok || !result.ok) {
      throw new Error(result.error || "Zmazanie sa nepodarilo.");
    }
    setProjects((current) => current.filter((item) => item.id !== project.id));
    try {
      if (window.localStorage.getItem("atelier-last-project") === project.id) {
        rememberLastProject(null);
      }
    } catch {
      // Nothing to clean up when storage is unavailable.
    }
    if (savedProject?.id === project.id) {
      resetDraft();
    }
  };

  const exportWholeProject = async () => {
    if (!savedProject) return;
    setIsExportingAll(true);
    try {
      const base = `/api/projects/${savedProject.id}`;
      const endpoints = ["concepts", "songs", "screenplay", "visual-bible", "cue-sheet", "image-prompts", "motion", "final-package"];
      const results = await Promise.all(
        endpoints.map(async (endpoint) => {
          const response = await fetch(`${base}/${endpoint}`);
          if (!response.ok) return null;
          return response.json();
        }),
      );
      const payload = {
        project: draft,
        exportedAt: new Date().toISOString(),
        timeline: runtimeTimeline(draft.duration),
        concepts: results[0]?.conceptSet ?? null,
        songs: results[1]?.songSet ?? null,
        screenplay: results[2]?.screenplaySet ?? null,
        visualBible: results[3]?.bibleSet ?? null,
        cueSheet: results[4]?.cueSheetSet ?? null,
        imagePrompts: results[5]?.promptSet ?? null,
        motion: results[6]?.motionSet ?? null,
        finalPackage: results[7]?.finalSet ?? null,
      };
      const file = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(file);
      const anchor = document.createElement("a");
      anchor.href = url;
      const slug = draft.title.toLocaleLowerCase("sk").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "pribeh";
      anchor.download = `${slug}-kompletny-projekt.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } finally {
      setIsExportingAll(false);
    }
  };

  const copySummary = async () => {
    const budget = wordBudget(draft.duration);
    const summary = [
      `PRODUKČNÝ PAS: ${draft.title}`,
      `Cieľový vek: ${draft.audienceAge}`,
      `Jazyk: ${draft.languageRegister}`,
      `Hrdina: ${draft.heroName} - ${draft.heroDescription}`,
      `Kamarát: ${draft.sideName} - ${draft.sideDescription}`,
      `Svet: ${draft.environment}`,
      `Zápletka: ${draft.plot}`,
      `Ponaučenie: ${draft.moral}`,
      `Dĺžka: ${draft.duration} minút, ${budget.words} slov pri 125 slovách za minútu`,
      `Formát obrazu: ${draft.aspectRatio}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setNotice({ message: "Prehliadač nedovolil kopírovanie. Skúste stiahnuť údaje ako súbor.", kind: "error" });
    }
  };

  const downloadPassport = () => {
    const budget = wordBudget(draft.duration);
    const data = {
      project: draft,
      productionPlan: {
        pacingWordsPerMinute: 125,
        targetWordCount: budget.words,
        tolerance: { minimum: budget.minimum, maximum: budget.maximum },
        visualAnchors: {
          CHAR_HERO: draft.heroDescription,
          CHAR_SIDE: draft.sideDescription,
          ENV_WORLD: draft.environment,
        },
      },
    };
    const file = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(file);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${draft.title.toLocaleLowerCase("sk").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "produkcnny-pas"}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-shell" id="domov">
      <Sidebar activeView={activeView} setActiveView={setActiveView} projectCount={projects.length} isSaved={isSaved} selectedConceptId={selectedConceptId} songsSaved={songsSaved} screenplaySaved={screenplaySaved} bibleSaved={bibleSaved} cueSaved={cueSaved} promptsSaved={promptsSaved} motionSaved={motionSaved} finalSaved={finalSaved} />
      <div className="main-area">
        <header className="topbar">
          <div className="breadcrumbs"><span>ATELIÉR</span><i>/</i><strong>{activeView === "studio" ? "PRACOVNÝ STÔL" : activeView === "concepts" ? "PRÍBEHOVÁ OS" : activeView === "timeline" ? "RYTMUS FILMU" : activeView === "songs" ? "PIESNE" : activeView === "script" ? "SCENÁR" : activeView === "bible" ? "VIZUÁLNÁ KNIHA" : activeView === "shots" ? "ZÁBEROVÁ MATICA" : activeView === "preview" ? "ANIMATIK" : activeView === "prompts" ? "OBRAZOVÉ POKYNY" : activeView === "motion" ? "POHYB" : activeView === "finalize" ? "FINALIZÁCIA" : activeView === "library" ? "MOJE PRÍBEHY" : "MAPA VÝROBY"}</strong></div>
          <div className="topbar-right">
            <span className={`cloud-status ${apiAvailable ? "online" : "offline"}`}><span />{apiAvailable ? "Pracovný priestor pripravený" : "Ukladanie nedostupné"}</span>
            {savedProject ? (
              <span className={`project-status-pill ${isSaved ? "saved" : "dirty"}`}>
                {isSaved ? "Uložené" : "Neuložené zmeny"}
              </span>
            ) : null}
            <span className="topbar-divider" />
            <div className="topbar-mark"><Icon name="spark" size={17} /></div>
          </div>
        </header>

        <main className="main-content">
          {activeView === "studio" ? (
            <StudioView
              draft={draft}
              setDraft={updateDraft}
              projects={projects}
              savedProject={savedProject}
              isSaving={isSaving}
              notice={notice}
              onSubmit={saveProject}
              onReset={resetDraft}
              isSaved={isSaved}
              onCopy={copySummary}
              onDownload={downloadPassport}
              copied={copied}
              onOpenMap={() => setActiveView("map")}
              onOpenConcepts={() => setActiveView("concepts")}
              onSelectPreset={selectPreset}
              restoredDraft={restoredDraft}
              onDismissRestore={() => setRestoredDraft(false)}
            />
          ) : null}
          {activeView === "concepts" ? (
            <ConceptsView
              draft={draft}
              projectId={savedProject?.id ?? null}
              canContinue={isSaved}
              concepts={concepts}
              selectedConceptId={selectedConceptId}
              isLoading={conceptsLoading}
              isGenerating={isGeneratingConcepts}
              isSavingSelection={isSavingSelection}
              error={conceptError}
              onGenerate={prepareConcepts}
              onSelect={selectConcept}
              onGoToPassport={() => setActiveView("studio")}
              onContinue={() => setActiveView("timeline")}
            />
          ) : null}
          {activeView === "timeline" ? (
            <TimelineView
              draft={draft}
              concept={isSaved ? selectedConcept : null}
              onBack={() => setActiveView("concepts")}
              onGoToConcepts={() => setActiveView("concepts")}
              onContinueSongs={() => setActiveView("songs")}
            />
          ) : null}
          {activeView === "songs" ? (
            <SongsView
              draft={draft}
              concept={isSaved ? selectedConcept : null}
              songPackage={songPackage}
              isSaved={songsSaved}
              isLoading={songsLoading || conceptsLoading}
              isGenerating={isGeneratingSongs}
              isSaving={isSavingSongs}
              error={songError ?? conceptError}
              onGenerate={prepareSongs}
              onUpdate={updateSongDraft}
              onSave={saveSongs}
              onBack={() => setActiveView("timeline")}
              onGoToConcepts={() => setActiveView("concepts")}
              onContinue={() => setActiveView("script")}
            />
          ) : null}
          {activeView === "script" ? (
            <ScreenplayView
              draft={draft}
              concept={isSaved ? selectedConcept : null}
              songsReady={songsSaved}
              screenplay={screenplay}
              isSaved={screenplaySaved}
              isLoading={screenplayLoading || conceptsLoading || songsLoading}
              isGenerating={isGeneratingScreenplay}
              isSaving={isSavingScreenplay}
              error={screenplayError ?? conceptError ?? songError}
              onGenerate={prepareScreenplay}
              onUpdate={updateScreenplayDraft}
              onSave={saveScreenplay}
              onContinue={() => setActiveView("bible")}
              onBack={() => setActiveView("songs")}
              onGoToSongs={() => setActiveView("songs")}
            />
          ) : null}
          {activeView === "bible" ? (
            <VisualBibleView
              draft={draft}
              concept={isSaved ? selectedConcept : null}
              screenplayReady={screenplaySaved}
              bible={bible}
              isSaved={bibleSaved}
              isLoading={bibleLoading || conceptsLoading || songsLoading || screenplayLoading}
              isGenerating={isGeneratingBible}
              isSaving={isSavingBible}
              error={bibleError ?? screenplayError ?? conceptError ?? songError}
              onGenerate={prepareBible}
              onUpdate={updateBibleDraft}
              onSave={saveBible}
              onBack={() => setActiveView("script")}
              onGoToScript={() => setActiveView("script")}
              onContinue={() => setActiveView("shots")}
            />
          ) : null}
          {activeView === "shots" ? (
            <CueSheetView
              draft={draft}
              concept={isSaved ? selectedConcept : null}
              bibleReady={bibleSaved}
              sheet={cueSheet}
              isSaved={cueSaved}
              isLoading={cueLoading || conceptsLoading || songsLoading || screenplayLoading || bibleLoading}
              isGenerating={isGeneratingCue}
              isSaving={isSavingCue}
              error={cueError ?? bibleError ?? screenplayError ?? conceptError ?? songError}
              onGenerate={prepareCueSheet}
              onSave={saveCueSheet}
              onGoToBible={() => setActiveView("bible")}
              onContinue={() => setActiveView("prompts")}
              onPreview={() => setActiveView("preview")}
            />
          ) : null}
          {activeView === "prompts" ? (
            <ImagePromptsView
              draft={draft}
              concept={isSaved ? selectedConcept : null}
              cueReady={cueSaved}
              pack={promptPack}
              isSaved={promptsSaved}
              isLoading={promptsLoading || conceptsLoading || songsLoading || screenplayLoading || bibleLoading || cueLoading}
              isGenerating={isGeneratingPrompts}
              isSaving={isSavingPrompts}
              error={promptsError ?? cueError ?? bibleError ?? screenplayError ?? conceptError ?? songError}
              onGenerate={preparePrompts}
              onSave={savePrompts}
              onGoToShots={() => setActiveView("shots")}
              onContinue={() => setActiveView("motion")}
            />
          ) : null}
          {activeView === "motion" ? (
            <MotionView
              draft={draft}
              concept={isSaved ? selectedConcept : null}
              promptsReady={promptsSaved}
              pack={motionPack}
              isSaved={motionSaved}
              isLoading={motionLoading || conceptsLoading || songsLoading || screenplayLoading || bibleLoading || cueLoading || promptsLoading}
              isGenerating={isGeneratingMotion}
              isSaving={isSavingMotion}
              error={motionError ?? promptsError ?? cueError ?? bibleError ?? screenplayError ?? conceptError ?? songError}
              onGenerate={prepareMotion}
              onSave={saveMotion}
              onGoToPrompts={() => setActiveView("prompts")}
              onContinue={() => setActiveView("finalize")}
            />
          ) : null}
          {activeView === "finalize" ? (
            <FinalizeView
              draft={draft}
              concept={isSaved ? selectedConcept : null}
              motionReady={motionSaved}
              finalPack={finalPack}
              cueSheet={cueSheet}
              isSaved={finalSaved}
              isLoading={finalLoading || conceptsLoading || songsLoading || screenplayLoading || bibleLoading || cueLoading || promptsLoading || motionLoading}
              isGenerating={isGeneratingFinal}
              isSaving={isSavingFinal}
              error={finalError ?? motionError ?? promptsError ?? cueError ?? bibleError ?? screenplayError ?? conceptError ?? songError}
              onGenerate={prepareFinal}
              onSave={saveFinal}
              onGoToMotion={() => setActiveView("motion")}
              onPreview={() => setActiveView("preview")}
              onRestart={() => {
                resetDraft();
                setActiveView("studio");
              }}
            />
          ) : null}
          {activeView === "preview" ? (
            <AnimaticView
              draft={draft}
              concept={isSaved ? selectedConcept : null}
              sheet={cueSheet}
              bible={bible}
              onBack={() => setActiveView("shots")}
            />
          ) : null}
          {activeView === "library" ? (
            <LibraryView
              projects={projects}
              isLoading={isLoading}
              onLoad={openProject}
              onDelete={deleteProject}
              onDuplicate={duplicateProject}
              onStart={() => setActiveView("studio")}
            />
          ) : null}
          {activeView === "map" ? (
            <MapView
              onBack={() => setActiveView("studio")}
              isSaved={isSaved}
              selectedConceptId={selectedConceptId}
              songsSaved={songsSaved}
              screenplaySaved={screenplaySaved}
              bibleSaved={bibleSaved}
              cueSaved={cueSaved}
              promptsSaved={promptsSaved}
              motionSaved={motionSaved}
              finalSaved={finalSaved}
              canExport={Boolean(savedProject)}
              isExporting={isExportingAll}
              onExportAll={exportWholeProject}
              onPreview={() => setActiveView("preview")}
              canPreview={canPreviewFilm}
              onOpenStage={(index) => setActiveView(index === 0 ? "studio" : index === 1 ? "concepts" : index === 2 ? "timeline" : index === 3 ? "script" : index === 4 ? "bible" : index === 5 ? "shots" : index === 6 ? "prompts" : index === 7 ? "motion" : "finalize")}
            />
          ) : null}
        </main>
        <footer className="app-footer">
          <span>ROZPRÁVKOVÝ ATELIÉR <span>·</span> TVORBA S CITOM</span>
          <span>{activeStep.number} / 09 <i /> {activeStep.title}</span>
        </footer>
      </div>
    </div>
  );
}
