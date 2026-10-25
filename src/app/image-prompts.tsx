"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Copy,
  Download,
  FileText,
  Image as ImageIcon,
  Lock,
  Wand2,
} from "lucide-react";
import {
  promptChunks,
  type ImagePromptEntry,
  type ImagePromptPackage,
  type ProjectDraft,
  type StoryConcept,
} from "@/lib/production";

const NL = String.fromCharCode(10);

export type ImagePromptsViewProps = {
  draft: ProjectDraft;
  concept: StoryConcept | null;
  cueReady: boolean;
  pack: ImagePromptPackage | null;
  isSaved: boolean;
  isLoading: boolean;
  isGenerating: boolean;
  isSaving: boolean;
  error: string | null;
  onGenerate: () => void;
  onSave: () => void;
  onGoToShots: () => void;
  onContinue: () => void;
};

function entriesAsTxt(entries: ImagePromptEntry[]) {
  return entries.map((entry) => `${entry.prompt}${NL}${entry.negative}`).join(NL + NL) + NL;
}

function downloadTxt(entries: ImagePromptEntry[], draft: ProjectDraft, filePart: string) {
  const file = new Blob([entriesAsTxt(entries)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = url;
  const slug = draft.title.toLocaleLowerCase("sk").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "pribeh";
  anchor.download = `${slug}-${filePart}.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function PromptCard({ entry }: { entry: ImagePromptEntry }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${entry.prompt}${NL}${entry.negative}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <article className="prompt-card">
      <div className="prompt-card-top">
        <span className="prompt-shot-id">{entry.shotId}</span>
        <span className="prompt-time">{entry.timeRange}</span>
        <span className="prompt-act">{entry.actLabel}</span>
        <button className="bible-copy-chip" onClick={copy} type="button">
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Skopírované" : "Kopírovať pokyn"}
        </button>
      </div>
      <pre className="prompt-body">{entry.prompt}</pre>
      <pre className="prompt-negative">{entry.negative}</pre>
    </article>
  );
}

export function ImagePromptsView({
  draft,
  concept,
  cueReady,
  pack,
  isSaved,
  isLoading,
  isGenerating,
  isSaving,
  error,
  onGenerate,
  onSave,
  onGoToShots,
  onContinue,
}: ImagePromptsViewProps) {
  const [activeChunk, setActiveChunk] = useState(0);
  const [unlockedChunk, setUnlockedChunk] = useState(0);

  const chunkEntries = useMemo(
    () => (pack ? pack.prompts.filter((entry) => entry.chunk === activeChunk) : []),
    [pack, activeChunk],
  );
  const canCreate = Boolean(concept && cueReady);

  if (!canCreate || !concept) {
    return (
      <section className="prompts-view">
        <div className="bible-heading">
          <span className="eyebrow">KROK 07 Z 09 <span className="eyebrow-line" /></span>
          <h1>Každý záber, <em>jeden pokyn.</em></h1>
          <p>Samostatné obrazové pokyny pre Midjourney v6 a Flux.1 s uzamknutými tokenmi a štýlovým blokom.</p>
        </div>
        <div className="locked-step-card">
          <div className="locked-step-icon"><Lock size={18} /></div>
          <span className="eyebrow-small">NAJPRV ULOŽTE ZÁBEROVÚ MATICU</span>
          <h2>Pokyny potrebujú uloženú maticu.</h2>
          <p>Každý pokyn vzniká z jedného záberu matice: kamera, réžia aj svetlo farebného scenára. Uložte maticu a pokyny sa pripravia automaticky.</p>
          <button className="primary-button" onClick={onGoToShots} type="button">Späť k záberovej matici <ArrowRight size={15} /></button>
        </div>
      </section>
    );
  }

  return (
    <section className="prompts-view">
      <div className="bible-heading">
        <div>
          <span className="eyebrow">KROK 07 Z 09 <span className="eyebrow-line" /></span>
          <h1>Každý záber, <em>jeden pokyn.</em></h1>
          <p>Pokyny pre Midjourney v6 a Flux.1: 70 % hrdina, 20 % rekvizity, 10 % hĺbka sveta. Tokeny a štýl doslovne v každom bloku.</p>
        </div>
        {pack ? (
          <button className="quiet-action bible-back" onClick={() => downloadTxt(pack.prompts, draft, "vsetky-akty")} type="button">
            <Download size={14} /> Všetky akty .txt
          </button>
        ) : null}
      </div>

      <div className="bible-context-banner">
        <div className="bible-context-mark"><ImageIcon size={18} /></div>
        <div className="bible-context-copy">
          <span className="eyebrow-small">OBRAZOVÉ POKYNY PRE NÁMET</span>
          <h2>{concept.title}</h2>
          <p>{pack ? `${pack.prompts.length} pokynov · ` : ""}--ar {draft.aspectRatio} · --stylize 250 · --cw 80</p>
        </div>
        {pack ? <span className={`status-pill ${isSaved ? "is-saved" : ""}`}><span className="status-dot" />{isSaved ? "ULOŽENÉ" : "NOVÉ"}</span> : null}
      </div>

      {error ? <div className="step-error" role="alert">{error}</div> : null}
      {isLoading ? <div className="concept-loading"><span className="mini-spinner" /> Načítavam obrazové pokyny...</div> : null}

      {!isLoading && !pack ? (
        <div className="concept-start-card">
          <div className="concept-start-mark"><Wand2 size={18} /></div>
          <div>
            <span className="eyebrow-small">PARAMETRICKÉ POKYNY</span>
            <h2>Premeňme zábery na jazyk generátorov obrazu.</h2>
            <p>Ku každému záberu vznikne samostatný blok: kompozícia, tokeny [CHAR_HERO], [CHAR_SIDE], [ENV_WORLD], objektív, svetlo aktu, trvalý štýlový blok, flagy a izolovaný negatívny pokyn.</p>
          </div>
          <button className="primary-button" disabled={isGenerating} onClick={onGenerate} type="button">
            {isGenerating ? <span className="button-spinner" /> : <Wand2 size={16} />}
            {isGenerating ? "Skladám pokyny..." : "Vytvoriť obrazové pokyny"}
            {!isGenerating ? <ArrowRight size={15} /> : null}
          </button>
        </div>
      ) : null}

      {!isLoading && pack ? (
        <>
          <div className="cue-chunk-tabs" role="tablist" aria-label="Akty pokynov">
            {promptChunks.map((chunk) => {
              const locked = chunk.id > unlockedChunk;
              const count = pack.prompts.filter((entry) => entry.chunk === chunk.id).length;
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
                  <span className="cue-chunk-count">{count} p.</span>
                </button>
              );
            })}
          </div>

          <div className="cue-chunk-toolbar">
            <div className="cue-chunk-stats">
              <span><FileText size={13} /> {chunkEntries.length} samostatných blokov</span>
              <span><ImageIcon size={13} /> Midjourney v6 · Flux.1</span>
            </div>
            <button className="quiet-action cue-copy" onClick={() => downloadTxt(chunkEntries, draft, promptChunks[activeChunk].file)} type="button">
              <Download size={13} /> Stiahnuť {promptChunks[activeChunk].title}.txt
            </button>
          </div>

          <div className="prompt-list">
            {chunkEntries.map((entry) => <PromptCard entry={entry} key={entry.shotId} />)}
          </div>

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
                  Exportovať ďalší akt: {promptChunks[activeChunk + 1].title} <ArrowRight size={15} />
                </button>
              ) : (
                <button className="quiet-action" onClick={() => setActiveChunk(Math.min(activeChunk + 1, unlockedChunk))} type="button">
                  Ďalší odomknutý akt <ArrowRight size={14} />
                </button>
              )
            ) : (
              <span className="cue-complete-note"><Check size={14} /> Všetky štyri akty sú pripravené na export.</span>
            )}
            <div className="cue-save-actions">
              <button className="primary-button" disabled={isSaved || isSaving} onClick={onSave} type="button">
                {isSaving ? "Ukladám pokyny..." : isSaved ? "Pokyny sú uložené" : "Uložiť pokyny"}
                {!isSaving && !isSaved ? <ArrowRight size={15} /> : null}
              </button>
              {isSaved ? <button className="primary-button" onClick={onContinue} type="button">Pokračovať na pohybový motor <ArrowRight size={15} /></button> : null}
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
