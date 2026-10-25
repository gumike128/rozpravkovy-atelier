"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Mic,
  Music,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  cueChunks,
  worldImageFor,
  type CueSheet,
  type ProjectDraft,
  type StoryConcept,
  type VisualBible,
} from "@/lib/production";

export type AnimaticViewProps = {
  draft: ProjectDraft;
  concept: StoryConcept | null;
  sheet: CueSheet | null;
  bible: VisualBible | null;
  onBack: () => void;
};

const fallbackPalettes = [
  ["#F6D9A8", "#EFB366", "#A8C686"],
  ["#8FCB9B", "#F2C14E", "#5FA8D3"],
  ["#5C6B7A", "#8A97A5", "#3E4A57"],
  ["#F2A65A", "#FFD97D", "#7FB069"],
];

function cleanDialogue(raw: string) {
  return raw
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/^[^:\n]{0,40}:\s*/gm, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatClock(tenths: number) {
  const totalSeconds = Math.floor(tenths / 10);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function AnimaticView({ draft, concept, sheet, bible, onBack }: AnimaticViewProps) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ttsOn, setTtsOn] = useState(false);
  const rafRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const advanceRef = useRef(false);
  const pendingSeekRef = useRef<number | null>(null);
  const [seekKey, setSeekKey] = useState(0);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const ttsSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  const shots = useMemo(() => sheet?.shots ?? [], [sheet]);
  const totalTenths = useMemo(
    () => shots.reduce((total, shot) => total + Math.round(shot.durationSeconds * 10), 0),
    [shots],
  );
  const starts = useMemo(() => {
    const values: number[] = [];
    let cursor = 0;
    shots.forEach((shot) => {
      values.push(cursor);
      cursor += Math.round(shot.durationSeconds * 10);
    });
    return values;
  }, [shots]);
  const chunkBounds = useMemo(() => {
    return cueChunks.map((chunk) => {
      const chunkShots = shots.filter((shot) => shot.chunk === chunk.id);
      const tenths = chunkShots.reduce((total, shot) => total + Math.round(shot.durationSeconds * 10), 0);
      return { id: chunk.id, title: chunk.title, tenths, firstIndex: chunkShots.length > 0 ? shots.indexOf(chunkShots[0]) : 0 };
    });
  }, [shots]);

  const worldImage = useMemo(
    () => worldImageFor(draft),
    [draft],
  );

  const shot = shots[index];
  const palette = shot
    ? bible?.acts[Math.min(shot.chunk, (bible?.acts.length ?? 1) - 1)]?.palette ?? fallbackPalettes[shot.chunk]
    : fallbackPalettes[0];

  const stopSpeech = useCallback(() => {
    if (ttsSupported) window.speechSynthesis.cancel();
  }, [ttsSupported]);

  const speakShot = useCallback(
    (text: string) => {
      if (!ttsSupported || !ttsOn) return;
      const cleaned = cleanDialogue(text).slice(0, 240);
      if (!cleaned) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.lang = "sk-SK";
      utterance.rate = 1;
      const voices = voicesRef.current.length > 0 ? voicesRef.current : window.speechSynthesis.getVoices();
      const voice = voices.find((item) => item.lang.toLowerCase().startsWith("sk"))
        ?? voices.find((item) => item.lang.toLowerCase().startsWith("cs"));
      if (voice) utterance.voice = voice;
      window.speechSynthesis.speak(utterance);
    },
    [ttsOn, ttsSupported],
  );

  const goTo = useCallback((nextIndex: number, keepPlaying: boolean) => {
    advanceRef.current = true;
    offsetRef.current = 0;
    setProgress(0);
    setIndex(Math.max(0, nextIndex));
    if (!keepPlaying) setPlaying(false);
    stopSpeech();
  }, [stopSpeech]);

  const seekTo = useCallback(
    (tenths: number) => {
      if (shots.length === 0 || totalTenths === 0) return;
      const clamped = Math.max(0, Math.min(totalTenths - 1, tenths));
      let cursor = 0;
      let targetIndex = shots.length - 1;
      let ratio = 1;
      for (let i = 0; i < shots.length; i += 1) {
        const durationTenths = Math.round(shots[i].durationSeconds * 10);
        if (clamped <= cursor + durationTenths) {
          targetIndex = i;
          ratio = durationTenths > 0 ? (clamped - cursor) / durationTenths : 0;
          break;
        }
        cursor += durationTenths;
      }
      advanceRef.current = true;
      pendingSeekRef.current = ratio * shots[targetIndex].durationSeconds * 1000;
      stopSpeech();
      setIndex(targetIndex);
      setProgress(Math.max(0, Math.min(1, ratio)));
      setSeekKey((value) => value + 1);
    },
    [shots, stopSpeech, totalTenths],
  );

  useEffect(() => {
    if (!playing || !shot) return;
    speakShot(shot.dialogue);
    const durationMs = shot.durationSeconds * 1000;
    const initialOffset = pendingSeekRef.current !== null ? pendingSeekRef.current : offsetRef.current;
    pendingSeekRef.current = null;
    const start = performance.now() - initialOffset;

    const tick = (now: number) => {
      const elapsed = now - start;
      const ratio = Math.min(1, elapsed / durationMs);
      setProgress(ratio);
      if (ratio >= 1) {
        advanceRef.current = true;
        offsetRef.current = 0;
        setProgress(0);
        if (index < shots.length - 1) {
          setIndex(index + 1);
        } else {
          setIndex(0);
          setPlaying(false);
          stopSpeech();
        }
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (advanceRef.current) {
        advanceRef.current = false;
        offsetRef.current = 0;
      } else {
        offsetRef.current = performance.now() - start;
      }
    };
  }, [playing, index, shot, shots.length, speakShot, stopSpeech, seekKey]);

  useEffect(() => {
    if (!ttsSupported) return;
    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, [ttsSupported]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    const strip = stripRef.current;
    const active = strip?.querySelector<HTMLElement>(`[data-shot-index="${index}"]`);
    if (strip && active) {
      strip.scrollTo({ left: active.offsetLeft - strip.clientWidth / 2 + active.clientWidth / 2, behavior: "smooth" });
    }
  }, [index]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName ?? "";
      if (["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A"].includes(tag)) return;
      if (event.code === "Space") {
        event.preventDefault();
        setPlaying((current) => !current);
      } else if (event.code === "ArrowRight") {
        goTo(Math.min(index + 1, shots.length - 1), playing);
      } else if (event.code === "ArrowLeft") {
        goTo(Math.max(index - 1, 0), playing);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goTo, index, playing, shots.length]);

  if (!sheet || shots.length === 0 || !shot) {
    return (
      <section className="animatic-view">
        <div className="bible-heading">
          <span className="eyebrow">NÁHĽAD FILMU <span className="eyebrow-line" /></span>
          <h1>Animatik <em>čaká na zábery.</em></h1>
          <p>Prehrávač potrebuje uloženú záberovú maticu z kroku 06.</p>
        </div>
        <button className="primary-button" onClick={onBack} type="button"><ArrowLeft size={15} /> Späť k záberovej matici</button>
      </section>
    );
  }

  const elapsedTenths = starts[index] + progress * Math.round(shot.durationSeconds * 10);
  const playheadPercent = totalTenths > 0 ? (elapsedTenths / totalTenths) * 100 : 0;

  return (
    <section className="animatic-view">
      <div className="animatic-topbar">
        <button className="quiet-action" onClick={onBack} type="button"><ArrowLeft size={14} /> Záberová matica</button>
        <div className="animatic-title">
          <span className="eyebrow-small">ANIMATIK · {draft.title}</span>
          <strong>{concept?.title ?? draft.title}</strong>
        </div>
        <span className="animatic-clock">{formatClock(elapsedTenths)} / {formatClock(totalTenths)}</span>
      </div>

      <div
        className={`animatic-stage ${draft.aspectRatio === "9:16" ? "vertical" : ""}`}
        style={{
          backgroundImage: `linear-gradient(115deg, ${palette[0]}cc 0%, ${palette[1]}99 45%, ${palette[2]}b3 100%), url(${worldImage})`,
        }}
      >
        <div className="animatic-stage-shade" />
        <div className="animatic-stage-top">
          <span className="animatic-shot-chip">{shot.id}</span>
          <span className="animatic-camera-chip"><Camera size={12} /> {shot.camera}</span>
          <span className="animatic-act-chip">{cueChunks[shot.chunk].title}</span>
        </div>
        <div className="animatic-stage-copy" key={shot.id}>
          <p className="animatic-staging">{shot.staging}</p>
          {shot.dialogue ? (
            <p className="animatic-dialogue"><Mic size={14} /> {shot.dialogue}</p>
          ) : (
            <p className="animatic-silent"><Music size={14} /> Bez dialógu, hrá obraz a hudba.</p>
          )}
        </div>
        <div className="animatic-stage-bottom">
          <span className="animatic-foley">{shot.foley}</span>
          <span className="animatic-duck">{shot.ducking}</span>
          <span className="animatic-shot-progress"><i style={{ width: `${progress * 100}%` }} /></span>
        </div>
      </div>

      <div
        aria-label="Posun v celom filme"
        aria-orientation="horizontal"
        aria-valuemax={totalTenths}
        aria-valuemin={0}
        aria-valuenow={Math.round(elapsedTenths)}
        aria-valuetext={`${formatClock(elapsedTenths)} z ${formatClock(totalTenths)}`}
        className="animatic-colorbar"
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const ratio = rect.width > 0 ? (event.clientX - rect.left) / rect.width : 0;
          seekTo(Math.round(ratio * totalTenths));
        }}
        onKeyDown={(event) => {
          if (event.key === "Home") {
            event.preventDefault();
            seekTo(0);
          } else if (event.key === "End") {
            event.preventDefault();
            seekTo(totalTenths - 1);
          }
        }}
        role="slider"
        style={{ cursor: "pointer" }}
        tabIndex={0}
      >
        {chunkBounds.map((chunk) => (
          <span
            className="animatic-color-segment"
            key={chunk.id}
            style={{
              flexGrow: Math.max(chunk.tenths, 1),
              background: `linear-gradient(120deg, ${(bible?.acts[chunk.id]?.palette ?? fallbackPalettes[chunk.id]).join(", ")})`,
            }}
            title={`${chunk.title}: ${formatClock(starts[chunk.firstIndex] ?? 0)} až ${formatClock((starts[chunk.firstIndex] ?? 0) + chunk.tenths)}`}
          />
        ))}
        <span className="animatic-playhead" style={{ left: `${playheadPercent}%` }} />
      </div>

      <div className="animatic-legend" aria-label="Skok na začiatok aktu">
        {chunkBounds.map((chunk) => (
          <button
            className={`animatic-legend-item ${shot.chunk === chunk.id ? "active" : ""}`}
            key={chunk.id}
            onClick={() => goTo(chunk.firstIndex, playing)}
            title={`${chunk.title}: skok na začiatok (od ${formatClock(starts[chunk.firstIndex] ?? 0)})`}
            type="button"
          >
            <span className="animatic-legend-dot" style={{ background: `linear-gradient(120deg, ${(bible?.acts[chunk.id]?.palette ?? fallbackPalettes[chunk.id]).join(", ")})` }} />
            <span className="animatic-legend-name">{chunk.title}</span>
            <span className="animatic-legend-time">{formatClock(starts[chunk.firstIndex] ?? 0)}</span>
          </button>
        ))}
      </div>

      <div className="animatic-controls">
        <div className="animatic-transport">
          <button aria-label="Predchádzajúci záber" className="animatic-icon-btn" onClick={() => goTo(Math.max(index - 1, 0), playing)} title="Predchádzajúci záber (šípka vľavo)" type="button">
            <ChevronLeft size={17} />
          </button>
          <button
            aria-label={playing ? "Pozastaviť" : "Prehrať"}
            className="animatic-play-btn"
            onClick={() => setPlaying((current) => !current)}
            title={playing ? "Pozastaviť (medzerník)" : "Prehrať (medzerník)"}
            type="button"
          >
            {playing ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button aria-label="Ďalší záber" className="animatic-icon-btn" onClick={() => goTo(Math.min(index + 1, shots.length - 1), playing)} title="Ďalší záber (šípka vpravo)" type="button">
            <ChevronRight size={17} />
          </button>
          <button aria-label="Od začiatku" className="animatic-icon-btn" onClick={() => goTo(0, false)} title="Vrátiť sa na začiatok" type="button">
            <RotateCcw size={15} />
          </button>
        </div>
        <div className="animatic-meta">
          <span><Clapperboard size={13} /> Záber {index + 1} / {shots.length}</span>
          <span>{shot.durationSeconds.toFixed(1)} s · {shot.timeIn} - {shot.timeOut}</span>
        </div>
        <button
          className={`animatic-tts ${ttsOn ? "on" : ""}`}
          disabled={!ttsSupported}
          onClick={() => {
            setTtsOn((current) => {
              if (current) stopSpeech();
              return !current;
            });
          }}
          title={ttsSupported ? "Čítať dialógy hlasom prehliadača (slovenčina, ak je dostupná)" : "Prehliadač nepodporuje syntézu reči"}
          type="button"
        >
          {ttsOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
          {ttsSupported ? (ttsOn ? "Hlas zapnutý" : "Čítať dialógy") : "Hlas nedostupný"}
        </button>
      </div>

      <div className="animatic-strip" ref={stripRef} aria-label="Filmový pás záberov">
        {shots.map((item, shotIndex) => {
          const itemPalette = bible?.acts[Math.min(item.chunk, (bible?.acts.length ?? 1) - 1)]?.palette ?? fallbackPalettes[item.chunk];
          return (
            <button
              className={`animatic-frame ${shotIndex === index ? "active" : ""}`}
              data-shot-index={shotIndex}
              key={item.id}
              onClick={() => goTo(shotIndex, playing)}
              style={{ background: `linear-gradient(150deg, ${itemPalette[0]}, ${itemPalette[2]})` }}
              title={`${item.id} · ${item.timeIn} · ${item.camera}`}
              type="button"
            >
              <span>{shotIndex + 1}</span>
              {item.dialogue ? <Mic size={9} /> : <Music size={9} />}
            </button>
          );
        })}
      </div>

      <p className="animatic-hint">Medzerník prehráva a pozastavuje, šípky preskakujú zábery. Kliknutím na farebný pás skočíte na začiatok aktu, rámiky pásu sú jednotlivé zábery.</p>
    </section>
  );
}
