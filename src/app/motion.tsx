"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Copy,
  Download,
  Film,
  Lock,
  Smile,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  motionProfiles,
  promptChunks,
  type MotionEntry,
  type MotionPackage,
  type MotionProfileId,
  type ProjectDraft,
  type StoryConcept,
} from "@/lib/production";

const NL = String.fromCharCode(10);

const profileIcons: Record<MotionProfileId, typeof Smile> = {
  A: Smile,
  B: Zap,
  C: Sparkles,
};

export type MotionViewProps = {
  draft: ProjectDraft;
  concept: StoryConcept | null;
  promptsReady: boolean;
  pack: MotionPackage | null;
  isSaved: boolean;
  isLoading: boolean;
  isGenerating: boolean;
  isSaving: boolean;
  error: string | null;
  onGenerate: () => void;
  onSave: () => void;
  onGoToPrompts: () => void;
  onContinue: () => void;
};

function entriesAsTxt(entries: MotionEntry[]) {
  return entries.map((entry) => entry.motionPrompt).join(NL + NL) + NL;
}

function downloadTxt(entries: MotionEntry[], draft: ProjectDraft, filePart: string) {
  const file = new Blob([entriesAsTxt(entries)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = url;
  const slug = draft.title.toLocaleLowerCase("sk").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "pribeh";
  anchor.download = `${slug}-pohyb-${filePart}.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function MotionCard({ entry }: { entry: MotionEntry }) {
  const [copied, setCopied] = useState(false);
  const ProfileIcon = profileIcons[entry.profile];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(entry.motionPrompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <article className={`motion-card motion-profile-${entry.profile.toLowerCase()}`}>
      <div className="motion-card-top">
        <span className={`motion-badge motion-badge-${entry.profile.toLowerCase()}`}>
          <ProfileIcon size={13} />
          TYP {entry.profile}
        </span>
        <span className="prompt-shot-id">{entry.shotId}</span>
        <span className="motion-duration">{entry.durationSeconds.toFixed(1)} s</span>
        <span className="prompt-time">{entry.timeRange}</span>
        <button className="bible-copy-chip" onClick={copy} type="button">
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Skopírované" : "Kopírovať pohyb"}
        </button>
      </div>
      <p className="motion-card-camera">{entry.camera} · {motionProfiles[entry.profile].title}</p>
      <pre className="prompt-body motion-body">{entry.motionPrompt}</pre>
    </article>
  );
}

export function MotionView({
  draft,
  concept,
  promptsReady,
  pack,
  isSaved,
  isLoading,
  isGenerating,
  isSaving,
  error,
  onGenerate,
  onSave,
  onGoToPrompts,
  onContinue,
}: MotionViewProps) {
  const [activeChunk, setActiveChunk] = useState(0);
  const [unlockedChunk, setUnlockedChunk] = useState(0);

  const chunkEntries = useMemo(
    () => (pack ? pack.entries.filter((entry) => entry.chunk === activeChunk) : []),
    [pack, activeChunk],
  );
  const counts = useMemo(() => {
    const base: Record<MotionProfileId, number> = { A: 0, B: 0, C: 0 };
    pack?.entries.forEach((entry) => { base[entry.profile] += 1; });
    return base;
  }, [pack]);
  const canCreate = Boolean(concept && promptsReady);

  if (!canCreate || !concept) {
    return (
      <section className="motion-view">
        <div className="bible-heading">
          <span className="eyebrow">KROK 08 Z 09 <span className="eyebrow-line" /></span>
          <h1>Fyzika <em>každého záberu.</em></h1>
          <p>Pohybové predpisy pre Runway Gen-3, Luma Dream Machine, Sora a Kling podľa troch profilov animácie.</p>
        </div>
        <div className="locked-step-card">
          <div className="locked-step-icon"><Lock size={18} /></div>
          <span className="eyebrow-small">NAJPRV ULOŽTE OBRAZOVÉ POKYNY</span>
          <h2>Pohyb nadväzuje na obrazové pokyny.</h2>
          <p>Každý pohybový predpis zodpovedá jednému záberu a jeho obrazovému pokynu. Uložte pokyny a fyzika sa priradí automaticky.</p>
          <button className="primary-button" onClick={onGoToPrompts} type="button">Späť k obrazovým pokynom <ArrowRight size={15} /></button>
        </div>
      </section>
    );
  }

  return (
    <section className="motion-view">
      <div className="bible-heading">
        <div>
          <span className="eyebrow">KROK 08 Z 09 <span className="eyebrow-line" /></span>
          <h1>Fyzika <em>každého záberu.</em></h1>
          <p>Tri pohybové profily presne podľa trvania záberu. Predpisy pre Runway Gen-3, Luma, Sora aj Kling.</p>
        </div>
        {pack ? (
          <button className="quiet-action bible-back" onClick={() => downloadTxt(pack.entries, draft, "vsetky-akty")} type="button">
            <Download size={14} /> Všetok pohyb .txt
          </button>
        ) : null}
      </div>

      <div className="bible-context-banner">
        <div className="bible-context-mark"><Film size={18} /></div>
        <div className="bible-context-copy">
          <span className="eyebrow-small">POHYBOVÝ MOTOR PRE NÁMET</span>
          <h2>{concept.title}</h2>
          <p>{pack ? `${pack.entries.length} predpisov · ` : ""}24 fps · identita postáv uzamknutá referenciou</p>
        </div>
        {pack ? <span className={`status-pill ${isSaved ? "is-saved" : ""}`}><span className="status-dot" />{isSaved ? "ULOŽENÉ" : "NOVÉ"}</span> : null}
      </div>

      {error ? <div className="step-error" role="alert">{error}</div> : null}
      {isLoading ? <div className="concept-loading"><span className="mini-spinner" /> Načítavam pohybové predpisy...</div> : null}

      {!isLoading && !pack ? (
        <div className="concept-start-card">
          <div className="concept-start-mark"><Film size={18} /></div>
          <div>
            <span className="eyebrow-small">ANIMAČNÁ FYZIKA</span>
            <h2>Rozlíšme herectvo, slapstick a úžas.</h2>
            <p>Každý záber dostane profil A (mikroexpresie, 2,5 - 3,5 s), B (slapstick, 2,0 - 3,0 s) alebo C (rozjímanie, 3,5 - 4,5 s) s presnou pohybovou logikou pre generatívne video.</p>
          </div>
          <button className="primary-button" disabled={isGenerating} onClick={onGenerate} type="button">
            {isGenerating ? <span className="button-spinner" /> : <Film size={16} />}
            {isGenerating ? "Priraďujem fyziku..." : "Vytvoriť pohybové predpisy"}
            {!isGenerating ? <ArrowRight size={15} /> : null}
          </button>
        </div>
      ) : null}

      {!isLoading && pack ? (
        <>
          <div className="motion-profile-grid">
            {(Object.keys(motionProfiles) as MotionProfileId[]).map((profileId) => {
              const meta = motionProfiles[profileId];
              const ProfileIcon = profileIcons[profileId];
              const share = pack.entries.length > 0 ? Math.round((counts[profileId] / pack.entries.length) * 100) : 0;
              return (
                <article className={`motion-profile-card motion-profile-${profileId.toLowerCase()}`} key={profileId}>
                  <div className="motion-profile-head">
                    <span className={`motion-badge motion-badge-${profileId.toLowerCase()}`}><ProfileIcon size={14} /> TYP {profileId}</span>
                    <span className="motion-profile-range">{meta.range}</span>
                  </div>
                  <h3>{meta.title}</h3>
                  <p className="motion-profile-logic">{meta.logic}</p>
                  <div className="motion-share">
                    <div className="motion-share-track"><span style={{ width: `${share}%` }} /></div>
                    <strong>{counts[profileId]} záberov · {share} %</strong>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="cue-chunk-tabs" role="tablist" aria-label="Akty pohybu">
            {promptChunks.map((chunk) => {
              const locked = chunk.id > unlockedChunk;
              const count = pack.entries.filter((entry) => entry.chunk === chunk.id).length;
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
              <span><Film size={13} /> {chunkEntries.length} pohybových predpisov</span>
              <span><Smile size={13} /> A {chunkEntries.filter((e) => e.profile === "A").length}</span>
              <span><Zap size={13} /> B {chunkEntries.filter((e) => e.profile === "B").length}</span>
              <span><Sparkles size={13} /> C {chunkEntries.filter((e) => e.profile === "C").length}</span>
            </div>
            <button className="quiet-action cue-copy" onClick={() => downloadTxt(chunkEntries, draft, promptChunks[activeChunk].file)} type="button">
              <Download size={13} /> Stiahnuť pohyb aktu
            </button>
          </div>

          <div className="prompt-list">
            {chunkEntries.map((entry) => <MotionCard entry={entry} key={entry.shotId} />)}
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
                  Pokračovať: {promptChunks[activeChunk + 1].title} <ArrowRight size={15} />
                </button>
              ) : (
                <button className="quiet-action" onClick={() => setActiveChunk(Math.min(activeChunk + 1, unlockedChunk))} type="button">
                  Ďalší odomknutý akt <ArrowRight size={14} />
                </button>
              )
            ) : (
              <span className="cue-complete-note"><Check size={14} /> Všetky pohybové predpisy sú odkryté. Ďalší krok: finalizácia balíka (09).</span>
            )}
            <div className="cue-save-actions">
              <button className="primary-button" disabled={isSaved || isSaving} onClick={onSave} type="button">
                {isSaving ? "Ukladám pohyb..." : isSaved ? "Pohyb je uložený" : "Uložiť pohybové predpisy"}
                {!isSaving && !isSaved ? <ArrowRight size={15} /> : null}
              </button>
              {isSaved ? <button className="primary-button" onClick={onContinue} type="button">Finalizovať projekt <ArrowRight size={15} /></button> : null}
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
