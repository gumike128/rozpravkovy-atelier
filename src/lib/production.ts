export type AspectRatio = "16:9" | "9:16";
export type StoryBeatLabel =
  | "Kde bolo, tam bolo..."
  | "Každý deň..."
  | "Až jedného dňa..."
  | "A preto..."
  | "Až nakoniec..."
  | "A odvtedy...";

export type StoryBeat = {
  label: StoryBeatLabel;
  text: string;
};

export type StoryConcept = {
  id: number;
  title: string;
  hook: string;
  externalWant: string;
  internalNeed: string;
  tone: string;
  beats: StoryBeat[];
};

export type SavedConceptSet = {
  id: string;
  projectId: string;
  concepts: StoryConcept[];
  selectedConceptId: number | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type SongTrack = {
  title: string;
  lyrics: string[];
  stylePrompt: string;
};

export type SongPackage = {
  conceptId: number;
  opening: SongTrack;
  closing: SongTrack;
};

export type SavedSongSet = {
  id: string;
  projectId: string;
  songPackage: SongPackage;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type ScreenplayScene = {
  id: string;
  act: string;
  heading: string;
  durationSeconds: number;
  action: string;
  dialogue: string;
  foley: string;
};

export type VoiceProfile = {
  speaker: string;
  direction: string;
};

export type ScreenplayPackage = {
  conceptId: number;
  scenes: ScreenplayScene[];
  voiceProfiles: VoiceProfile[];
};

export type SavedScreenplay = {
  id: string;
  projectId: string;
  screenplay: ScreenplayPackage;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type TimelineSegment = {
  id: string;
  title: string;
  from: string;
  to: string;
  durationSeconds: number;
  words: number;
  dramaturgy: string;
  kind: "song" | "story";
};

export type ProjectDraft = {
  title: string;
  audienceAge: string;
  languageRegister: string;
  heroName: string;
  heroDescription: string;
  sideName: string;
  sideDescription: string;
  environment: string;
  plot: string;
  moral: string;
  duration: 8 | 9 | 10;
  aspectRatio: AspectRatio;
};

export type SavedProject = ProjectDraft & {
  id: string;
  createdAt: string | Date;
  completedSteps?: number;
};

export const sampleDraft: ProjectDraft = {
  title: "Kiko a stratená iskra",
  audienceAge: "5 - 7 rokov",
  languageRegister: "Spisovná, hravá a zvukomalebná slovenčina",
  heroName: "Kiko",
  heroDescription:
    "Zvedavá ryšavá veverička s krémovým ňufáčikom, lieskovými očami a malou kapsou na žaluď. Túži všetko zvládnuť sama.",
  sideName: "Bublinka",
  sideDescription:
    "Pokojný modrozelený slimáčik so zlatou ulitou. Premýšľa pomaly, všíma si drobnosti a rád pomáha.",
  environment:
    "Mätový les s mäkkým machom, brezovými chodníčkami, kvapkami rosy a svetielkujúcimi semienkami medzi papraďami.",
  plot:
    "Kiko chce nájsť iskru, ktorá každú noc rozsvieti lesnú lampu, skôr než sa zotmie.",
  moral:
    "Keď si navzájom pomáhame a odvážime sa požiadať o pomoc, aj malé svetielko dokáže rozjasniť celý les.",
  duration: 9,
  aspectRatio: "16:9",
};

export type WorldPreset = {
  id: string;
  name: string;
  tagline: string;
  image: string;
  ageTag: string;
  moralTag: string;
  draft: ProjectDraft;
};

export const worldPresets: WorldPreset[] = [
  {
    id: "forest",
    name: "Mätový les",
    tagline: "Veverička a slimáčik hľadajú stratenú iskru lesnej lampy.",
    image: "/images/storybook-forest.svg",
    ageTag: "5 - 7 rokov",
    moralTag: "Pomoc a priateľstvo",
    draft: { ...sampleDraft },
  },
  {
    id: "meadow",
    name: "Horská lúka",
    tagline: "Svišťko a svetluška nesú posledné svetielko na večernú oblohu.",
    image: "/images/world-meadow.svg",
    ageTag: "4 - 6 rokov",
    moralTag: "Odvaha v malých krokoch",
    draft: {
      title: "Hvizd a večerná hviezdička",
      audienceAge: "4 - 6 rokov",
      languageRegister: "Spisovná, hravá a zvukomalebná slovenčina",
      heroName: "Hvizd",
      heroDescription:
        "Okrúhly karamelový svišťok s krémovým bruškom a veľkými jantárovými očami. Vyšplhá sa všade, no pred posledným strmým schodom na vyhliadku sa mu vždy roztrasú labky.",
      sideName: "Lienka",
      sideDescription:
        "Trpezlivá svetluška s priehľadnými krídelkami a teplým zlatým svetielkom. Lieta pomaly, vždy vie, kadiaľ fúka vietor, a rada počúva.",
      environment:
        "Horská lúka nad oblakmi s jemnou trávou, zvončekmi a horcami, mäkkými balvanmi porastenými machom a vôňou chladného večera.",
      plot:
        "Hvizd chce na najvyššiu skalu zaniesť Lienkino svetielko skôr, než vyjde prvá hviezda, no cesta vedie cez strmý chodník, ktorého sa bojí.",
      moral:
        "Odvaha nerastie z jedného veľkého skoku, ale z malých krokov, pri ktorých nám kamarát svieti.",
      duration: 8,
      aspectRatio: "16:9",
    },
  },
  {
    id: "pond",
    name: "Spievajúci rybník",
    tagline: "Žabiatko chce sólo, vážka ho učí počúvať ticho medzi tónmi.",
    image: "/images/world-pond.svg",
    ageTag: "7 - 9 rokov",
    moralTag: "Načúvanie a spolupráca",
    draft: {
      title: "Kvák a pieseň rybníka",
      audienceAge: "7 - 9 rokov",
      languageRegister: "Spisovná, hravá a zvukomalebná slovenčina",
      heroName: "Kvák",
      sideName: "Perla",
      heroDescription:
        "Veselé zelené žabiatko so škvrnitou kožou a obrovskými zlatými očami. Má najsilnejší hlas pri rybníku a myslí si, že najlepšia pieseň je tá najhlasnejšia.",
      sideDescription:
        "Elegantná vážka s dúhovými krídelkami ako sklíčka. Tancuje potichu, vníma každý šum trstiny a vie, kedy je ticho krajšie než tón.",
      environment:
        "Zrkadlový rybník pri zlatej hodine s leknovými pódiami, trstinou, hlavatými vŕbami a hladinou, ktorá odráža každý oblak.",
      plot:
        "Kvák chce na večernom koncerte zaspievať sólo tak nahlas, aby ho počul celý les, no svojím kvakáním prehlušuje všetky ostatné hlasy rybníka.",
      moral:
        "Najkrajšia pieseň vznikne vtedy, keď si navzájom načúvame a necháme zaznieť aj tichšie hlasy.",
      duration: 10,
      aspectRatio: "16:9",
    },
  },
  {
    id: "attic",
    name: "Lampášová povala",
    tagline: "Medvedík sa bojí tmy, nočný motýľ mu ukazuje jej hviezdy.",
    image: "/images/world-attic.svg",
    ageTag: "4 - 6 rokov",
    moralTag: "Tma nie je strašiak",
    draft: {
      title: "Hugo a nočné svetielko",
      audienceAge: "4 - 6 rokov",
      languageRegister: "Spisovná, hravá a zvukomalebná slovenčina",
      heroName: "Hugo",
      sideName: "Zora",
      heroDescription:
        "Plyšový medvedík s medovo hnedým kožúškom, jedným trošku ovisnutým uchom, horčicovým pleteným šálikom a veľkými teplými očami ako gombíky. Miluje svoju lampu a tmy sa bojí.",
      sideDescription:
        "Nočný motýľ so striebristo modrými krídelkami, ktoré jemne svietia. Pozná každú hviezdu povaly a nebojí sa tmy, lebo vie, čo v nej žiari.",
      environment:
        "Útulná drevená povala s vôňou starých kníh, mosadznou lampou, papierovými hviezdami na špagátiku, pletenými dekami a mesačným lúčom z okrúhleho okna.",
      plot:
        "Keď mosadzná lampa zhasne, Hugo musí prejsť tmavou povalou pre novú sviečku a zisťuje, že tma skrýva viac svetielok, než si myslel.",
      moral:
        "Tma nie je strašiak. Keď sme pri sebe, aj v nej nájdeme malé svetielka odvahy.",
      duration: 9,
      aspectRatio: "16:9",
    },
  },
];

export function worldImageFor(
  draft: Pick<ProjectDraft, "title" | "heroName" | "environment">,
) {
  const title = draft.title.trim().toLocaleLowerCase("sk");
  const hero = draft.heroName.trim().toLocaleLowerCase("sk");
  const environment = draft.environment.trim().toLocaleLowerCase("sk");

  const byTitle = worldPresets.find((preset) => preset.draft.title.toLocaleLowerCase("sk") === title);
  if (byTitle) return byTitle.image;

  const byHero = worldPresets.find(
    (preset) => hero.length > 0 && preset.draft.heroName.toLocaleLowerCase("sk") === hero,
  );
  if (byHero) return byHero.image;

  const byEnvironment = worldPresets.find((preset) => {
    const firstClause = preset.draft.environment.split(/[,.!?;]/)[0].trim().toLocaleLowerCase("sk");
    return firstClause.length > 0 && environment.startsWith(firstClause);
  });
  if (byEnvironment) return byEnvironment.image;

  return worldPresets[0].image;
}

export function worldCaptionFor(draft: Pick<ProjectDraft, "title" | "heroName" | "environment">) {
  const image = worldImageFor(draft);
  const preset = worldPresets.find((item) => item.image === image) ?? worldPresets[0];
  return preset.name;
}

export function conceptStorySignal(draft: ProjectDraft, concept: StoryConcept) {
  const hero = draft.heroName.trim() || "Hrdina";
  const friend = draft.sideName.trim() || "Kamarát";
  const title = concept.title.trim() || `${hero} a ${friend}`;
  const hook = concept.hook.trim() || "Cesta sa zmení, keď sa hrdina odváži počúvať druhých.";
  const externalWant = concept.externalWant.trim() || draft.plot.trim() || `${hero} hľadá cestu k svojmu cieľu.`;
  const internalNeed = concept.internalNeed.trim() || draft.moral.trim() || "Väčšie vysvetlenie prichádza cez pomoc a dôveru.";
  const tone = concept.tone.trim() || "Odvaha a priateľstvo";
  const spine = `${title}: ${hook}`;
  const relationship = `${hero} a ${friend} tvoria jadro príbehu: každý krok je silnejší, keď sa spoliehajú na seba, a každé rozhodnutie nesie ${tone.toLowerCase()} v centre deja.`;

  return {
    title,
    hook,
    externalWant,
    internalNeed,
    tone,
    spine,
    relationship,
  };
}

const beatLabels: StoryBeatLabel[] = [
  "Kde bolo, tam bolo...",
  "Každý deň...",
  "Až jedného dňa...",
  "A preto...",
  "A preto...",
  "Až nakoniec...",
  "A odvtedy...",
];

export function generateStoryConcepts(draft: ProjectDraft): StoryConcept[] {
  const hero = draft.heroName.trim() || "Hrdina";
  const friend = draft.sideName.trim() || "Kamarát";
  const place = (draft.environment.split(/[,.!?;]/)[0] || "Zelený les")
    .trim()
    .split(/\s+/)
    .slice(0, 6)
    .join(" ");
  const externalWant = draft.plot.trim() || `${hero} chce dosiahnuť svoj cieľ.`;
  const moral = draft.moral.trim() || "Priateľstvo a vzájomná pomoc rozjasnia aj ťažký deň.";
  const moralThread = moral.replace(/[.!?]+\s*$/, "");
  const audienceFlavor = draft.audienceAge.toLowerCase().includes("7") || draft.audienceAge.toLowerCase().includes("9")
    ? "pre deti, ktoré už vedia rozlíšiť malú trpezlivosť od veľkého odhodlania"
    : "pre deti, ktoré sa radi učia na malých krokoch a v bratstve s kamarátom";
  const opening = `Na mieste zvanom „${place}“ žije ${hero}. ${draft.heroDescription.trim()} Nablízku je ${friend}: ${draft.sideDescription.trim()}`;
  const motif = `${draft.title}|${hero}|${friend}|${place}|${draft.environment}|${moralThread}|${audienceFlavor}`;
  const variationSeed = motif.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);

  const archetypes = [
    {
      title: `${hero} a most z kvapiek`,
      hook: "Klzká skratka sa zmení na cestu, ktorú treba prejsť spolu.",
      internalNeed: "Odvážiť sa poprosiť o pomoc namiesto predstierania, že všetko zvládne sám.",
      tone: "Odvaha a spolupráca",
      daily: `${hero} sa ponáhľa za svojím cieľom, kým ${friend} pokojne hľadá bezpečnú cestu.`,
      incident: `Po nočnom daždi sa jediný chodníček k cieľu zmení na klzký most z veľkých listov.`,
      obstacle: `${hero} sa rozbehne sám, pošmykne sa a pristane na mäkkej kope voňavého machu.`,
      crisis: `Prúdik odnáša poslednú stopu a večer sa blíži. ${hero} sa bojí priznať, že cestu nepozná.`,
      climax: `${hero} poprosí ${friend} o pomoc. Spoločne ukladajú listy tak, aby po nich bezpečne prešli obaja.`,
      ending: `${hero} a ${friend} dorazia k cieľu bok po boku. ${hero} už vie, že požiadať o pomoc je odvážny krok. ${moral}`,
    },
    {
      title: `${hero} a šepot pod listami`,
      hook: "Najdôležitejšia stopa je taká tichá, že ju počuť iba v pokoji.",
      internalNeed: "Spomaliť a vypočuť si druhého, aj keď sa zdá, že treba utekať.",
      tone: "Vnímavosť a pokoj",
      daily: `${hero} sleduje iba veľké a nápadné značky. ${friend} si všíma každý šuchot a každú kvapku rosy.`,
      incident: `Zrazu sa ozve tichučké cinknutie spoza najväčšieho listu a známe značky zmiznú z dohľadu.`,
      obstacle: `${hero} beží za hlasnou ozvenou, ktorá ho zavedie k prázdnemu pňu.`,
      crisis: `Ozvena stíchne a posledná svetelná stopa sa stratí. ${friend} sa pokúša niečo povedať, no ${hero} ho stále nepočuje.`,
      climax: `${hero} zastane, stíši dych a vypočuje si ${friend}. Tichý šepot ich navedie k správnej ceste.`,
      ending: `${hero} sa odteraz pýta aj počúva. Spolu s ${friend} nájde cieľ bez zbytočného zhonu. ${moral}`,
    },
    {
      title: `${hero} a koleso šišiek`,
      hook: "Čím rýchlejšie sa hrdina ponáhľa, tým viac šišiek sa rozkotúľa.",
      internalNeed: "Pochopiť, že trpezlivosť a spoločný plán sú užitočnejšie než zhon.",
      tone: "Hravosť a trpezlivosť",
      daily: `${hero} chce mať všetko hotové skôr, než sa les celkom prebudí. ${friend} radšej pozorne premýšľa.`,
      incident: `Cez chodníček sa rozkotúľa hŕba šišiek a zakryje značky vedúce k cieľu.`,
      obstacle: `${hero} sa pokúsi šišky odhádzať naraz. Tie sa veselo skotúľajú späť a vytvoria šiškový vláčik.`,
      crisis: `Čas sa míňa a značky sú stále schované. ${hero} chce odbehnúť, no tým by sa šišky rozsypali ešte ďalej.`,
      climax: `${hero} sa zastaví. S ${friend} si rozdelia úlohy, šišky ukladajú jednu po druhej a objavia stratenú značku.`,
      ending: `${hero} zistí, že pokojný spoločný plán ich dovedie ďalej než rýchly zhon. ${friend} sa usmeje a les sa rozsvieti. ${moral}`,
    },
    {
      title: `${hero} a poprehadzované značky`,
      hook: "Malá chyba narastie, kým sa ju hrdina neodváži priznať.",
      internalNeed: "Priznať vlastnú chybu a napraviť ju s pomocou kamaráta.",
      tone: "Úprimnosť a dôvera",
      daily: `${hero} si je istý, že najlepšie riešenie nájde iba sám. ${friend} mu ponúka pomoc, no ${hero} ju odmieta.`,
      incident: `${hero} potajomky presunie jednu smerovú značku, aby si skrátil cestu k svojmu cieľu.`,
      obstacle: `Vietor zatočí ďalšími značkami a obaja kamaráti vykročia opačným smerom.`,
      crisis: `${hero} spozná svoju značku, ale hanbí sa povedať, čo sa stalo. Cesta je čoraz zamotanejšia.`,
      climax: `${hero} sa prizná ${friend}. Spoločne vrátia značky na miesto a vytvoria jednoduchý plán, ktorému obaja rozumejú.`,
      ending: `${hero} zistí, že pravda pomáha napraviť aj zamotaný chodníček. ${friend} mu znovu dôveruje a cesta je jasná. ${moral}`,
    },
    {
      title: `${hero} a svetlo pre dvoch`,
      hook: "Hrdina si môže vybrať medzi rýchlym víťazstvom a kamarátom, ktorý potrebuje pomoc.",
      internalNeed: "Podeliť sa o úspech a dať priateľstvo pred vlastnú slávu.",
      tone: "Veľkorysosť a priateľstvo",
      daily: `${hero} sníva o tom, že cieľ dosiahne ako prvý. ${friend} sa teší z každej spoločnej chvíle.`,
      incident: `V diaľke sa ukáže cesta k cieľu a ${hero} ju vyrazí nasledovať rýchlejšie než ktokoľvek iný.`,
      obstacle: `${hero} predbehne značky aj ${friend}, potom zistí, že pri rázcestí nevie, ktorým smerom pokračovať.`,
      crisis: `Cieľ je na dohľad, ale ${friend} zostal za hustým závojom papradí. Víťazstvo osamote už neznie veselo.`,
      climax: `${hero} sa vráti po ${friend}. Spoločne rozdelia svetlo na dve malé žiary, ktoré ukážu cestu obom.`,
      ending: `${hero} už nechce byť prvý za každú cenu. S ${friend} oslavujú spoločný cieľ a vedia, že radosť rastie, keď sa o ňu podelia. ${moral}`,
    },
  ];

  const rotated = archetypes.map((entry, index) => {
    const jitter = (variationSeed + index * 17) % 3;
    const title = [entry.title, `${hero} a ${place}`, `${friend} a ${place}`, `${hero} a ${friend} v ${place}`][(index + jitter) % 4];
    const hook = [
      entry.hook,
      `${hero} zistí, že cesta k cieľu je kratšia, keď sa delí s ${friend}.`,
      `${friend} upozorní na vec, ktorú ${hero} doteraz nevidel.`,
      `${hero} sa rozhodne zmeniť rýchly beh za trpezlivý plán. ${moralThread.toLowerCase()} je tu kľúčom k radosťi z cesty.`,
    ][(index + jitter) % 4];

    return {
      ...entry,
      title,
      hook: `${hook} ${audienceFlavor}.`,
    };
  });

  return rotated.map((outline, index) => ({
    id: index + 1,
    title: outline.title,
    hook: outline.hook,
    externalWant,
    internalNeed: outline.internalNeed,
    tone: outline.tone,
    beats: [
      { label: beatLabels[0], text: `${opening} ${hero} si kladie za cieľ: ${externalWant}` },
      { label: beatLabels[1], text: outline.daily },
      { label: beatLabels[2], text: outline.incident },
      { label: beatLabels[3], text: outline.obstacle },
      { label: beatLabels[4], text: outline.crisis },
      { label: beatLabels[5], text: outline.climax },
      { label: beatLabels[6], text: outline.ending },
    ],
  }));
}

export function generateSongPackage(draft: ProjectDraft, concept: StoryConcept): SongPackage {
  const world = (draft.environment.split(/[,.!?;]/)[0] || "Čarovný les")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .join(" ");

  return {
    conceptId: concept.id,
    opening: {
      title: "Iskra, ukáž cestu",
      lyrics: [
        `Vo svete „${world}“ rozlieva sa jas,`,
        `${draft.heroName} aj ${draft.sideName} vykročia včas.`,
        "Kvapky sa trblietajú na každom liste,",
        "spoločný krok vedie k cieľu iste.",
        "Keď malá iskrička skryje sa zas,",
        "kamarátska pomoc nájde jej jas.",
        "Hop, hop, hop, nech sa rozospieva háj,",
        "s dobrým kamarátom je svet ako raj.",
      ],
      stylePrompt:
        "Upbeat, whimsical orchestral children's anthem, glockenspiel, bright acoustic guitar, playful brass, warm children's choir, lively 112 BPM, major key, clear native Slovak diction, forty-second opening theme, bright forest-morning mood, memorable refrain, gentle dynamics.",
    },
    closing: {
      title: "Priateľstvo rozsvieti deň",
      lyrics: [
        "Ak sa nám cestička stratí za hmlou,",
        "nájdeme cestu s priateľom spolu.",
        `${draft.heroName} zaváha, ${draft.sideName} je nablízku,`,
        "spolu si všimnú aj najmenšiu iskru.",
        "O pomoc poprosiť je odvážny krok,",
        "spoločne zvládneme aj veľký skok.",
        "Dlaň pri dlani, srdce v srdci zas,",
        "priateľstvo rozžiari každý náš čas.",
      ],
      stylePrompt:
        "Celebratory folk-orchestral children's closing song, warm accordion, cheerful handclaps, swelling strings, gentle woodwinds, bright major key, native Slovak vocal delivery, forty-five-second end-credits song, heartfelt friendship theme, triumphant final chord, clear gentle mix.",
    },
  };
}

export function buildSongPrompt(
  track: SongTrack,
  draft: ProjectDraft,
  role: "opening" | "closing",
  concept: StoryConcept,
) {
  const timeline = runtimeTimeline(draft.duration);
  const duration = role === "opening"
    ? `${timeline[0].durationSeconds}-second opening theme`
    : `${timeline[timeline.length - 1].durationSeconds}-second closing credits song`;
  const direction = role === "opening"
    ? "Introduce the story world, the two contrasting friends, and their first spark of wonder."
    : "Celebrate courage, kindness, asking for help, and friendship after the story's resolution.";
  const lyricLines = track.lyrics.map((line, index) => `${index + 1}. ${line}`).join("\n");

  return [
    `Create a ${duration} for a warm animated children's film titled "${draft.title}".`,
    direction,
    `Selected story spine: ${concept.title}. External want: ${concept.externalWant} Internal need: ${concept.internalNeed}`,
    `Character anchors: [CHAR_HERO] ${draft.heroName}, ${draft.heroDescription} [CHAR_SIDE] ${draft.sideName}, ${draft.sideDescription}. Environment anchor: [ENV_WORLD] ${draft.environment}.`,
    `Music style: ${track.stylePrompt}`,
    "Sing only the following eight lyric lines in Slovak. Keep every line in order, use clear native Slovak pronunciation, and do not add, repeat, translate, or improvise any words:",
    lyricLines,
    "Negative constraints: no English lyrics, no spoken dialogue, no extra verses, no improvised vocal ad-libs, no harsh percussion, no heavy rock guitars, no ominous mood, no sudden beat drop.",
  ].join("\n\n");
}

export function screenplayWordCount(screenplay: ScreenplayPackage) {
  const visibleText = screenplay.scenes
    .map((scene) => `${scene.action} ${scene.dialogue}`)
    .join(" ")
    .replace(/<[^>]+>/g, " ");
  let count = 0;
  let insideWord = false;
  let insidePerformanceTag = false;

  for (const character of visibleText) {
    if (character === "[") {
      insidePerformanceTag = true;
      insideWord = false;
      continue;
    }
    if (character === "]") {
      insidePerformanceTag = false;
      insideWord = false;
      continue;
    }
    if (insidePerformanceTag) continue;

    const isWordCharacter = /[A-Za-zÀ-ž0-9]/.test(character);
    if (isWordCharacter && !insideWord) count += 1;
    insideWord = isWordCharacter;
  }

  return count;
}

export function screenplayTimeEstimate(wordCount: number) {
  const seconds = Math.round((wordCount / 125) * 60);
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export function generateScreenplay(
  draft: ProjectDraft,
  concept: StoryConcept,
  songs: SongPackage,
): ScreenplayPackage {
  const hero = draft.heroName.trim() || "Hrdina";
  const friend = draft.sideName.trim() || "Kamarát";
  const place = draft.environment.split(/[.!?;]/)[0].trim();
  const signal = conceptStorySignal(draft, concept);
  const lesson = signal.internalNeed;
  const goal = signal.externalWant;
  const tone = signal.tone;
  const spine = signal.spine;
  const NL = String.fromCharCode(10);
  const beat = (index: number) => concept.beats[index]?.text ?? "Kamaráti pokračujú k svojmu cieľu.";
  const scenes: Omit<ScreenplayScene, "durationSeconds">[] = [
    {
      id: "opening-song",
      act: "Úvodná znelka",
      heading: `ISKRA, UKÁŽ CESTU: ${songs.opening.title.toLocaleUpperCase("sk")}`,
      action: `Ranné svetlo sa prebúdza v krajine ${place}. Kvapky rosy sa zalesknú na konároch. Úvodná pieseň predstaví ${hero}, ${friend} aj ich spoločný svet, zatiaľ čo ${spine} otvára hlavné tajomstvo príbehu. Motív ${tone.toLowerCase()} vnáša do celého príbehu teplý, zrozumiteľný šarm. ${signal.relationship}`,
      dialogue: `SPEV [veselo]:\n${songs.opening.lyrics.join("\n")}`,
      foley: "[ŠUŠŤANIE] [CINKOT]",
    },
    {
      id: "forest-introduction",
      act: "Akt I",
      heading: "KDE SA PRÍBEH ZAČÍNA",
      action: `V krajine ${place} žije ${hero}. ${draft.heroDescription} Nablízku je ${friend}. ${draft.sideDescription} Rozprávkový les dýcha mäkkým svetlom a každý lístok ukrýva malé tajomstvo. ${goal} je v pozadí, no ${spine} zároveň ukazuje, čo je skutočne dôležité: ${lesson}. ${signal.relationship}`,
      dialogue: `ROZPRÁVAČ [teplý hlas]: V tomto kraji sa aj najmenšia iskrička môže stať veľkým dobrodružstvom.\n${hero} [nadšene]: Dnes určite nájdem to, čo hľadám!\n${friend} [pokojne]: Najprv sa pozrime, čo nám hovorí cesta.`,
      foley: "[ŠUŠŤANIE] [KVAP]",
    },
    {
      id: "daily-wish",
      act: "Akt I",
      heading: "TÚŽBA A KAŽDODENNÝ ZVYK",
      action: `${beat(0)} ${hero} sa sústreďuje na cieľ a prehliada drobné znamenia. ${friend} kráča pomaly, pozorne sleduje okolie a ponúka pomoc, ktorú ${hero} zatiaľ nechce prijať. Tichý motív príbehu sa už začína tvarovať: ${lesson}.`,
      dialogue: `ROZPRÁVAČ [pokojne]: Každý deň sa ${hero} ponáhľal za svojou túžbou.\n${hero} [rozhodne]: ${goal}.\n${friend} [láskavo]: Budem tu, keď ma budeš potrebovať.`,
      foley: "[KROKY V MACHI]",
    },
    {
      id: "inciting-incident",
      act: "Akt I",
      heading: "UDALOSŤ, KTORÁ VŠETKO ZMENÍ",
      action: `${beat(2)} Svet sa na chvíľu zmení. Známu cestu zakryje nový tieň a drobná stopa sa stratí medzi listami. ${hero} zistí, že pôvodný plán už nestačí.`,
      dialogue: `ROZPRÁVAČ [s napätím]: Až jedného dňa sa objavilo niečo nečakané.\n${hero} [prekvapene] <break time="400ms"/>: Kde je moja značka?\n${friend} [šepká]: Počkaj. Počujem niečo spoza paprade.`,
      foley: "[FÚK] [ŠUŠŤANIE]",
    },
    {
      id: "first-obstacle",
      act: "Akt II-A",
      heading: "PRVÝ POKUS",
      action: `${beat(3)} ${hero} skúša prvú skratku, no chodníček sa zúži. Mäkký mach pošmykne labku a listy sa rozletia ako zelené pierka. Nič sa nestane, iba plán vyzerá trochu smiešne.`,
      dialogue: `${hero} [lapá po dychu]: Uf! Táto skratka bola dlhšia, než som čakal.\n${friend} [smeje sa]: Aspoň už poznáme každú šišku naokolo.\n${hero} [rozpačito]: Nabudúce sa spýtam skôr.`,
      foley: "[ŽUCH] [ŠUŠŤANIE]",
    },
    {
      id: "comic-detour",
      act: "Akt II-A",
      heading: "SMIEŠNA ZÁKRUTA",
      action: `Dvojica obíde široký koreň. ${hero} vykročí rýchlo, no konár sa jemne skloní a položí mu na hlavu veľký list. ${friend} ukáže na list a obaja sa zasmejú.`,
      dialogue: `ROZPRÁVAČ [s úsmevom]: Les si pre nich pripravil zelenú čiapku.\n${hero} [smeje sa]: Aspoň ma slnko nepošteklí do nosa!\n${friend} [veselo]: A teraz pomaly, krok za krokom.`,
      foley: "[VRŔZG] [ŽUCH]",
    },
    {
      id: "small-clue",
      act: "Akt II-A",
      heading: "DROBNÁ STOPA",
      action: `${friend} si všimne záblesk na spodnej strane listu. Je maličký, ale ukazuje smer. ${hero} zastane, prvý raz sa pozrie tam, kam ukazuje kamarát, a spolu nájdu bezpečný chodníček.`,
      dialogue: `${friend} [pokojne]: Pozri, svetlo sa odráža práve odtiaľ.\n${hero} [prekvapene]: Máš pravdu. Ako si si to všimol?\n${friend} [láskavo]: Spomalil som a dobre som sa pozeral.`,
      foley: "[CINKOT] [KROKY V MACHI]",
    },
    {
      id: "pressure-builds",
      act: "Akt II-B",
      heading: "KEĎ SA PLÁN ZAČNE ZAMOTÁVAŤ",
      action: `Cesta sa rozvetví a stopy sa prepletú. ${hero} chce znovu vykročiť bez rozmýšľania, no vietor obráti značku. ${friend} sa drží pokoja, ale obaja cítia, že času ubúda.`,
      dialogue: `ROZPRÁVAČ [vážne, no nežne]: Čím viac sa ponáhľali, tým ťažšie bolo rozpoznať správny smer.\n${hero} [netrpezlivo]: Skúsime všetky tri cesty naraz!\n${friend} [pokojne]: Jedna dobrá stopa nám stačí.`,
      foley: "[FÚK] [LÍSTIE]",
    },
    {
      id: "hero-mistake",
      act: "Akt II-B",
      heading: "NAJVÄČŠIA CHYBA",
      action: `${hero} urobí rozhodnutie, ktoré kamarátovi nepovie. Značky sa poprehadzujú a obaja sa vydajú opačným smerom. Keď sa opäť stretnú, posledná známa stopa už nie je na svojom mieste.`,
      dialogue: `${friend} [trasľavý hlas]: Myslel som, že ideme spolu.\n${hero} [potichu]: Chcel som si cestu skrátiť. To ja som zmenil značku.\nROZPRÁVAČ [teplo]: Pravda sa vyslovovala ťažko, ale pomohla im zastaviť ďalšie blúdenie.`,
      foley: "[ŠUŠŤANIE] [PAUZA]",
    },
    {
      id: "all-is-lost",
      act: "Akt II-B",
      heading: "CHVÍĽA, KEĎ SA ZDÁ, ŽE JE KONIEC",
      action: `${beat(4)} Posledná stopa zhasne za hustými listami. ${hero} sklopí hlavu. ${friend} neodíde, iba zostane nablízku a dopraje mu chvíľu na pokojný nádych.`,
      dialogue: `${hero} [šepká]: Bez tej iskry to nedokážem.\n${friend} [nežne]: Nemusíš na to byť sám.\n${hero} [pauza: 1.0s]: Prepáč. Mal som ťa počúvať.`,
      foley: "[TICHO] [FÚK]",
    },
    {
      id: "quiet-realisation",
      act: "Akt II-B",
      heading: "TICHÁ MYŠLIENKA",
      action: `V mäkkom machu sa zaleskne obyčajná kvapka rosy. ${hero} si spomenie na drobné znamenia, ktoré predtým prehliadal. ${friend} mu neponúkne hotovú odpoveď, iba trpezlivé miesto vedľa seba.`,
      dialogue: `ROZPRÁVAČ [pokojne]: V tichu sa niekedy ukáže cesta, ktorú hluk zakrýval.\n${hero} [zamyslene]: Keď sa pozrieme obaja, uvidíme viac.\n${friend} [s úsmevom]: Tak sa na to pozrime spolu.`,
      foley: "[KVAP] [TICHÝ ZVONČEK]",
    },
    {
      id: "new-plan",
      act: "Akt III",
      heading: "NOVÝ PLÁN",
      action: `${hero} sa rozhodne napraviť chybu a požiadať o pomoc. ${friend} navrhne rozdeliť úlohy podľa toho, čo si každý všimne najlepšie. Spoločne vykročia bez zhonu.`,
      dialogue: `${hero} [odhodlane]: Pomôžeš mi nájsť správny smer?\n${friend} [veselo]: Rád. Ty sleduj svetlo, ja budem počúvať.\nROZPRÁVAČ [s nádejou]: Tentoraz ich viedol spoločný plán.`,
      foley: "[KROKY] [ŠUŠŤANIE]",
    },
    {
      id: "teamwork-climax",
      act: "Akt III",
      heading: "SPOLOČNÉ VYVRCHOLENIE",
      action: `${beat(5)} Značky vedú k poslednej zákrute. ${hero} vyčká, kým ${friend} overí tichý tón, a potom spolu poskladajú drobné listy do bezpečnej cesty.`,
      dialogue: `${friend} [šepká]: Teraz. Počul som cinknutie zľava.\n${hero} [nadšene]: Vidím odlesk! Držme sa spolu.\nROZPRÁVAČ [radostne]: Každý pridal to, čo vedel najlepšie.`,
      foley: "[CINKOT] [FÚK] [ŠUŠŤANIE]",
    },
    {
      id: "resolution",
      act: "Záver a ponaučenie",
      heading: "NOVÝ DEŇ, NOVÝ ZVYK",
      action: `${beat(6)} Svetlo sa vráti na svoje miesto. ${hero} poďakuje ${friend} a ponúkne mu, aby spoločne vybrali ďalšiu cestu. Les sa naplní teplým večerným jasom. ${lesson} sa odteraz stáva pravidlom aj v malých rozhodnutiach.`,
      dialogue: `${hero} [s úľavou]: Spolu sme našli viac než iba iskru.\n${friend} [veselo]: Našli sme aj dobrú cestu späť.\nROZPRÁVAČ [teplo]: A každý vedel, že nabudúce si najprv vypočujú jeden druhého.`,
      foley: "[ZVONENIE] [ŠUŠŤANIE]",
    },
    {
      id: "closing-song",
      act: "Záverečná pieseň",
      heading: `PRIATELSTVO ROZSVIETI DEŇ: ${songs.closing.title.toLocaleUpperCase("sk")}`,
      action: `Večerné svetlo sa rozleje po krajine ${place}. ${hero} a ${friend} kráčajú vedľa seba, zatiaľ čo záverečná pieseň nesie posolstvo príbehu.`,
      dialogue: `SPEV [vrúcne]:\n${songs.closing.lyrics.join("\n")}`,
      foley: "[TICHÝ SPEV VTÁKOV] [DOZVUK]",
    },
  ];

  const expansionLines = [
    "Drobné kvapky rosy sa zachvejú na listoch a odrazia svetlo do mäkkej zelenej trávy.",
    `${hero} sa na okamih zastaví a všíma si, čo sa deje tesne pri chodníku.`,
    `${friend} si pokojne obzrie okolie a zachytí malý znak pri najbližšom koreni.`,
    "Tichý vietor hladí vrcholky papradí a odnáša vôňu mokrej zeme ponad chodníček.",
    "Svetielka sa odrážajú na kvapkách rosy, akoby les žmurkal na svojich kamarátov.",
    "Každý krok zanechá v machu drobnú jamku, ktorá sa pomaly vráti do pôvodného tvaru.",
    "Rosa stečie po liste a ticho cinkne o kamienok, presne ako malý zvonček.",
    `${hero} sa nadýchne, spočíta si pokojné údery srdca a znova sa pozrie na cestu.`,
    `${friend} sa pohybuje pomaly, no jeho pozorné oči zachytia aj najjemnejší záblesk.`,
    "Za kmeňom sa zablysne mäkké svetlo a na chvíľu zafarbí chodník do zlata.",
    "List sa zatočí vo vzduchu, pristane na nose a vyvolá tichý, prekvapený smiech.",
    "Korene vytvoria nízky mostík a kamaráti sa cez neho prehupnú celkom bezpečne.",
    `${hero} položí labku na mach, aby zistil, či sa pod ňou neskrýva ďalšia značka.`,
    `${friend} chvíľu počúva, kým sa ozvena stratí a z diaľky sa neozve jasný tón.`,
    "Slnko sa oprie o brezovú kôru a nakreslí na ňu dlhé, teplé pásiky.",
    "Drobné semienko sa zachveje, pomaly sa roztočí a ukáže smer k ďalšiemu chodníčku.",
    "Kamaráti si vymenia pohľad, v ktorom sa mieša neistota, nádej aj tichá odvaha.",
    `${hero} sa pousmeje a pripomenie si, že nemusí poznať odpoveď na každú otázku hneď.`,
    `${friend} dopraje chvíľu ticha, aby sa aj najmenší zvuk mohol zmeniť na stopu.`,
    "Ich tiene sa na okamih stretnú na chodníku a potom sa natiahnu k cieľu.",
    "Vietor odfúkne prach z listu a odhalí na ňom tenkú zlatú čiarku.",
    "Na mäkkom machu sa objavia dve stopy, jedna drobná a druhá ešte drobnejšia.",
    `${hero} sa pozrie na kamaráta a neuhne pohľadom, keď príde chvíľa niečo priznať.`,
    `${friend} prikývne a rozdelí prácu na malé kroky, ktoré zvládnu obaja.`,
    "Z diaľky sa ozve jemné šumenie a kamaráti zistia, že ticho ukazuje smer.",
    "Lístky na konári sa zachvejú ako malé ruky, ktoré im potichu ukazujú cestu.",
    `${hero} začne pomáhať, nie preto, že musí, ale preto, že mu na kamarátovi záleží.`,
    "Drobné semienka tancujú vo vzduchu a v ich svetle sa kamaráti ľahšie nájdu.",
    "Každý sa na chvíľu zastaví, aby skontroloval, či na nikoho nezabudli.",
    "Zlatá žiara sa rozleje po lese, ale najviac svieti úsmev na oboch tvárach.",
    "Priateľský krok vedľa priateľského kroku je istejší než ten najrýchlejší beh.",
    `${hero} počká, kým ${friend} dobehne, a spolu vykročia do ďalšej zákruty.`,
    "Kamarátova malá rada otvorí cestu, ktorú si predtým ani nevšimli.",
    "Mach sa pod nimi vlní ako mäkká perina, keď sa znovu vydajú za iskrou.",
    "Na lístku sa zachytí rosa a rozžiari ho na jediný kratučký okamih.",
    `${hero} si všimne, že aj malá pomoc dokáže zmeniť celý ich deň.`,
    `${friend} usporiada drobné predmety tak, aby si každý našiel svoje správne miesto.`,
    "Spoločne si zaspomínajú na chvíľu, keď sa im plán po prvý raz začal zamotávať.",
    `${hero} sa nadýchne a usmeje, hoci výsledok ešte stále nie je celkom istý.`,
    "Mäkké svetlo sa dotkne kožúškov, ulity aj špičiek listov v ich okolí.",
    "Kvapka rosy sa skotúľa po liste a za ňou sa zablysne ďalšia drobná stopa.",
    `${friend} sa otočí, aby sa uistil, že ${hero} kráča naozaj vedľa neho.`,
    "Les na okamih stíchne a potom sa ozve jemný tón, ktorý obom pripomenie správny smer.",
    `${hero} si tentoraz vypočuje celú radu a až potom sa rozhodne, kadiaľ vykročí.`,
    "Pár drobných lístkov sa zatočí okolo nich a pomaly dopadne na mäkkú zem.",
    "Slnko sa skryje za konár, no v korunách zostane dosť svetla na ďalší krok.",
    `${friend} ukáže na miesto, kde sa prekrývajú dve stopy a vytvárajú spoločný obraz.`,
    `${hero} sa usmeje, keď zistí, že pokojné tempo môže byť aj veľmi odvážne.`,
    "Vôňa lesa sa mieša s večerným vzduchom a cesta už nepôsobí taká veľká.",
  ];

  const target = wordBudget(draft.duration);
  let packageDraft: ScreenplayPackage = {
    conceptId: concept.id,
    scenes: scenes.map((scene) => ({ ...scene, durationSeconds: 0 })),
    voiceProfiles: [
      { speaker: "Rozprávač", direction: `Teplý, pokojný hlas s jasnou výslovnosťou, jemným úsmevom a citom pre ${tone.toLowerCase()} v celom príbehu.` },
      { speaker: hero, direction: `Zvedavý detský hlas. Začína nedočkavo, postupne zmäkne a získa istotu, keď sa podarí nájsť ${lesson.toLowerCase()}.` },
      { speaker: friend, direction: `Pokojný, vnímavý hlas. Hovorí pomalšie, počúva a vnáša do rozpravy jemnú pomoc, ktorá podporuje ${tone.toLowerCase()}.` },
      { speaker: "Spev", direction: "Jasný detský zbor so zreteľnou spisovnou slovenčinou a sladkým, veselo poctivým tempom." },
    ],
  };

  let count = screenplayWordCount(packageDraft);
  let expansionIndex = 0;

  while (count < target.minimum && expansionIndex < expansionLines.length) {
    const sceneIndex = 1 + (expansionIndex % (packageDraft.scenes.length - 2));
    const scene = packageDraft.scenes[sceneIndex];
    packageDraft = {
      ...packageDraft,
      scenes: packageDraft.scenes.map((item, index) =>
        index === sceneIndex ? { ...item, action: `${item.action}\n${expansionLines[expansionIndex]}` } : item,
      ),
    };
    expansionIndex += 1;
    count = screenplayWordCount(packageDraft);
  }

  // Trim action text back into the tolerance window so long briefs stay saveable.
  let over = count - target.maximum;
  const skippedScenes = new Set<number>();
  let trimGuard = 0;
  while (over > 0 && trimGuard < 600) {
    trimGuard += 1;
    let bestIndex = -1;
    let bestLength = -1;
    let bestNext: string | null = null;

    for (let sceneIdx = 1; sceneIdx < packageDraft.scenes.length - 1; sceneIdx += 1) {
      if (skippedScenes.has(sceneIdx)) continue;
      const scene = packageDraft.scenes[sceneIdx];
      if (scene.action.length <= bestLength) continue;

      const lines = scene.action.split(NL);
      let candidate: string | null = null;
      if (lines.length > 1) {
        candidate = lines.slice(0, -1).join(NL);
      } else {
        const cut = scene.action.match(/^([\s\S]*[.!?])([\s\S]+)$/);
        if (cut && cut[2].trim().length > 0) candidate = cut[1].trimEnd();
      }

      if (candidate === null) {
        skippedScenes.add(sceneIdx);
        continue;
      }
      bestLength = scene.action.length;
      bestIndex = sceneIdx;
      bestNext = candidate;
    }

    if (bestIndex === -1 || bestNext === null) break;
    const trimmedAction = bestNext;
    packageDraft = {
      ...packageDraft,
      scenes: packageDraft.scenes.map((scene, sceneIdx) =>
        sceneIdx === bestIndex ? { ...scene, action: trimmedAction } : scene,
      ),
    };
    count = screenplayWordCount(packageDraft);
    over = count - target.maximum;
  }

  const timeline = runtimeTimeline(draft.duration);
  const openingSeconds = timeline[0].durationSeconds;
  const closingSeconds = timeline[timeline.length - 1].durationSeconds;
  const storySceneCount = packageDraft.scenes.length - 2;
  const availableStorySeconds = draft.duration * 60 - openingSeconds - closingSeconds;
  const storyBaseSeconds = Math.floor(availableStorySeconds / storySceneCount);
  let extraStorySeconds = availableStorySeconds - storyBaseSeconds * storySceneCount;

  packageDraft = {
    ...packageDraft,
    scenes: packageDraft.scenes.map((scene, index) => {
      if (index === 0) return { ...scene, durationSeconds: openingSeconds };
      if (index === packageDraft.scenes.length - 1) return { ...scene, durationSeconds: closingSeconds };
      const extra = extraStorySeconds > 0 ? 1 : 0;
      if (extra) extraStorySeconds -= 1;
      return { ...scene, durationSeconds: storyBaseSeconds + extra };
    }),
  };

  return packageDraft;
}

export type VisualAnchorEntry = {
  token: string;
  label: string;
  definition: string;
};

export type ColorAct = {
  id: string;
  title: string;
  timeRange: string;
  palette: string[];
  lighting: string;
  emotion: string;
};

export type VisualBible = {
  conceptId: number;
  anchors: VisualAnchorEntry[];
  referenceSettings: string;
  acts: ColorAct[];
};

export type SavedVisualBible = {
  id: string;
  projectId: string;
  visualBible: VisualBible;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export function generateVisualBible(draft: ProjectDraft, concept: StoryConcept): VisualBible {
  const hero = draft.heroName.trim() || "Hrdina";
  const friend = draft.sideName.trim() || "Kamarát";
  const world = (draft.environment.split(/[.!?;]/)[0] || "Čarovný les")
    .trim()
    .split(/\s+/)
    .slice(0, 6)
    .join(" ")
    .slice(0, 120);
  const segments = runtimeTimeline(draft.duration);
  const range = (from: number, to: number) => `${segments[from].from} - ${segments[to].to}`;

  return {
    conceptId: concept.id,
    anchors: [
      {
        token: "[CHAR_HERO]",
        label: hero,
        definition: `${hero}: ${draft.heroDescription} Stylized 3D character, soft plush fur with tactile subsurface scattering, large expressive glossy eyes with luminous catchlights, rounded emotional silhouette, signature accessory always visible, warm russet and cream color family.`,
      },
      {
        token: "[CHAR_SIDE]",
        label: friend,
        definition: `${friend}: ${draft.sideDescription} Stylized 3D companion, contrasting calm proportions, smooth matte materials against the hero's fluffy texture, smaller grounded silhouette, teal and gold color family, gentle readable facial shapes.`,
      },
      {
        token: "[ENV_WORLD]",
        label: world,
        definition: `${world}: ${draft.environment} Miniature macro scale, velvety moss carpets, dew droplets with refractive highlights, layered ferns and birch bark textures, volumetric morning light shafts, floating luminous seed particles, atmospheric depth with creamy bokeh.`,
      },
    ],
    referenceSettings: "--cref [HERO_IMAGE_URL] --cw 80",
    acts: [
      {
        id: "act-one",
        title: "Akt I: Teplé ráno",
        timeRange: range(1, 1),
        palette: ["#F6D9A8", "#EFB366", "#A8C686", "#F4EFE3"],
        lighting: "Warm morning pastels, golden amber rim light, low-contrast diffuse shadows.",
        emotion: "Pokoj, zvedavosť a prvá túžba hrdinu.",
      },
      {
        id: "act-two-a",
        title: "Akt II-A: Hravý deň",
        timeRange: range(2, 2),
        palette: ["#8FCB9B", "#F2C14E", "#5FA8D3", "#FFF6E5"],
        lighting: "Bright saturated daylight, playful primary color pops, crisp sunbeams.",
        emotion: "Energia, situačný humor a objavovanie.",
      },
      {
        id: "act-two-b",
        title: "Akt II-B: Chladná hmla",
        timeRange: range(3, 3),
        palette: ["#5C6B7A", "#8A97A5", "#3E4A57", "#C7D0D8"],
        lighting: "Desaturated slate blue, gloomy cool greys, long dramatic cast shadows, wet fog mist.",
        emotion: "Neistota, chyba a tichá chvíľa na dne.",
      },
      {
        id: "act-three",
        title: "Akt III: Zlatý súmrak",
        timeRange: range(4, 5),
        palette: ["#F2A65A", "#FFD97D", "#7FB069", "#2E4034"],
        lighting: "Sunset golden hour, luminous bioluminescent sparkles, vibrant warm backlight.",
        emotion: "Odvaha, katarzia a spoločná radosť.",
      },
    ],
  };
}

export type CueShot = {
  id: string;
  chunk: number;
  timeIn: string;
  timeOut: string;
  durationSeconds: number;
  camera: string;
  staging: string;
  dialogue: string;
  foley: string;
  ducking: string;
};

export type CueSheet = {
  conceptId: number;
  shots: CueShot[];
};

export type SavedCueSheet = {
  id: string;
  projectId: string;
  cueSheet: CueSheet;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export const cueChunks = [
  { id: 0, title: "Úvodná znelka + Akt I", command: "pokracuj akt 2a" },
  { id: 1, title: "Akt II-A", command: "pokracuj akt 2b" },
  { id: 2, title: "Akt II-B", command: "pokracuj akt 3" },
  { id: 3, title: "Akt III + Záverečná pieseň", command: "hotovo" },
] as const;

const cameraRigs = [
  "Wide Establishing (35mm)",
  "Eye-Level Two-Shot (50mm)",
  "Macro Close-Up (85mm)",
  "Low-Angle Hero Push-in (50mm)",
  "Dynamic Whip-Pan Tracking (35mm)",
];

const stagingBeats = [
  "Hrdina v popredí, svet prostredia dýcha za ním.",
  "Dvojica v spoločnom zábere, kontrast pohybu a pokoja.",
  "Detail očí a rekvizity, odlesk svetla v zrenici.",
  "Kamera stúpa s rozhodnutím hrdinu.",
  "Rýchly prešvih sleduje pohyb medzi rekvizitami.",
  "Mäkký prejazd cez listy do hĺbky scény.",
];

function formatShotTime(tenths: number) {
  const totalSeconds = Math.floor(tenths / 10);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${tenths % 10}`;
}

function splitIntoShots(totalTenths: number) {
  const pattern = [30, 25, 35, 40, 20, 45, 32, 28, 38];
  const durations: number[] = [];
  let remaining = totalTenths;
  let index = 0;

  while (remaining > 0) {
    if (remaining <= 45) {
      durations.push(remaining);
      remaining = 0;
      break;
    }
    let duration = pattern[index % pattern.length];
    const leftover = remaining - duration;
    if (leftover > 0 && leftover < 20) {
      duration = remaining - 20 >= 20 && remaining - 20 <= 45 ? remaining - 20 : 20;
    }
    duration = Math.min(45, Math.max(20, duration));
    durations.push(duration);
    remaining -= duration;
    index += 1;
  }

  return durations;
}

export function generateCueSheet(
  draft: ProjectDraft,
  concept: StoryConcept,
  screenplay: ScreenplayPackage,
): CueSheet {
  const segments = runtimeTimeline(draft.duration);
  const chunkForSegment = (segmentId: string) => {
    if (segmentId === "opening" || segmentId === "act-one") return 0;
    if (segmentId === "act-two-a") return 1;
    if (segmentId === "act-two-b") return 2;
    return 3;
  };
  const actForSegment: Record<string, string> = {
    opening: "Úvodná znelka",
    "act-one": "Akt I",
    "act-two-a": "Akt II-A",
    "act-two-b": "Akt II-B",
    "act-three": "Akt III",
    ending: "Záver a ponaučenie",
    outro: "Záverečná pieseň",
  };

  const shots: CueShot[] = [];
  let cursor = 0;
  let globalIndex = 0;

  for (const segment of segments) {
    const actName = actForSegment[segment.id];
    const scenes = screenplay.scenes.filter((scene) => scene.act === actName);
    const dialogueLines = scenes
      .flatMap((scene) => scene.dialogue.split(String.fromCharCode(10)))
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    const foleyPool = scenes.map((scene) => scene.foley).filter((value) => value.trim().length > 0);
    const actionPool = scenes.map((scene) => scene.action.split(/[.!?]/)[0].trim()).filter(Boolean);
    const durations = splitIntoShots(segment.durationSeconds * 10);

    durations.forEach((duration, shotIndex) => {
      const timeIn = cursor;
      cursor += duration;
      globalIndex += 1;
      const dialogue = dialogueLines.length > 0 ? dialogueLines[shotIndex % dialogueLines.length] : "";
      const foley = foleyPool.length > 0 ? foleyPool[shotIndex % foleyPool.length] : "[ŠUŠŤANIE]";
      const actionBeat = actionPool.length > 0 ? actionPool[shotIndex % actionPool.length] : "Svet príbehu dýcha.";
      const isActionHit = /ŽUCH|VRŔZG|CINKOT/.test(foley);
      const ducking = dialogue
        ? "Hudba -14 dB pod hlasom, Foley -8 dB."
        : isActionHit
          ? "Hudba 0 dB na akčný zásah, potom späť na -6 dB."
          : "Hudba 0 dB, jemný atmosférický podklad.";

      shots.push({
        id: `SH_${String(globalIndex).padStart(3, "0")}`,
        chunk: chunkForSegment(segment.id),
        timeIn: formatShotTime(timeIn),
        timeOut: formatShotTime(cursor),
        durationSeconds: duration / 10,
        camera: cameraRigs[globalIndex % cameraRigs.length],
        staging: `${actionBeat}. ${stagingBeats[globalIndex % stagingBeats.length]}`,
        dialogue,
        foley,
        ducking,
      });
    });
  }

  return { conceptId: concept.id, shots };
}

export const pixarStyleBlock =
  "masterpiece 3D cinematic digital animation in signature modern Pixar Disney studio style, tactile subsurface scattering on stylized skin and soft fur, clay-like softness, large expressive glossy eyes with detailed reflections and luminous catchlights, tactile cloth weave texture, volumetric raytraced lighting with floating ambient dust motes, rich complementary color palette, atmospheric depth of field, creamy smooth bokeh, octane render, 8k resolution.";

export const imageNegativeBlock =
  "negative: 2D drawing, anime, flat illustration, photorealistic human, eerie uncanny valley, gritty horror, plastic sheen, oversaturated neon, text, watermark, signature, deformed fingers, extra limbs, blurry render.";

export type ImagePromptEntry = {
  shotId: string;
  chunk: number;
  actLabel: string;
  timeRange: string;
  prompt: string;
  negative: string;
};

export type ImagePromptPackage = {
  conceptId: number;
  prompts: ImagePromptEntry[];
};

export type SavedImagePrompts = {
  id: string;
  projectId: string;
  imagePrompts: ImagePromptPackage;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export const promptChunks = [
  { id: 0, title: "Akt 1 (Úvod + Akt I)", file: "akt-1" },
  { id: 1, title: "Akt 2A", file: "akt-2a" },
  { id: 2, title: "Akt 2B", file: "akt-2b" },
  { id: 3, title: "Akt 3 + Záver", file: "akt-3" },
] as const;

export function generateImagePrompts(
  draft: ProjectDraft,
  concept: StoryConcept,
  bible: VisualBible,
  cueSheet: CueSheet,
): ImagePromptPackage {
  const NL = String.fromCharCode(10);
  const signal = conceptStorySignal(draft, concept);
  const hero = draft.heroName.trim() || "Hrdina";
  const friend = draft.sideName.trim() || "Kamarát";
  const anchors = bible.anchors.map((anchor) => `${anchor.token} ${anchor.definition}`);

  const prompts = cueSheet.shots.map((shot) => {
    const act = bible.acts[Math.min(shot.chunk, bible.acts.length - 1)];
    const stagingEnglish = shot.staging;
    const conceptCue = `Story spine: "${signal.title}". Hook: ${signal.hook}. Emotional arc: ${signal.internalNeed}. Core relationship: ${hero} and ${friend} move through the scene as a caring duo. Narrative objective: ${signal.externalWant}. Relationship dynamic: ${signal.relationship}`;
    const lines = [
      `Shot ${shot.id}, ${shot.camera}, ${shot.timeIn} - ${shot.timeOut}: ${stagingEnglish} Composition hierarchy: 70% ${hero} character acting in the foreground, 20% interactive props, 10% background atmospheric depth. ${conceptCue}`,
      ...anchors,
      `Lighting per color script (${act.title}, ${act.timeRange}): ${act.lighting} Palette anchors: ${act.palette.join(", ")}. Shallow depth of field matched to the stated focal length. Maintain readability of the hero's silhouette and emotional expression across all shots.`,
      pixarStyleBlock,
      `--ar ${draft.aspectRatio} --stylize 250 ${bible.referenceSettings}`,
    ];

    return {
      shotId: shot.id,
      chunk: shot.chunk,
      actLabel: act.title,
      timeRange: `${shot.timeIn} - ${shot.timeOut}`,
      prompt: lines.join(NL),
      negative: `${imageNegativeBlock} extra faces, duplicated prop, broken anatomy, mismatched character proportions, weak emotional expression, overlit or muddy shadows, empty background, hard-edged poster look, generic stock shot.`,
    };
  });

  return { conceptId: concept.id, prompts };
}

export type MotionProfileId = "A" | "B" | "C";

export type MotionEntry = {
  shotId: string;
  chunk: number;
  profile: MotionProfileId;
  durationSeconds: number;
  camera: string;
  timeRange: string;
  motionPrompt: string;
};

export type MotionPackage = {
  conceptId: number;
  entries: MotionEntry[];
};

export type SavedMotionPackage = {
  id: string;
  projectId: string;
  motionPackage: MotionPackage;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export const motionProfiles: Record<MotionProfileId, {
  title: string;
  range: string;
  min: number;
  max: number;
  logic: string;
}> = {
  A: {
    title: "Herectvo a mikroexpresie",
    range: "2,5 - 3,5 s",
    min: 2.5,
    max: 3.5,
    logic:
      "Subtle breathing cycle, squash and stretch on dialogue or emotional gasp, realistic blink cycle, dynamic eye dart, pupil tracking with catchlight glint, secondary ear/tail bounce, gentle camera parallax.",
  },
  B: {
    title: "Slapstick a rýchla akcia",
    range: "2,0 - 3,0 s",
    min: 2.0,
    max: 3.0,
    logic:
      "Exaggerated wind-up anticipation, snappy directional transition with inertial overshoot, puff of dust, fast tracking camera matching trajectory, follow-through landing.",
  },
  C: {
    title: "Úžas a rozjímanie",
    range: "3,5 - 4,5 s",
    min: 3.5,
    max: 4.5,
    logic:
      "Slow cinematic dolly-in, soft wind ruffling fur or scarf, slow head turn, glowing particle drift, smooth depth of field transition.",
  },
};

export function classifyMotionProfile(shot: CueShot): MotionProfileId {
  const isActionHit = /ŽUCH|VRŔZG/.test(shot.foley) || /Whip-Pan/.test(shot.camera);
  if (shot.durationSeconds >= 3.5) return "C";
  if (shot.durationSeconds < 2.5) return "B";
  if (shot.durationSeconds <= 3.0 && isActionHit) return "B";
  return "A";
}

export function generateMotionPackage(
  draft: ProjectDraft,
  concept: StoryConcept,
  cueSheet: CueSheet,
): MotionPackage {
  const NL = String.fromCharCode(10);
  const hero = draft.heroName.trim() || "Hrdina";
  const friend = draft.sideName.trim() || "Kamarát";
  const signal = conceptStorySignal(draft, concept);

  const entries = cueSheet.shots.map((shot) => {
    const profile = classifyMotionProfile(shot);
    const meta = motionProfiles[profile];
    const motionPrompt = [
      `Shot ${shot.id} | TYPE ${profile}: ${meta.title} | exact duration ${shot.durationSeconds.toFixed(1)}s | ${shot.timeIn} - ${shot.timeOut}.`,
      `Camera: ${shot.camera}. Subjects: ${hero} (hero) and ${friend} (companion) in ${draft.environment.split(/[.!?;]/)[0].trim()}.`,
      `Story spine: ${signal.spine}`,
      `Scene beat: ${shot.staging}`,
      `Relationship dynamic: ${signal.relationship}`,
      `Motion physics: ${meta.logic}`,
      `Render target: Runway Gen-3 / Luma Dream Machine / Sora / Kling. Keep character identity locked to the reference image, 24 fps feel, no morphing of faces or accessories, no added characters, no camera cuts inside the shot.`,
    ].join(NL);

    return {
      shotId: shot.id,
      chunk: shot.chunk,
      profile,
      durationSeconds: shot.durationSeconds,
      camera: shot.camera,
      timeRange: `${shot.timeIn} - ${shot.timeOut}`,
      motionPrompt,
    };
  });

  return { conceptId: concept.id, entries };
}

export type FinalPackage = {
  conceptId: number;
  thematicUnderscore: string;
  tensionCue: string;
  thumbnailWonder: string;
  thumbnailSlapstick: string;
};

export type SavedFinalPackage = {
  id: string;
  projectId: string;
  finalPackage: FinalPackage;
  createdAt: string | Date;
  updatedAt: string | Date;
};

const underscoreNegatives = "no vocals, no beat drops, no electric guitar, no synthetic drums";

export function generateFinalPackage(
  draft: ProjectDraft,
  concept: StoryConcept,
  bible: VisualBible,
): FinalPackage {
  const NL = String.fromCharCode(10);
  const heroAnchor = bible.anchors.find((anchor) => anchor.token === "[CHAR_HERO]")?.definition ?? "";
  const sideAnchor = bible.anchors.find((anchor) => anchor.token === "[CHAR_SIDE]")?.definition ?? "";
  const worldAnchor = bible.anchors.find((anchor) => anchor.token === "[ENV_WORLD]")?.definition ?? "";
  const signal = conceptStorySignal(draft, concept);
  const flags = `--ar 16:9 --stylize 250 ${bible.referenceSettings}`;

  return {
    conceptId: concept.id,
    thematicUnderscore: [
      `Thematic underscore for the animated children's film "${draft.title}" (${signal.title}).`,
      `Story spine: ${signal.spine}`,
      "Sweet, emotional orchestral cue: warm woodwinds (flute, clarinet), gentle string ensemble, soft harp arpeggios, delicate celesta accents. Slow emotional progression from tender curiosity to quiet hope, 72 BPM, major key with a wistful lydian lift, seamless loopable middle section for dialogue beds.",
      `Story heart: ${signal.internalNeed}`,
      `Negative flags: ${underscoreNegatives}.`,
    ].join(NL),
    tensionCue: [
      `Tension and comic cue for the animated children's film "${draft.title}" (${signal.title}).`,
      `Story objective: ${signal.externalWant}. Relationship dynamic: ${signal.relationship}`,
      "Playful pizzicato strings, bouncing bassoon, rhythmic triangle and xylophone figures, light woodblock ticks. Mischievous staccato build with comic pauses and a soft pratfall resolution, 104 BPM, friendly minor colors that always resolve warmly, duckable arrangement for voice-over.",
      "Use for slapstick detours and the Act II tangle, never frightening for young viewers.",
      `Negative flags: ${underscoreNegatives}.`,
    ].join(NL),
    thumbnailWonder: [
      `YouTube family thumbnail, concept EMOTIONAL WONDER, for "${draft.title}". ${draft.heroName} looking directly into camera with massive glassy teary eyes full of luminous catchlights, holding a glowing magical acorn close to the chest, warm golden rim light against deep forest bokeh. Story spine: ${signal.spine}`,
      `[CHAR_HERO] ${heroAnchor}`,
      `[ENV_WORLD] ${worldAnchor}`,
      "Bold high-contrast uncluttered 3D character framing, single focal subject readable at 200px mobile preview, no text, generous negative space on the left third.",
      pixarStyleBlock,
      flags,
      imageNegativeBlock,
    ].join(NL),
    thumbnailSlapstick: [
      `YouTube family thumbnail, concept PURE SLAPSTICK, for "${draft.title}". ${draft.heroName} tangled upside down in ivy vines with a funny panicked expression, cheeks puffed, ${draft.sideName} laughing in the sharp foreground, bright playful daylight. Story spine: ${signal.spine}`,
      `[CHAR_HERO] ${heroAnchor}`,
      `[CHAR_SIDE] ${sideAnchor}`,
      `[ENV_WORLD] ${worldAnchor}`,
      "Bold high-contrast uncluttered 3D character framing, exaggerated readable silhouettes at 200px mobile preview, no text.",
      pixarStyleBlock,
      flags,
      imageNegativeBlock,
    ].join(NL),
  };
}

function edlTimecode(totalFrames: number) {
  const frames = totalFrames % 24;
  const totalSeconds = Math.floor(totalFrames / 24);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`;
}

export function buildNleJson(draft: ProjectDraft, cueSheet: CueSheet) {
  return {
    project: {
      title: draft.title,
      fps: 24,
      durationSeconds: draft.duration * 60,
      aspectRatio: draft.aspectRatio,
    },
    shots: cueSheet.shots.map((shot) => ({
      shotId: shot.id,
      inPoint: shot.timeIn,
      outPoint: shot.timeOut,
      dialogue: shot.dialogue,
      imagePromptId: shot.id,
      audioTracks: { A1: "Voice", A2: "Foley", A3: "Music" },
    })),
  };
}

export function buildEdl(draft: ProjectDraft, cueSheet: CueSheet) {
  const NL = String.fromCharCode(10);
  const lines = [`TITLE: ${draft.title.toUpperCase()}`, "FCM: NON-DROP FRAME", ""];
  let cursorTenths = 0;

  cueSheet.shots.forEach((shot, index) => {
    const startTenths = cursorTenths;
    cursorTenths += Math.round(shot.durationSeconds * 10);
    const sourceIn = Math.round(startTenths * 2.4);
    const sourceOut = Math.round(cursorTenths * 2.4);
    const event = String(index + 1).padStart(3, "0");
    lines.push(
      `${event}  ${shot.id.padEnd(8)} V     C        ${edlTimecode(sourceIn)} ${edlTimecode(sourceOut)} ${edlTimecode(sourceIn)} ${edlTimecode(sourceOut)}`,
    );
    lines.push(`* FROM CLIP NAME: ${shot.id}`);
    if (shot.dialogue) lines.push(`* COMMENT: ${shot.dialogue.slice(0, 90)}`);
    lines.push("");
  });

  return lines.join(NL);
}

const baseTimeline = [
  {
    id: "opening",
    title: "Úvodná znelka",
    dramaturgy: "Predstaví svet a hlavnú dvojicu. Veselá pieseň otvorí film.",
    kind: "song" as const,
  },
  {
    id: "act-one",
    title: "Akt I",
    dramaturgy: "Spoznáme túžbu hrdinu a udalosť, ktorá naruší pokoj.",
    kind: "story" as const,
  },
  {
    id: "act-two-a",
    title: "Akt II-A",
    dramaturgy: "Cesta, prvé prekážky, objavovanie a bezpečný situačný humor.",
    kind: "story" as const,
  },
  {
    id: "act-two-b",
    title: "Akt II-B",
    dramaturgy: "Najväčšia chyba, ťažká chvíľa a nový pohľad na problém.",
    kind: "story" as const,
  },
  {
    id: "act-three",
    title: "Akt III",
    dramaturgy: "Hrdina urobí slobodné rozhodnutie a použije to, čo sa naučil.",
    kind: "story" as const,
  },
  {
    id: "ending",
    title: "Záver a ponaučenie",
    dramaturgy: "Doznie emócia, vzťah postáv a nový pokojný deň.",
    kind: "story" as const,
  },
  {
    id: "outro",
    title: "Záverečná pieseň",
    dramaturgy: "Zhrnie posolstvo a nesie záverečné titulky.",
    kind: "song" as const,
  },
];

function allocateUnits(total: number, weights: number[]) {
  const sum = weights.reduce((accumulator, value) => accumulator + value, 0);
  const exact = weights.map((weight) => (total * weight) / sum);
  const values = exact.map(Math.floor);
  let remaining = total - values.reduce((accumulator, value) => accumulator + value, 0);
  const order = exact
    .map((value, index) => ({ index, remainder: value - Math.floor(value) }))
    .sort((left, right) => right.remainder - left.remainder || left.index - right.index);

  for (let index = 0; index < remaining; index += 1) {
    values[order[index % order.length].index] += 1;
  }

  return values;
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function runtimeTimeline(duration: number): TimelineSegment[] {
  const weights = [40, 80, 150, 150, 105, 30, 45];
  const seconds = allocateUnits(duration * 60, weights);
  const words = allocateUnits(duration * 125, weights);
  let cursor = 0;

  return baseTimeline.map((segment, index) => {
    const from = cursor;
    cursor += seconds[index];

    return {
      ...segment,
      from: formatTime(from),
      to: formatTime(cursor),
      durationSeconds: seconds[index],
      words: words[index],
    };
  });
}

export function wordBudget(duration: number) {
  const words = duration * 125;
  const tolerance = Math.round(words * 0.03);

  return {
    words,
    minimum: words - tolerance,
    maximum: words + tolerance,
    minutes: `${String(duration).padStart(2, "0")}:00`,
  };
}
