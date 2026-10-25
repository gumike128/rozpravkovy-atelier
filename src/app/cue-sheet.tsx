"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Camera,
  Check,
  Clapperboard,
  Copy,
  Download,
  Lock,
  Mic,
  Music,
  Play,
  Search,
  Volume2,
  X,
} from "lucide-react";
import { cueChunks, type CueSheet, type CueShot, type ProjectDraft, type StoryConcept } from "@/lib/production";

const NL = String.fromCharCode(10);

export type CueSheetViewProps = {
  draft: ProjectDraft;
  concept: StoryConcept | null;
  bibleReady: boolean;
  sheet: CueSheet | null;
  isSaved: boolean;
  isLoading: boolean;
  isGenerating: boolean;
  isSaving: boolean;
  error: string | null;
  onGenerate: () => void;
  onSave: () => void;
  onGoToBible: () => void;
  onContinue: () => void;
  onPreview: () => void;
};

function chunkAsText(shots: CueShot[], title: string) {
  const header = ["Shot ID", "In - Out", "Camera", "Staging", "Dialogue (SK + SSML)", "Foley", "Ducking"].join(" | ");
  const rows = shots.map((shot) =>
    [shot.id, `${shot.timeIn} - ${shot.timeOut}`, shot.camera, shot.staging, shot.dialogue || "(bez dialógu)", shot.foley, shot.ducking].join(" | "),
  );
  return [title, header, ...rows].join(NL);
}

function downloadCsv(sheet: CueSheet, draft: ProjectDraft) {
  const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
  const rows = [
    ["Projekt", draft.title],
    ["Záberov", sheet.shots.length],
    [],
    ["Shot ID", "Časť", "In", "Out", "Trvanie (s)", "Kamera a objektív", "Réžia záberu", "Dialóg (SK + SSML)", "Foley", "Ducking"],
    ...sheet.shots.map((shot) => [
      shot.id,
      cueChunks[shot.chunk].title,
      shot.timeIn,
      shot.timeOut,
      shot.durationSeconds.toFixed(1),
      shot.camera,
      shot.staging,
      shot.dialogue,
      shot.foley,
      shot.ducking,
    ]),
  ];
  const csv = `\uFEFF${rows.map((row) => row.map(escape).join(";")).join("\r\n")}`;
  const file = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${draft.title.toLocaleLowerCase("sk").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "zaberova-matica"}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function CueSheetView({
  draft,
  concept,
  bibleReady,
  sheet,
  isSaved,
  isLoading,
  isGenerating,
  isSaving,
  error,
  onGenerate,
  onSave,
  onGoToBible,
  onContinue,
  onPreview,
}: CueSheetViewProps) {
  const [activeChunk, setActiveChunk] = useState(0);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [unlockedChunk, setUnlockedChunk] = useState(0);
  const [copiedChunk, setCopiedChunk] = useState(false);

  const chunkShots = useMemo(
    () => (sheet ? sheet.shots.filter((shot) => shot.chunk === activeChunk) : []),
    [sheet, activeChunk],
  );
  const chunkSeconds = chunkShots.reduce((total, shot) => total + Math.round(shot.durationSeconds * 10), 0) / 10;
  const needle = query.trim().toLocaleLowerCase("sk");
  const visibleShots = useMemo(() => {
    if (!needle) return chunkShots;
    return chunkShots.filter((shot) =>
      [shot.id, shot.timeIn, shot.timeOut, shot.camera, shot.staging, shot.dialogue, shot.foley, shot.ducking]
        .join(" ")
        .toLocaleLowerCase("sk")
        .includes(needle),
    );
  }, [chunkShots, needle]);
  const visibleSeconds = visibleShots.reduce((total, shot) => total + Math.round(shot.durationSeconds * 10), 0) / 10;

  useEffect(() => {
    const onFocusSearch = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const editable = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (event.key === "/" && !editable) {
        event.preventDefault();
        searchRef.current?.focus();
      }
      const searchFocused = typeof document !== "undefined" && document.activeElement === searchRef.current;
      if (event.key === "Escape" && searchFocused) {
        setQuery("");
        searchRef.current?.blur();
      }
    };
    window.addEventListener("keydown", onFocusSearch);
    return () => window.removeEventListener("keydown", onFocusSearch);
  }, []);
  const canCreate = Boolean(concept && bibleReady);

  if (!canCreate || !concept) {
    return (
      <section className="cue-view">
        <div className="bible-heading">
          <span className="eyebrow">KROK 06 Z 09 <span className="eyebrow-line" /></span>
          <h1>Záber po zábere, <em>zvuk po zvuku.</em></h1>
          <p>Matica zosúladí kameru, réžiu, dialóg, Foley a hudobné stíšenie v každom zábere.</p>
        </div>
        <div className="locked-step-card">
          <div className="locked-step-icon"><Lock size={18} /></div>
          <span className="eyebrow-small">NAJPRV UZAMKNITE VIZUÁLNU KNIHU</span>
          <h2>Matica potrebuje uloženú vizuálnu knihu.</h2>
          <p>Zábery musia rešpektovať tokeny postáv aj farebný scenár. Uložte vizuálnu knihu a matica sa pripraví podľa nej.</p>
          <button className="primary-button" onClick={onGoToBible} type="button">Späť k vizuálnej knihe <ArrowRight size={15} /></button>
        </div>
      </section>
    );
  }

  const copyChunk = async () => {
    try {
      const heading = needle
        ? `${cueChunks[activeChunk].title} · filtrované: "${query.trim()}" (${visibleShots.length} záberov)`
        : cueChunks[activeChunk].title;
      await navigator.clipboard.writeText(chunkAsText(visibleShots, heading));
      setCopiedChunk(true);
      window.setTimeout(() => setCopiedChunk(false), 1500);
    } catch {
      setCopiedChunk(false);
    }
  };

  return (
    <section className="cue-view">
      <div className="bible-heading">
        <div>
          <span className="eyebrow">KROK 06 Z 09 <span className="eyebrow-line" /></span>
          <h1>Záber po zábere, <em>zvuk po zvuku.</em></h1>
          <p>Každý záber trvá 2,0 až 4,5 sekundy. Matica sa odomyká po častiach, aby nič neostalo nepovšimnuté.</p>
        </div>
        {sheet ? (
          <button className="quiet-action bible-back" onClick={() => downloadCsv(sheet, draft)} type="button">
            <Download size={14} /> Exportovať CSV
          </button>
        ) : null}
      </div>

      <div className="bible-context-banner">
        <div className="bible-context-mark"><Clapperboard size={18} /></div>
        <div className="bible-context-copy">
          <span className="eyebrow-small">ZÁBEROVÁ MATICA PRE NÁMET</span>
          <h2>{concept.title}</h2>
          <p>{sheet ? `${sheet.shots.length} záberov · ${draft.duration} minút · ` : ""}{draft.aspectRatio} · ducking -14 dB pod hlasom</p>
        </div>
        {sheet ? <span className={`status-pill ${isSaved ? "is-saved" : ""}`}><span className="status-dot" />{isSaved ? "ULOŽENÉ" : "NOVÉ"}</span> : null}
      </div>

      {error ? <div className="step-error" role="alert">{error}</div> : null}
      {isLoading ? <div className="concept-loading"><span className="mini-spinner" /> Načítavam záberovú maticu...</div> : null}

      {!isLoading && !sheet ? (
        <div className="concept-start-card">
          <div className="concept-start-mark"><Clapperboard size={18} /></div>
          <div>
            <span className="eyebrow-small">SYNCHRONIZÁCIA ODDELENÍ</span>
            <h2>Rozložme film na jednotlivé zábery.</h2>
            <p>Vygenerujeme celú maticu z časového plánu a scenára: kamera a objektív, réžia, slovenský dialóg so značkami, Foley a pravidlá stíšenia hudby.</p>
          </div>
          <button className="primary-button" disabled={isGenerating} onClick={onGenerate} type="button">
            {isGenerating ? <span className="button-spinner" /> : <Clapperboard size={16} />}
            {isGenerating ? "Strihám na zábery..." : "Vytvoriť záberovú maticu"}
            {!isGenerating ? <ArrowRight size={15} /> : null}
          </button>
        </div>
      ) : null}

      {!isLoading && sheet ? (
        <>
          <div className="cue-chunk-tabs" role="tablist" aria-label="Časti matice">
            {cueChunks.map((chunk) => {
              const locked = chunk.id > unlockedChunk;
              const count = sheet.shots.filter((shot) => shot.chunk === chunk.id).length;
              return (
                <button
                  aria-selected={activeChunk === chunk.id}
                  className={`cue-chunk-tab ${activeChunk === chunk.id ? "active" : ""} ${locked ? "locked" : ""}`}
                  disabled={locked}
                  key={chunk.id}
                  onClick={() => setActiveChunk(chunk.id)}
                  role="tab"
                  type="button"
                >
                  <span className="cue-chunk-number">{locked ? <Lock size={11} /> : String(chunk.id + 1).padStart(2, "0")}</span>
                  <span className="cue-chunk-name">{chunk.title}</span>
                  <span className="cue-chunk-count">{count} z.</span>
                </button>
              );
            })}
          </div>

          <div className="cue-chunk-toolbar">
            <div className="cue-chunk-stats">
              <span><Camera size={13} /> {needle ? `${visibleShots.length} z ${chunkShots.length}` : `${chunkShots.length}`} záberov</span>
              <span><Clapperboard size={13} /> {visibleSeconds.toFixed(1)} s</span>
              <span><Music size={13} /> hudba -14 dB pod hlasom, 0 dB na zásah</span>
              <span className="cue-search-hint"><Search size={12} /> Stlačte <kbd>/</kbd> na vyhľadávanie</span>
            </div>
            <label className="cue-search">
              <Search size={14} />
              <input
                aria-label="Hľadať v záberoch"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Shot ID, kamera, dialóg, foley..."
                ref={searchRef}
                type="search"
                value={query}
              />
              {query ? (
                <button aria-label="Zrušiť vyhľadávanie" onClick={() => setQuery("")} type="button">
                  <X size={13} />
                </button>
              ) : null}
            </label>
            <div className="cue-toolbar-actions">
              <button className="primary-button cue-preview-btn" onClick={onPreview} title="Prehrať film ako animatik s časovou osou a hlasom" type="button">
                <Play size={14} /> Prehrať animatik
              </button>
              <button className="quiet-action cue-copy" onClick={copyChunk} type="button">
                {copiedChunk ? <Check size={13} /> : <Copy size={13} />}
                {copiedChunk ? "Skopírované" : needle ? `Kopírovať výber (${visibleShots.length})` : "Kopírovať časť"}
              </button>
            </div>
          </div>

          <div className="cue-table-scroll">
            <table className="cue-table">
              <thead>
                <tr>
                  <th>SHOT</th>
                  <th>ČAS (IN - OUT)</th>
                  <th><Camera size={11} /> KAMERA A OBJEKTÍV</th>
                  <th>RÉŽIA ZÁBERU</th>
                  <th><Mic size={11} /> DIALÓG (SK + SSML)</th>
                  <th><Volume2 size={11} /> FOLEY</th>
                  <th><Music size={11} /> ZVUK A DUCKING</th>
                </tr>
              </thead>
              <tbody>
                {visibleShots.map((shot) => (
                  <tr key={shot.id}>
                    <td><span className="cue-shot-id">{shot.id}</span><small>{shot.durationSeconds.toFixed(1)} s</small></td>
                    <td className="cue-time">{shot.timeIn}<br />{shot.timeOut}</td>
                    <td><span className="cue-camera-badge">{shot.camera}</span></td>
                    <td className="cue-staging">{shot.staging}</td>
                    <td className="cue-dialogue">{shot.dialogue || <span className="cue-silent">bez dialógu, hrá obraz</span>}</td>
                    <td className="cue-foley">{shot.foley}</td>
                    <td>
                      <span className={`cue-duck-badge ${shot.dialogue ? "voice" : /ŽUCH|VRŔZG|CINKOT/.test(shot.foley) ? "hit" : "ambient"}`}>
                        {shot.dialogue ? <Mic size={11} /> : /ŽUCH|VRŔZG|CINKOT/.test(shot.foley) ? <Volume2 size={11} /> : <Music size={11} />}
                        {shot.ducking}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {visibleShots.length === 0 ? (
            <div className="cue-empty">
              <Search size={22} />
              <strong>V tejto časti nič nenašli.</strong>
              <p>Vyhľadávanie „{query.trim()}“ nemá v {cueChunks[activeChunk].title} žiadnu zhodu. Skúste iné slovo alebo zrušte filter.</p>
              <button className="quiet-action" onClick={() => setQuery("")} type="button">Zrušiť vyhľadávanie</button>
            </div>
          ) : null}

          <div className="cue-chunk-footer">
            {activeChunk < 3 ? (
              activeChunk === unlockedChunk ? (
                <button
                  className="primary-button"
                  onClick={() => {
                    const next = activeChunk + 1;
                    setUnlockedChunk(next);
                    setActiveChunk(next);
                  }}
                  type="button"
                >
                  Pokračovať: {cueChunks[activeChunk + 1].title} <ArrowRight size={15} />
                </button>
              ) : (
                <button className="quiet-action" onClick={() => setActiveChunk(Math.min(activeChunk + 1, unlockedChunk))} type="button">
                  Ďalšia odomknutá časť <ArrowRight size={14} />
                </button>
              )
            ) : (
              <span className="cue-complete-note"><Check size={14} /> Všetky štyri časti matice sú odkryté.</span>
            )}
            <div className="cue-save-actions">
              <button className="primary-button" disabled={isSaved || isSaving} onClick={onSave} type="button">
                {isSaving ? "Ukladám maticu..." : isSaved ? "Matica je uložená" : "Uložiť maticu"}
                {!isSaving && !isSaved ? <ArrowRight size={15} /> : null}
              </button>
              {isSaved ? <button className="primary-button" onClick={onContinue} type="button">Pokračovať na obrazové pokyny <ArrowRight size={15} /></button> : null}
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
