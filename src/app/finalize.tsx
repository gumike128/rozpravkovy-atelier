"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Check,
  Clapperboard,
  Copy,
  Download,
  FileJson,
  Image as ImageIcon,
  Lock,
  Music,
  PartyPopper,
  Sparkles,
} from "lucide-react";
import {
  buildEdl,
  buildNleJson,
  worldImageFor,
  type CueSheet,
  type FinalPackage,
  type ProjectDraft,
  type StoryConcept,
} from "@/lib/production";

const NL = String.fromCharCode(10);

export type FinalizeViewProps = {
  draft: ProjectDraft;
  concept: StoryConcept | null;
  motionReady: boolean;
  finalPack: FinalPackage | null;
  cueSheet: CueSheet | null;
  isSaved: boolean;
  isLoading: boolean;
  isGenerating: boolean;
  isSaving: boolean;
  error: string | null;
  onGenerate: () => void;
  onSave: () => void;
  onGoToMotion: () => void;
  onRestart: () => void;
  onPreview: () => void;
};

function downloadBlob(content: string, type: string, filename: string) {
  const file = new Blob([content], { type });
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function CopyChip({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button className="bible-copy-chip" onClick={copy} type="button">
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "Skopírované" : label}
    </button>
  );
}

function PartHeading({ letter, icon, title, note }: { letter: string; icon: ReactNode; title: string; note: string }) {
  return (
    <div className="final-part-heading">
      <span className="final-part-letter">{letter}</span>
      <span className="final-part-icon">{icon}</span>
      <div>
        <h2>{title}</h2>
        <p>{note}</p>
      </div>
    </div>
  );
}

export function FinalizeView({
  draft,
  concept,
  motionReady,
  finalPack,
  cueSheet,
  isSaved,
  isLoading,
  isGenerating,
  isSaving,
  error,
  onGenerate,
  onSave,
  onGoToMotion,
  onRestart,
  onPreview,
}: FinalizeViewProps) {
  const [nleTab, setNleTab] = useState<"json" | "edl">("json");
  const slug = draft.title.toLocaleLowerCase("sk").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "pribeh";

  const nleJson = useMemo(
    () => (cueSheet ? JSON.stringify(buildNleJson(draft, cueSheet), null, 2) : ""),
    [draft, cueSheet],
  );
  const edl = useMemo(() => (cueSheet ? buildEdl(draft, cueSheet) : ""), [draft, cueSheet]);
  const canCreate = Boolean(concept && motionReady && cueSheet);

  if (!canCreate || !concept || !cueSheet) {
    return (
      <section className="final-view">
        <div className="bible-heading">
          <span className="eyebrow">KROK 09 Z 09 <span className="eyebrow-line" /></span>
          <h1>Balík pre <em>veľké plátno.</em></h1>
          <p>Hudobné podklady, miniatúry a časová os pre strižňu. Posledná bodka za celou výrobou.</p>
        </div>
        <div className="locked-step-card">
          <div className="locked-step-icon"><Lock size={18} /></div>
          <span className="eyebrow-small">NAJPRV ULOŽTE POHYBOVÉ PREDPISY</span>
          <h2>Finalizácia uzatvára všetkých osem krokov.</h2>
          <p>Balík potrebuje uložený pohybový motor aj záberovú maticu, z ktorých vznikne presná časová os strihu.</p>
          <button className="primary-button" onClick={onGoToMotion} type="button">Späť na pohybový motor <ArrowRight size={15} /></button>
        </div>
      </section>
    );
  }

  const shots = cueSheet.shots.length;
  const dialogueShots = cueSheet.shots.filter((shot) => shot.dialogue).length;

  return (
    <section className="final-view">
      <div className="final-hero">
        <div className="final-hero-art" style={{ backgroundImage: `url(${worldImageFor(draft)})` }} />
        <div className="final-hero-shade" />
        <div className="final-hero-copy">
          <span className="keyart-label"><PartyPopper size={14} /> KROK 09 Z 09 · FINALIZÁCIA</span>
          <h2>{draft.title}</h2>
          <p>{concept.title} · posledný krok od malej iskry k hotovému balíku.</p>
          <div className="final-hero-stats">
            <span><Clapperboard size={13} /> {shots} záberov</span>
            <span><Music size={13} /> 2 piesne + 2 podklady</span>
            <span><Sparkles size={13} /> {dialogueShots} replík v osi</span>
            <span><FileJson size={13} /> 24 fps · {draft.aspectRatio}</span>
          </div>
        </div>
      </div>

      {error ? <div className="step-error" role="alert">{error}</div> : null}
      {isLoading ? <div className="concept-loading"><span className="mini-spinner" /> Načítavam záverečný balík...</div> : null}

      {!isLoading && !finalPack ? (
        <div className="concept-start-card">
          <div className="concept-start-mark"><PartyPopper size={18} /></div>
          <div>
            <span className="eyebrow-small">ZÁVEREČNÝ BALÍK</span>
            <h2>Dozvučme film hudbou, obrazom a strihom.</h2>
            <p>Pripravíme dva orchestrálne podklady pre Suno/Udio, dve miniatúry s vysokou mierou prekliku a export JSON + EDL pre DaVinci Resolve, Premiere Pro či Final Cut Pro.</p>
          </div>
          <button className="primary-button" disabled={isGenerating} onClick={onGenerate} type="button">
            {isGenerating ? <span className="button-spinner" /> : <PartyPopper size={16} />}
            {isGenerating ? "Finalizujem balík..." : "Finalizovať projekt"}
            {!isGenerating ? <ArrowRight size={15} /> : null}
          </button>
        </div>
      ) : null}

      {!isLoading && finalPack ? (
        <>
          <div className="final-section">
            <PartHeading letter="A" icon={<Music size={15} />} title="Orchestrálne podklady" note="Dva inštrumentálne pokyny pre Suno alebo Udio, pripravené na vloženie." />
            <div className="final-duo-grid">
              <article className="final-card">
                <div className="final-card-top">
                  <span className="final-card-tag warm"><Music size={12} /> TEMATICKÝ PODKLAD</span>
                  <CopyChip text={finalPack.thematicUnderscore} label="Kopírovať" />
                </div>
                <pre className="prompt-body">{finalPack.thematicUnderscore}</pre>
              </article>
              <article className="final-card">
                <div className="final-card-top">
                  <span className="final-card-tag cool"><Sparkles size={12} /> NAPÄTIE A KOMIKA</span>
                  <CopyChip text={finalPack.tensionCue} label="Kopírovať" />
                </div>
                <pre className="prompt-body">{finalPack.tensionCue}</pre>
              </article>
            </div>
            <p className="final-negative-note"><Lock size={11} /> Negatívne flagy v oboch: no vocals, no beat drops, no electric guitar, no synthetic drums.</p>
          </div>

          <div className="final-section">
            <PartHeading letter="B" icon={<ImageIcon size={15} />} title="Miniatúry pre rodinné publikum" note="Dva kontrastné koncepty čitateľné pri 200px náhľade na mobile." />
            <div className="final-duo-grid">
              <article className="final-card thumb-card">
                <div className="final-thumb-visual wonder" style={{ backgroundImage: `url(${worldImageFor(draft)})` }}>
                  <span>EMOCIONÁLNY ÚŽAS</span>
                </div>
                <div className="final-card-top">
                  <span className="final-card-tag warm"><Sparkles size={12} /> KONCEPT 1</span>
                  <CopyChip text={finalPack.thumbnailWonder} label="Kopírovať pokyn" />
                </div>
                <pre className="prompt-body thumb-body">{finalPack.thumbnailWonder}</pre>
              </article>
              <article className="final-card thumb-card">
                <div className="final-thumb-visual slapstick" style={{ backgroundImage: `url(${worldImageFor(draft)})` }}>
                  <span>ČISTÝ SLAPSTICK</span>
                </div>
                <div className="final-card-top">
                  <span className="final-card-tag cool"><PartyPopper size={12} /> KONCEPT 2</span>
                  <CopyChip text={finalPack.thumbnailSlapstick} label="Kopírovať pokyn" />
                </div>
                <pre className="prompt-body thumb-body">{finalPack.thumbnailSlapstick}</pre>
              </article>
            </div>
          </div>

          <div className="final-section">
            <PartHeading letter="C" icon={<FileJson size={15} />} title="Časová os strižne" note={`JSON a EDL s ${shots} zábermi, 24 fps, stopy A1 hlas, A2 Foley, A3 hudba.`} />
            <div className="final-nle-card">
              <div className="final-nle-toolbar">
                <div className="final-nle-tabs" role="tablist" aria-label="Formát exportu">
                  <button aria-selected={nleTab === "json"} className={nleTab === "json" ? "active" : ""} onClick={() => setNleTab("json")} role="tab" type="button">
                    <FileJson size={13} /> JSON
                  </button>
                  <button aria-selected={nleTab === "edl"} className={nleTab === "edl" ? "active" : ""} onClick={() => setNleTab("edl")} role="tab" type="button">
                    <Clapperboard size={13} /> EDL
                  </button>
                </div>
                <div className="final-nle-actions">
                  <CopyChip text={nleTab === "json" ? nleJson : edl} label={`Kopírovať ${nleTab.toUpperCase()}`} />
                  <button
                    className="quiet-action"
                    onClick={() =>
                      nleTab === "json"
                        ? downloadBlob(nleJson, "application/json", `${slug}-timeline.json`)
                        : downloadBlob(edl, "text/plain", `${slug}-timeline.edl`)
                    }
                    type="button"
                  >
                    <Download size={13} /> Stiahnuť .{nleTab}
                  </button>
                </div>
              </div>
              <pre className="final-nle-preview">{nleTab === "json" ? nleJson : edl}</pre>
              <p className="final-nle-note">Import: DaVinci Resolve (File → Import Timeline → EDL), Premiere Pro aj Final Cut Pro. Časové kódy sedia na desatinu sekundy s maticou.</p>
            </div>
          </div>

          <div className="final-save-row">
            <button className="primary-button" disabled={isSaved || isSaving} onClick={onSave} type="button">
              {isSaving ? "Ukladám balík..." : isSaved ? "Balík je uložený" : "Uložiť záverečný balík"}
              {!isSaving && !isSaved ? <ArrowRight size={15} /> : null}
            </button>
          </div>

          {isSaved ? (
            <div className="final-complete-banner">
              <span className="final-complete-icon"><PartyPopper size={20} /></span>
              <div>
                <h3>Projekt je kompletne pripravený.</h3>
                <p>Deväť krokov, jedna rozprávka. Napíšte „znova“ pre nový príbeh, alebo sa vráťte ku ktorémukoľvek kroku a upravte ho. Zmeny automaticky označia nadväzujúce časti na obnovenie.</p>
              </div>
              <div className="final-banner-actions">
                <button className="quiet-action" onClick={onPreview} type="button">Pozrieť animatik <ArrowRight size={14} /></button>
                <button className="quiet-action" onClick={onRestart} type="button">Začať nový príbeh <ArrowRight size={14} /></button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
