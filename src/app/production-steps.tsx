"use client";

import { useState, type ReactNode } from "react";
import {
  buildSongPrompt,
  runtimeTimeline,
  screenplayTimeEstimate,
  screenplayWordCount,
  wordBudget,
  worldImageFor,
  type ProjectDraft,
  type ScreenplayPackage,
  type ScreenplayScene,
  type SongPackage,
  type SongTrack,
  type StoryConcept,
  type TimelineSegment,
} from "@/lib/production";

function ArrowIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 10V7a6 6 0 0 1 12 0v3M5 10h14v11H5zM12 14v3" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z" />
    </svg>
  );
}

function StepHeading({
  step,
  title,
  accent,
  description,
  action,
}: {
  step: string;
  title: string;
  accent: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="production-step-heading">
      <div>
        <span className="eyebrow">KROK {step} Z 09 <span className="eyebrow-line" /></span>
        <h1>{title} <em>{accent}</em></h1>
        <p>{description}</p>
      </div>
      {action ? <div className="step-heading-action">{action}</div> : null}
    </div>
  );
}

function LockedStep({ onGoToPassport }: { onGoToPassport: () => void }) {
  return (
    <div className="locked-step-card">
      <div className="locked-step-icon"><LockIcon /></div>
      <span className="eyebrow-small">NAJPRV POTVRĎTE ZÁKLAD PRÍBEHU</span>
      <h2>Ďalší krok potrebuje pevný základ.</h2>
      <p>Uložte alebo aktualizujte produkčný pas. Až potom sa námety vytvoria z presných mien, sveta a zápletky.</p>
      <button className="primary-button" onClick={onGoToPassport} type="button">Späť k produkčnému pasu <ArrowIcon /></button>
    </div>
  );
}

export type ConceptsViewProps = {
  draft: ProjectDraft;
  projectId: string | null;
  canContinue: boolean;
  concepts: StoryConcept[];
  selectedConceptId: number | null;
  isLoading: boolean;
  isGenerating: boolean;
  isSavingSelection: boolean;
  error: string | null;
  onGenerate: () => void;
  onSelect: (id: number) => void;
  onGoToPassport: () => void;
  onContinue: () => void;
};

export function ConceptsView({
  draft,
  projectId,
  canContinue,
  concepts,
  selectedConceptId,
  isLoading,
  isGenerating,
  isSavingSelection,
  error,
  onGenerate,
  onSelect,
  onGoToPassport,
  onContinue,
}: ConceptsViewProps) {
  const canGenerate = Boolean(projectId && canContinue);
  const hasConcepts = concepts.length === 5;

  return (
    <section className="concepts-view">
      <StepHeading
        step="02"
        title="Päť ciest."
        accent="Jeden príbeh."
        description="Preskúmajte päť odlišných príbehových osí. Každá zachová váš cieľ, no hrdinu zmení inou skúškou."
        action={<span className="saved-context-badge"><span /> {draft.title}</span>}
      />

      {!canGenerate ? <LockedStep onGoToPassport={onGoToPassport} /> : null}

      {canGenerate ? (
        <>
          <div className="concept-context-row">
            <div className="concept-context-art" style={{ backgroundImage: `url(${worldImageFor(draft)})` }} />
            <div className="concept-context-copy">
              <span className="eyebrow-small">ZÁKLAD PRE NÁMETY</span>
              <strong>{draft.heroName} a {draft.sideName}</strong>
              <p>{draft.plot}</p>
            </div>
            <div className="concept-context-age"><span>DIVÁK</span><strong>{draft.audienceAge}</strong></div>
          </div>

          {error ? <div className="step-error" role="alert">{error}</div> : null}

          {isLoading ? (
            <div className="concept-loading"><span className="mini-spinner" /> Načítavam uložené príbehové námety...</div>
          ) : null}

          {!isLoading && !hasConcepts ? (
            <div className="concept-start-card">
              <div className="concept-start-mark"><SparkIcon /></div>
              <div>
                <span className="eyebrow-small">PRÍBEHOVÁ DIELŇA</span>
                <h2>Aký príbeh sa skrýva v tomto nápade?</h2>
                <p>Pripravíme päť možností podľa vášho produkčného pasu. Každá bude mať jasnú túžbu, vnútornú potrebu a sedem krokov príbehu.</p>
              </div>
              <button className="primary-button" disabled={isGenerating} onClick={onGenerate} type="button">
                {isGenerating ? <span className="button-spinner" /> : <SparkIcon />}
                {isGenerating ? "Pripravujem námety..." : "Vytvoriť päť námetov"}
                {!isGenerating ? <ArrowIcon /> : null}
              </button>
            </div>
          ) : null}

          {!isLoading && hasConcepts ? (
            <>
              <div className="concept-list-toolbar">
                <div>
                  <span className="eyebrow-small">PÄŤ ROZDIELNYCH SMEROV</span>
                  <p>Vybraný námet sa uloží k projektu a otvorí časový plán.</p>
                </div>
                <button className="quiet-action regenerate-button" disabled={isGenerating || isSavingSelection} onClick={onGenerate} type="button">
                  <SparkIcon /> {isGenerating ? "Pripravujem..." : "Pripraviť nové možnosti"}
                </button>
              </div>

              <div className="concept-grid">
                {concepts.map((concept) => {
                  const selected = selectedConceptId === concept.id;

                  return (
                    <article className={`story-concept-card ${selected ? "concept-selected" : ""}`} key={concept.id}>
                      <div className="story-concept-topline">
                        <span className="story-concept-number">0{concept.id}</span>
                        <span className="story-tone">{concept.tone}</span>
                        {selected ? <span className="selected-stamp">VYBRANÉ</span> : null}
                      </div>
                      <h2>{concept.title}</h2>
                      <p className="concept-hook">{concept.hook}</p>
                      <div className="want-need-grid">
                        <div className="want-box">
                          <span>VONKAJŠIA TÚŽBA</span>
                          <p>{concept.externalWant}</p>
                        </div>
                        <div className="need-box">
                          <span>VNÚTORNÁ POTREBA</span>
                          <p>{concept.internalNeed}</p>
                        </div>
                      </div>
                      <details className="story-spine-details">
                        <summary><span>Príbehová os</span><span>7 krokov <b>+</b></span></summary>
                        <ol className="story-spine-list">
                          {concept.beats.map((beat, index) => (
                            <li key={`${concept.id}-${index}`}>
                              <span className="spine-index">{String(index + 1).padStart(2, "0")}</span>
                              <div><strong>{beat.label}</strong><p>{beat.text}</p></div>
                            </li>
                          ))}
                        </ol>
                      </details>
                      <button
                        aria-pressed={selected}
                        className={`concept-select-button ${selected ? "selected" : ""}`}
                        disabled={isSavingSelection}
                        onClick={() => onSelect(concept.id)}
                        type="button"
                      >
                        {isSavingSelection ? "Ukladám výber..." : selected ? "Tento príbeh je vybraný" : "Vybrať tento príbeh"}
                        {!isSavingSelection ? <ArrowIcon /> : null}
                      </button>
                    </article>
                  );
                })}
              </div>

              <div className="concept-continue-row">
                <div className="continue-copy">
                  <span className="continue-check"><SparkIcon /></span>
                  <span><strong>{selectedConceptId ? "Smer príbehu je uzamknutý." : "Vyberte jeden príbehový smer."}</strong><small>Výber môžete zmeniť, kým nezačnete ďalšiu etapu.</small></span>
                </div>
                <button className="primary-button" disabled={!selectedConceptId || isSavingSelection} onClick={onContinue} type="button">
                  Pokračovať na časový plán <ArrowIcon />
                </button>
              </div>
            </>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

type SongTrackEditorProps = {
  role: "opening" | "closing";
  track: SongTrack;
  draft: ProjectDraft;
  concept: StoryConcept;
  onChange: (track: SongTrack) => void;
};

function SongTrackEditor({ role, track, draft, concept, onChange }: SongTrackEditorProps) {
  const [copied, setCopied] = useState(false);
  const prompt = buildSongPrompt(track, draft, role, concept);
  const lineCount = track.lyrics.length;
  const isValid = lineCount === 8 && track.lyrics.every((line) => line.trim().length > 0);

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <article className="song-track-card">
      <div className="song-track-heading">
        <span className="song-track-number">{role === "opening" ? "01" : "02"}</span>
        <div className="song-track-title-copy">
          <span className="eyebrow-small">{role === "opening" ? "ÚVODNÁ ZNELKA · 00:00 - 00:40" : "ZÁVEREČNÁ PIESEŇ · TITULKY"}</span>
          <input
            aria-label="Názov piesne"
            className="song-title-input"
            maxLength={100}
            value={track.title}
            onChange={(event) => onChange({ ...track, title: event.target.value })}
          />
        </div>
        <span className={`verse-count ${isValid ? "valid" : "invalid"}`}>{lineCount} / 8 veršov</span>
      </div>

      <label className="song-field-label" htmlFor={`lyrics-${role}`}>TEXT PIESNE V SLOVENČINE</label>
      <textarea
        className="song-lyrics-input"
        id={`lyrics-${role}`}
        lang="sk"
        maxLength={1600}
        onChange={(event) => onChange({ ...track, lyrics: event.target.value.split(/\r?\n/) })}
        rows={8}
        spellCheck
        value={track.lyrics.join("\n")}
      />
      {!isValid ? <span className="song-validation-note">Každá skladba musí mať presne osem vyplnených veršov.</span> : null}

      <label className="song-field-label" htmlFor={`style-${role}`}>HUDOBNÝ ŠTÝL A NÁSTROJE</label>
      <textarea
        className="song-style-input"
        id={`style-${role}`}
        maxLength={1200}
        onChange={(event) => onChange({ ...track, stylePrompt: event.target.value })}
        rows={3}
        value={track.stylePrompt}
      />

      <details className="song-prompt-details">
        <summary><span>Hotový pokyn pre Suno alebo Udio</span><span>EN <b>+</b></span></summary>
        <pre>{prompt}</pre>
      </details>
      <button className="song-copy-button" onClick={copyPrompt} type="button">
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M8 8V4h12v12h-4M4 8h12v12H4z" /></svg>
        {copied ? "Pokyn skopírovaný" : "Kopírovať hudobný pokyn"}
      </button>
    </article>
  );
}

function downloadSongBundle(songPackage: SongPackage, draft: ProjectDraft, concept: StoryConcept) {
  const openingPrompt = buildSongPrompt(songPackage.opening, draft, "opening", concept);
  const closingPrompt = buildSongPrompt(songPackage.closing, draft, "closing", concept);
  const content = [
    `PROJEKT: ${draft.title}`,
    `VYBRANÝ NÁMET: ${concept.title}`,
    "",
    `ÚVODNÁ ZNELKA: ${songPackage.opening.title}`,
    openingPrompt,
    "",
    `ZÁVEREČNÁ PIESEŇ: ${songPackage.closing.title}`,
    closingPrompt,
  ].join("\n\n");
  const file = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${draft.title.toLocaleLowerCase("sk").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "hudobne-pokyny"}.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export type SongsViewProps = {
  draft: ProjectDraft;
  concept: StoryConcept | null;
  songPackage: SongPackage | null;
  isSaved: boolean;
  isLoading: boolean;
  isGenerating: boolean;
  isSaving: boolean;
  error: string | null;
  onGenerate: () => void;
  onUpdate: (songPackage: SongPackage) => void;
  onSave: () => void;
  onBack: () => void;
  onGoToConcepts: () => void;
  onContinue: () => void;
};

export function SongsView({

  draft,
  concept,
  songPackage,
  isSaved,
  isLoading,
  isGenerating,
  isSaving,
  error,
  onGenerate,
  onUpdate,
  onSave,
  onBack,
  onGoToConcepts,
  onContinue,
}: SongsViewProps) {
  const validTrack = (track: SongTrack) =>
    track.title.trim().length > 0 &&
    track.stylePrompt.trim().length > 0 &&
    track.lyrics.length === 8 &&
    track.lyrics.every((line) => line.trim().length > 0);
  const validPackage = Boolean(
    concept &&
      songPackage &&
      songPackage.conceptId === concept.id &&
      validTrack(songPackage.opening) &&
      validTrack(songPackage.closing),
  );

  if (!concept) {
    return (
      <section className="songs-view">
        <StepHeading
          step="03B"
          title="Dve piesne."
          accent="Jeden príbeh."
          description="Úvodná znelka a záverečná pieseň nadväzujú na zvolený príbehový smer."
        />
        <div className="locked-step-card">
          <div className="locked-step-icon"><LockIcon /></div>
          <span className="eyebrow-small">CHÝBA VYBRANÝ NÁMET</span>
          <h2>Najskôr rozhodnime, ktorý príbeh rozprávame.</h2>
          <p>Piesne budú znieť najúprimnejšie, keď poznáme túžbu hrdinu aj to, čo sa naučí.</p>
          <button className="primary-button" onClick={onGoToConcepts} type="button">Vybrať príbehový smer <ArrowIcon /></button>
        </div>
      </section>
    );
  }

  const updateTrack = (role: "opening" | "closing", track: SongTrack) => {
    if (!songPackage) return;
    onUpdate({ ...songPackage, [role]: track });
  };

  return (
    <section className="songs-view">
      <StepHeading
        step="03B"
        title="Dve piesne."
        accent="Jeden príbeh."
        description="Osem veršov na úvod, osem na záver. Upravte slová aj hudobný smer a skopírujte hotový pokyn."
        action={<button className="quiet-action songs-back-button" onClick={onBack} type="button">Späť na časový plán <ArrowIcon /></button>}
      />

      <div className="selected-story-banner">
        <div className="selected-story-mark"><span>0{concept.id}</span></div>
        <div className="selected-story-copy">
          <span className="eyebrow-small">PIESNE PRE VYBRANÝ NÁMET</span>
          <h2>{concept.title}</h2>
          <p>{concept.internalNeed}</p>
        </div>
        <span className={`status-pill ${isSaved ? "is-saved" : ""}`}><span className="status-dot" />{isSaved ? "ULOŽENÉ" : "ZMENENÉ"}</span>
      </div>

      {error ? <div className="step-error" role="alert">{error}</div> : null}
      {isLoading ? <div className="concept-loading"><span className="mini-spinner" /> Načítavam uložené skladby...</div> : null}

      {!isLoading && !songPackage ? (
        <div className="concept-start-card song-start-card">
          <div className="concept-start-mark"><SparkIcon /></div>
          <div>
            <span className="eyebrow-small">DVE SAMOSTATNÉ SKLADBY</span>
            <h2>Najprv privítame svet, potom doznie posolstvo.</h2>
            <p>Pripravíme dve osemveršové piesne v slovenčine a samostatný anglický hudobný pokyn pre každú z nich.</p>
          </div>
          <button className="primary-button" disabled={isGenerating} onClick={onGenerate} type="button">
            {isGenerating ? <span className="button-spinner" /> : <SparkIcon />}
            {isGenerating ? "Pripravujem piesne..." : "Vytvoriť obe piesne"}
            {!isGenerating ? <ArrowIcon /> : null}
          </button>
        </div>
      ) : null}

      {!isLoading && songPackage ? (
        <>
          <div className="song-editor-grid">
            <SongTrackEditor role="opening" track={songPackage.opening} draft={draft} concept={concept} onChange={(track) => updateTrack("opening", track)} />
            <SongTrackEditor role="closing" track={songPackage.closing} draft={draft} concept={concept} onChange={(track) => updateTrack("closing", track)} />
          </div>
          <div className="songs-save-row">
            <div className="continue-copy">
              <span className="continue-check"><SparkIcon /></span>
              <span><strong>{isSaved ? "Obe skladby sú uložené." : validPackage ? "Zmeny sú pripravené na uloženie." : "Skontrolujte názvy, hudobný opis a osem veršov."}</strong><small>Pokyny obsahujú anglický opis, text piesne zostáva v slovenčine.</small></span>
            </div>
            <div className="songs-actions">
              <button className="quiet-action" disabled={!validPackage || isSaving} onClick={() => downloadSongBundle(songPackage, draft, concept)} type="button">Stiahnuť obe skladby</button>
              <button className="primary-button" disabled={!validPackage || isSaved || isSaving} onClick={onSave} type="button">
                {isSaving ? "Ukladám skladby..." : isSaved ? "Skladby sú uložené" : "Uložiť skladby"}
                {!isSaving && !isSaved ? <ArrowIcon /> : null}
              </button>
              {isSaved ? <button className="primary-button song-next-button" onClick={onContinue} type="button">Pokračovať na scenár <ArrowIcon /></button> : null}
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}

function downloadScreenplayText(screenplay: ScreenplayPackage, draft: ProjectDraft, concept: StoryConcept) {
  const words = screenplayWordCount(screenplay);
  const time = screenplayTimeEstimate(words);
  const voices = screenplay.voiceProfiles
    .map((profile) => `${profile.speaker}: ${profile.direction}`)
    .join("\n");
  const scenes = screenplay.scenes
    .map((scene, index) => [
      `SCÉNA ${String(index + 1).padStart(2, "0")} · ${scene.act} · ${scene.heading} · ${scene.durationSeconds} s`,
      `AKCIA:\n${scene.action}`,
      `DIALÓG / ROZPRÁVAČ:\n${scene.dialogue}`,
      `FOLEY A ZVUK:\n${scene.foley}`,
    ].join("\n\n"))
    .join("\n\n");
  const content = [
    `NÁZOV: ${draft.title}`,
    `VYBRANÝ NÁMET: ${concept.title}`,
    `POČET SLOV: ${words}`,
    `ČASOVÝ ODHAD: ${time}`,
    "ZOZNAM HLASOV:",
    voices,
    "",
    scenes,
  ].join("\n\n");
  const file = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${draft.title.toLocaleLowerCase("sk").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "scenar"}.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function dialogueToHtml(raw: string) {
  const NL = String.fromCharCode(10);
  const pauseFromBreak = (source: string) =>
    source
      .replace(/<break[^>]*time="(\d+)ms"[^>]*>/g, (_all, ms: string) => `[pauza: ${(Number(ms) / 1000).toFixed(1)}s]`)
      .replace(/<break[^>]*>/g, "[pauza]");

  return raw
    .split(NL)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const normalized = pauseFromBreak(line);
      const match = normalized.match(/^([^:\[]{1,40}?)\s*((?:\[[^\]]*\]\s*)*)\s*:\s*(.*)$/);
      if (!match) return `<p class="line">${escapeHtml(normalized)}</p>`;
      const speaker = escapeHtml(match[1].trim());
      const tagSource = match[2].trim();
      const tag = tagSource ? `<span class="tag">${escapeHtml(tagSource)}</span>` : "";
      const text = escapeHtml(match[3]).replace(/\[(pauza[^\]]*)\]/g, '<span class="tag">[$1]</span>');
      return `<p class="cue"><span class="speaker">${speaker}</span> ${tag}<span class="text">${text}</span></p>`;
    })
    .join("");
}

function openScreenplayPrint(screenplay: ScreenplayPackage, draft: ProjectDraft, concept: StoryConcept) {
  const words = screenplayWordCount(screenplay);
  const time = screenplayTimeEstimate(words);
  const acts = Array.from(new Set(screenplay.scenes.map((scene) => scene.act)));
  const voices = screenplay.voiceProfiles
    .map((profile) => `<li><strong>${escapeHtml(profile.speaker)}</strong> ${escapeHtml(profile.direction)}</li>`)
    .join("");
  const body = acts
    .map((act, actIndex) => {
      const scenes = screenplay.scenes.filter((scene) => scene.act === act);
      const sceneHtml = scenes
        .map((scene) => {
          const number = screenplay.scenes.findIndex((item) => item.id === scene.id) + 1;
          return `
            <section class="scene">
              <header><span class="num">${String(number).padStart(2, "0")}</span><h3>${escapeHtml(scene.heading)}</h3><span class="dur">${scene.durationSeconds} s</span></header>
              <p class="action">${escapeHtml(scene.action).replace(/\n/g, "<br />")}</p>
              <div class="dialogue">${dialogueToHtml(scene.dialogue)}</div>
              <p class="foley">${escapeHtml(scene.foley)}</p>
            </section>`;
        })
        .join("");
      return `<section class="act"><h2><span>${String(actIndex + 1).padStart(2, "0")}</span>${escapeHtml(act)}</h2>${sceneHtml}</section>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html lang="sk"><head><meta charset="utf-8" /><title>${escapeHtml(draft.title)} · scenár</title>
<style>
  @page { margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: Georgia, "Times New Roman", serif; color: #1f2a24; margin: 0; padding: 28px 34px; line-height: 1.5; }
  .cover { border-bottom: 2px solid #2d4034; padding-bottom: 16px; margin-bottom: 22px; }
  .cover .kicker { font: 700 10px/1 ui-sans-serif, system-ui, sans-serif; letter-spacing: .18em; color: #7a8a72; text-transform: uppercase; }
  .cover h1 { font-size: 30px; font-weight: 400; margin: 8px 0 4px; letter-spacing: -.02em; }
  .cover p { margin: 0; color: #596659; font-size: 13px; }
  .meta { display: flex; flex-wrap: wrap; gap: 18px; margin-top: 12px; font: 12px ui-sans-serif, system-ui, sans-serif; color: #44524a; }
  .meta b { color: #1f2a24; }
  .voices { background: #f2f4ee; border-radius: 8px; padding: 12px 16px; margin: 0 0 22px; }
  .voices h4 { margin: 0 0 6px; font: 700 10px/1 ui-sans-serif, system-ui, sans-serif; letter-spacing: .14em; color: #6d7d67; }
  .voices ul { margin: 0; padding-left: 18px; font-size: 12px; }
  .voices li { margin: 2px 0; }
  .act { page-break-inside: avoid; margin-top: 22px; }
  .act h2 { font-size: 17px; font-weight: 400; border-bottom: 1px solid #d9dfd3; padding-bottom: 6px; margin: 0 0 12px; }
  .act h2 span { display: inline-block; width: 28px; height: 28px; line-height: 28px; text-align: center; border-radius: 50%; background: #2d4034; color: #f3e9d2; font-size: 11px; margin-right: 10px; }
  .scene { page-break-inside: avoid; margin: 0 0 16px; padding: 10px 12px 10px 14px; border-left: 3px solid #e2c48f; }
  .scene header { display: flex; align-items: center; gap: 10px; }
  .scene header .num { font: 700 11px ui-sans-serif, system-ui, sans-serif; color: #9a7945; }
  .scene header h3 { flex: 1; font-size: 13px; font-weight: 400; letter-spacing: .04em; margin: 0; text-transform: uppercase; }
  .scene header .dur { font: 11px ui-sans-serif, system-ui, sans-serif; color: #7c887a; }
  .action { font-size: 12.5px; color: #3f4c43; margin: 6px 0 8px; }
  .dialogue { margin: 0 0 6px 18px; }
  .cue { margin: 4px 0; font-size: 13px; }
  .cue .speaker { font: 700 11px ui-sans-serif, system-ui, sans-serif; letter-spacing: .08em; text-transform: uppercase; color: #2d4034; margin-right: 6px; }
  .tag { font: italic 11px ui-sans-serif, system-ui, sans-serif; color: #8b6a3a; margin-right: 6px; }
  .line { margin: 4px 0; font-size: 13px; }
  .foley { font: 700 10px ui-sans-serif, system-ui, sans-serif; letter-spacing: .06em; color: #a07c46; margin: 0; }
  .footer { margin-top: 28px; padding-top: 10px; border-top: 1px solid #d9dfd3; font: 10px ui-sans-serif, system-ui, sans-serif; color: #8d978a; display: flex; justify-content: space-between; }
  .print-hint { position: fixed; right: 16px; top: 12px; font: 12px ui-sans-serif, system-ui, sans-serif; background: #2d4034; color: #f3e9d2; padding: 8px 12px; border-radius: 8px; cursor: pointer; border: 0; }
  @media print { .print-hint { display: none; } body { padding: 0; } }
</style></head>
<body>
  <button class="print-hint" onclick="window.print()">Tlačiť / uložiť ako PDF</button>
  <div class="cover">
    <div class="kicker">Scenár · Rozprávkový ateliér</div>
    <h1>${escapeHtml(draft.title)}</h1>
    <p>${escapeHtml(concept.title)} · ${escapeHtml(draft.heroName)} a ${escapeHtml(draft.sideName)} · ${escapeHtml(draft.audienceAge)}</p>
    <div class="meta"><span>Počet slov: <b>${words}</b></span><span>Časový odhad: <b>${time}</b></span><span>Scény: <b>${screenplay.scenes.length}</b></span><span>Formát: <b>${escapeHtml(draft.aspectRatio)}</b></span></div>
  </div>
  <div class="voices"><h4>ZOZNAM HLASOV</h4><ul>${voices}</ul></div>
  ${body}
  <div class="footer"><span>${escapeHtml(draft.title)}</span><span>125 slov za minútu · ${escapeHtml(concept.title)}</span></div>
</body></html>`;

  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=900,height=1000");
  if (!printWindow) return false;
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  return true;
}

export type ScreenplayViewProps = {
  draft: ProjectDraft;
  concept: StoryConcept | null;
  songsReady: boolean;
  screenplay: ScreenplayPackage | null;
  isSaved: boolean;
  isLoading: boolean;
  isGenerating: boolean;
  isSaving: boolean;
  error: string | null;
  onGenerate: () => void;
  onUpdate: (screenplay: ScreenplayPackage) => void;
  onSave: () => void;
  onBack: () => void;
  onGoToSongs: () => void;
  onContinue: () => void;
};

export function ScreenplayView({
  draft,
  concept,
  songsReady,
  screenplay,
  isSaved,
  isLoading,
  isGenerating,
  isSaving,
  error,
  onGenerate,
  onUpdate,
  onSave,
  onBack,
  onGoToSongs,
  onContinue,
}: ScreenplayViewProps) {
  const canWrite = Boolean(concept && songsReady);

  if (!canWrite || !concept) {
    return (
      <section className="screenplay-view">
        <StepHeading
          step="04"
          title="Príbeh ožíva"
          accent="v scenári."
          description="Scenár spája vybraný príbeh, dialógy, herecké značky, zvuky a piesne."
        />
        <div className="locked-step-card">
          <div className="locked-step-icon"><LockIcon /></div>
          <span className="eyebrow-small">NAJPRV DOKONČITE PIESNE</span>
          <h2>Scenár potrebuje schválený príbeh aj skladby.</h2>
          <p>Uložte vybraný príbehový smer a obe osemveršové piesne. Potom pripravíme scenár s časovaním, dialógmi a zvukovými značkami.</p>
          <button className="primary-button" onClick={onGoToSongs} type="button">Späť k piesňam <ArrowIcon /></button>
        </div>
      </section>
    );
  }

  if (!screenplay) {
    return (
      <section className="screenplay-view">
        <StepHeading
          step="04"
          title="Príbeh ožíva"
          accent="v scenári."
          description="Vytvorte upraviteľný scenár s vybraným príbehom, piesňami, hlasovými značkami a zvukovými podnetmi."
          action={<button className="quiet-action songs-back-button" onClick={onBack} type="button">Späť k piesňam <ArrowIcon /></button>}
        />
        {error ? <div className="step-error" role="alert">{error}</div> : null}
        {isLoading ? (
          <div className="concept-loading"><span className="mini-spinner" /> Načítavam uložený scenár...</div>
        ) : (
          <div className="screenplay-start-card">
            <div className="screenplay-start-art" style={{ backgroundImage: `url(${worldImageFor(draft)})` }} />
            <div className="screenplay-start-copy">
              <span className="eyebrow-small">VYBRANÝ NÁMET</span>
              <h2>{concept.title}</h2>
              <p>{concept.hook}</p>
              <div className="screenplay-start-tags"><span>{draft.duration} minút</span><span>{wordBudget(draft.duration).words.toLocaleString("sk-SK")} slov</span><span>{draft.audienceAge}</span></div>
            </div>
            <button className="primary-button" disabled={isGenerating} onClick={onGenerate} type="button">
              {isGenerating ? <span className="button-spinner" /> : <span className="screenplay-play-mark"><ArrowIcon /></span>}
              {isGenerating ? "Píšem prvý náčrt..." : "Vytvoriť scenár"}
              {!isGenerating ? <ArrowIcon /> : null}
            </button>
          </div>
        )}
      </section>
    );
  }

  const words = screenplayWordCount(screenplay);
  const budget = wordBudget(draft.duration);
  const timeEstimate = screenplayTimeEstimate(words);
  const totalSeconds = screenplay.scenes.reduce((total, scene) => total + scene.durationSeconds, 0);
  const inWordRange = words >= budget.minimum && words <= budget.maximum;
  const correctRuntime = totalSeconds === draft.duration * 60;
  const valid = inWordRange && correctRuntime && screenplay.scenes.length === 15;
  const completion = Math.min(100, Math.round((words / budget.words) * 100));
  const acts = Array.from(new Set(screenplay.scenes.map((scene) => scene.act)));

  const updateScene = (sceneId: string, key: keyof Pick<ScreenplayScene, "action" | "dialogue" | "foley">, value: string) => {
    onUpdate({
      ...screenplay,
      scenes: screenplay.scenes.map((scene) => scene.id === sceneId ? { ...scene, [key]: value } : scene),
    });
  };

  return (
    <section className="screenplay-view">
      <StepHeading
        step="04"
        title="Príbeh ožíva"
        accent="v scenári."
        description="Upravte akciu, dialógy aj zvukové značky. Počet slov a časový odhad sa prepočítavajú priebežne."
        action={<button className="quiet-action screenplay-download" disabled={screenplay.scenes.length === 0} onClick={() => downloadScreenplayText(screenplay, draft, concept)} type="button">Stiahnuť scenár <ArrowIcon /></button>}
      />

      {error ? <div className="step-error" role="alert">{error}</div> : null}

      <div className="screenplay-context-banner">
        <div className="screenplay-context-mark"><span>04</span></div>
        <div className="screenplay-context-copy">
          <span className="eyebrow-small">SCENÁR PRE VYBRANÝ NÁMET</span>
          <h2>{concept.title}</h2>
          <p>{concept.internalNeed}</p>
        </div>
        <button className="text-button" onClick={onBack} type="button">Zobraziť piesne <ArrowIcon /></button>
      </div>

      <div className="screenplay-summary-grid">
        <div className="screenplay-summary-card word-summary">
          <span>POČET SLOV</span>
          <strong>{words.toLocaleString("sk-SK")} <small>/ {budget.words.toLocaleString("sk-SK")}</small></strong>
          <div className="meter-track"><span style={{ width: `${completion}%` }} /></div>
          <p className={inWordRange ? "budget-ok" : "budget-warning"}>{inWordRange ? `V povolenom rozsahu ${budget.minimum} až ${budget.maximum} slov.` : `Cieľový rozsah: ${budget.minimum} až ${budget.maximum} slov.`}</p>
        </div>
        <div className="screenplay-summary-card">
          <span>ČASOVÝ ODHAD</span>
          <strong>{timeEstimate} <small>min:s</small></strong>
          <p>Pri tempe 125 slov za minútu</p>
        </div>
        <div className="screenplay-summary-card">
          <span>SCÉNY A DĹŽKA</span>
          <strong>{screenplay.scenes.length} <small>scén</small></strong>
          <p className={correctRuntime ? "budget-ok" : "budget-warning"}>{totalSeconds} z {draft.duration * 60} sekúnd</p>
        </div>
      </div>

      <div className="screenplay-progress-nav">
        <span className="eyebrow-small">PRESKOČIŤ NA ČASŤ</span>
        <div>{acts.map((act, index) => <a href={`#screenplay-act-${index}`} key={act}>{act}</a>)}</div>
      </div>

      <div className="screenplay-act-list">
        {acts.map((act, actIndex) => {
          const actScenes = screenplay.scenes.filter((scene) => scene.act === act);
          const actWords = screenplayWordCount({ ...screenplay, scenes: actScenes });
          return (
            <section className="screenplay-act-section" id={`screenplay-act-${actIndex}`} key={act}>
              <div className="screenplay-act-heading">
                <span className="screenplay-act-number">{String(actIndex + 1).padStart(2, "0")}</span>
                <div><span className="eyebrow-small">ČASŤ SCENÁRA · {actScenes.length} SCÉN · {actWords} SLOV</span><h2>{act}</h2></div>
              </div>
              <div className="screenplay-scene-list">
                {actScenes.map((scene) => {
                  const sceneNumber = screenplay.scenes.findIndex((item) => item.id === scene.id) + 1;
                  return (
                    <article className="screenplay-scene-card" key={scene.id}>
                      <div className="screenplay-scene-heading">
                        <span className="screenplay-scene-number">{String(sceneNumber).padStart(2, "0")}</span>
                        <h3>{scene.heading}</h3>
                        <span className="scene-duration-pill">{scene.durationSeconds} s</span>
                      </div>
                      <div className="screenplay-edit-grid">
                        <label>
                          <span>AKCIA A ROZPRÁVAČ</span>
                          <textarea maxLength={12000} onChange={(event) => updateScene(scene.id, "action", event.target.value)} rows={4} value={scene.action} />
                        </label>
                        <label>
                          <span>DIALÓG A HERECKÉ ZNAČKY</span>
                          <textarea maxLength={12000} onChange={(event) => updateScene(scene.id, "dialogue", event.target.value)} rows={5} value={scene.dialogue} />
                        </label>
                        <label className="foley-editor">
                          <span>FOLEY A ZVUKOVÉ PODNETY</span>
                          <input maxLength={800} onChange={(event) => updateScene(scene.id, "foley", event.target.value)} value={scene.foley} />
                        </label>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <section className="voice-profile-card">
        <div className="voice-profile-heading"><span className="eyebrow-small">ZOZNAM HLASOV · TTS</span><h2>Hlasový prejav</h2><p>Pokyny pre čitateľnosť a nadväznosť medzi replikami.</p></div>
        <div className="voice-profile-grid">
          {screenplay.voiceProfiles.map((profile) => <div className="voice-profile-item" key={profile.speaker}><strong>{profile.speaker}</strong><p>{profile.direction}</p></div>)}
        </div>
      </section>

      <div className="screenplay-save-row">
        <div className="continue-copy">
          <span className="continue-check"><SparkIcon /></span>
          <span><strong>{isSaved ? "Scenár je uložený." : valid ? "Scenár je pripravený na uloženie." : "Upravte rozsah slov alebo skontrolujte časovanie."}</strong><small>{valid ? "Všetkých 15 scén spolu trvá presne zvolenú dĺžku filmu." : "Uloženie je možné, keď počet slov aj súčet sekúnd zodpovedajú plánu."}</small></span>
        </div>
        <div className="screenplay-actions">
          <button
            className="quiet-action"
            onClick={() => {
              if (!openScreenplayPrint(screenplay, draft, concept)) {
                window.alert("Prehliadač zablokoval nové okno. Povoľte vyskakovacie okná pre túto stránku a skúste znova.");
              }
            }}
            title="Otvorí formátovaný scenár v novom okne na tlač alebo uloženie do PDF"
            type="button"
          >
            Tlačová verzia / PDF
          </button>
          <button className="quiet-action" onClick={() => downloadScreenplayText(screenplay, draft, concept)} type="button">Exportovať .txt</button>
          <button className="primary-button" disabled={!valid || isSaved || isSaving} onClick={onSave} type="button">
            {isSaving ? "Ukladám scenár..." : isSaved ? "Scenár je uložený" : "Uložiť scenár"}
            {!isSaving && !isSaved ? <ArrowIcon /> : null}
          </button>
          {isSaved ? <button className="primary-button" onClick={onContinue} type="button">Pokračovať na vizuálnu knihu <ArrowIcon /></button> : null}
        </div>
      </div>
    </section>
  );
}

function downloadTimelineCsv(segments: TimelineSegment[], duration: number, title: string) {
  const escapeCell = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
  const rows = [
    ["Projekt", title],
    ["Dĺžka filmu", `${duration} min`],
    ["Tempo", "125 slov za minútu"],
    [],
    ["Časť", "Od", "Do", "Trvanie v sekundách", "Slová", "Dramaturgický význam"],
    ...segments.map((segment) => [
      segment.title,
      segment.from,
      segment.to,
      segment.durationSeconds,
      segment.words,
      segment.dramaturgy,
    ]),
  ];
  const csv = `\uFEFF${rows.map((row) => row.map(escapeCell).join(";")).join("\r\n")}`;
  const file = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${title.toLocaleLowerCase("sk").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "casovy-plan"}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export type TimelineViewProps = {
  draft: ProjectDraft;
  concept: StoryConcept | null;
  onBack: () => void;
  onGoToConcepts: () => void;
  onContinueSongs: () => void;
};

export function TimelineView({ draft, concept, onBack, onGoToConcepts, onContinueSongs }: TimelineViewProps) {
  const segments = runtimeTimeline(draft.duration);
  const budget = wordBudget(draft.duration);
  const totalSeconds = segments.reduce((total, segment) => total + segment.durationSeconds, 0);
  const totalWords = segments.reduce((total, segment) => total + segment.words, 0);

  if (!concept) {
    return (
      <section className="timeline-view">
        <StepHeading
          step="03"
          title="Príbeh potrebuje"
          accent="svoj rytmus."
          description="Časový plán nadväzuje na schválený príbehový smer."
        />
        <div className="locked-step-card">
          <div className="locked-step-icon"><LockIcon /></div>
          <span className="eyebrow-small">CHÝBA VYBRANÝ NÁMET</span>
          <h2>Najskôr si zvoľte príbehovú os.</h2>
          <p>Keď určíte vonkajšiu túžbu a vnútornú potrebu hrdinu, rozdelíme film na presné časové úseky.</p>
          <button className="primary-button" onClick={onGoToConcepts} type="button">Vybrať príbehový smer <ArrowIcon /></button>
        </div>
      </section>
    );
  }

  return (
    <section className="timeline-view">
      <StepHeading
        step="03"
        title="Príbeh potrebuje"
        accent="svoj rytmus."
        description="Časový plán rozdeľuje film na časti a presný slovný cieľ pri tempe 125 slov za minútu."
        action={<button className="quiet-action timeline-download" onClick={() => downloadTimelineCsv(segments, draft.duration, draft.title)} type="button">Stiahnuť plán <ArrowIcon /></button>}
      />

      <div className="selected-story-banner">
        <div className="selected-story-mark"><span>0{concept.id}</span></div>
        <div className="selected-story-copy">
          <span className="eyebrow-small">VYBRANÁ PRÍBEHOVÁ OS</span>
          <h2>{concept.title}</h2>
          <p>{concept.hook}</p>
        </div>
        <button className="text-button change-story-button" onClick={onBack} type="button">Zmeniť námet <ArrowIcon /></button>
      </div>

      <div className="timeline-metrics">
        <div className="timeline-metric-card"><span>CELKOVÁ DĹŽKA</span><strong>{draft.duration}:00 <small>min</small></strong><p>Súčet všetkých úsekov</p></div>
        <div className="timeline-metric-card"><span>SLOVNÝ CIEĽ</span><strong>{budget.words.toLocaleString("sk-SK")} <small>slov</small></strong><p>Rozsah {budget.minimum.toLocaleString("sk-SK")} až {budget.maximum.toLocaleString("sk-SK")}</p></div>
        <div className="timeline-metric-card"><span>OBRAZOVÝ VÝREZ</span><strong>{draft.aspectRatio}</strong><p>{draft.aspectRatio === "16:9" ? "Širokouhlý obraz" : "Zvislý obraz"}</p></div>
      </div>

      <section className="timeline-card">
        <div className="timeline-card-heading">
          <div><span className="eyebrow-small">ROZPIS FILMU</span><h2>Časová architektúra</h2></div>
          <span className="timeline-total-badge">{totalSeconds} sekúnd <i /> {totalWords.toLocaleString("sk-SK")} slov</span>
        </div>
        <div className="timeline-ribbon" aria-label="Pomer dĺžky jednotlivých častí">
          {segments.map((segment, index) => <span className={`ribbon-segment ribbon-${segment.kind} ribbon-index-${index}`} key={segment.id} style={{ flexGrow: segment.durationSeconds }} title={`${segment.title}: ${segment.durationSeconds} sekúnd`} />)}
        </div>
        <div className="timeline-table-scroll">
          <table className="timeline-table">
            <thead><tr><th>ČASŤ</th><th>ČASOVÝ ÚSEK</th><th>TRVANIE</th><th>SLOVÁ</th><th>DRAMATURGICKÝ VÝZNAM</th></tr></thead>
            <tbody>
              {segments.map((segment) => (
                <tr key={segment.id}>
                  <td><span className={`timeline-type-dot ${segment.kind}`} /><strong>{segment.title}</strong><small>{segment.kind === "song" ? "PIESEŇ" : "PRÍBEH"}</small></td>
                  <td className="timeline-time">{segment.from} - {segment.to}</td>
                  <td>{segment.durationSeconds} s</td>
                  <td><strong>{segment.words.toLocaleString("sk-SK")}</strong></td>
                  <td className="timeline-dramaturgy">{segment.dramaturgy}</td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr><td><strong>CELKOM</strong></td><td>00:00 - {segments[segments.length - 1]?.to}</td><td>{totalSeconds} s</td><td>{totalWords.toLocaleString("sk-SK")}</td><td>Rozdelenie času aj slov sa uzatvára presne.</td></tr></tfoot>
          </table>
        </div>
      </section>

      <div className="timeline-footnote"><SparkIcon /><p><strong>Kontrola súčtu:</strong> jednotlivé časti dávajú presne {draft.duration} minút a {budget.words.toLocaleString("sk-SK")} slov. Slovný cieľ každej časti zahŕňa aj text piesní.</p></div>
      <div className="timeline-bottom-actions">
        <button className="text-button" onClick={onBack} type="button">Späť k príbehovým námetom</button>
        <button className="primary-button" onClick={onContinueSongs} type="button">Pokračovať k piesňam <ArrowIcon /></button>
      </div>
    </section>
  );
}
