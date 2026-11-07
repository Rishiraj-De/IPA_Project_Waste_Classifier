'use client';
import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Camera,
  Milk,
  BatteryFull,
  CupSoda,
  Apple,
  Cpu,
  Sprout,
  Recycle,
  TriangleAlert,
  Bandage,
  Trash2,
  Leaf,
  type LucideIcon,
} from 'lucide-react';
import { sound } from '../utils/audio';
import { Landscape } from '../components/Landscape';
import { apiService } from '../services/api';
import { HistoryItem } from '../types';

interface LandingPageProps {
  onStartScanning: () => void;
  onOpenDashboard: () => void;
  onOpenImpact?: () => void;
  onOpenHistory?: () => void;
}

interface ExampleItem {
  id: string;
  name: string;
  icon: LucideIcon;
  material: string;
  stream: string;
  disposal: string;
  why: string;
  preparation: string;
}

const EXAMPLES: ExampleItem[] = [
  {
    id: 'bottle',
    name: 'PET plastic bottle',
    icon: Milk,
    material: 'Polyethylene terephthalate (PET #1)',
    stream: 'Dry waste',
    disposal: 'Recyclable',
    why: 'High-purity thermoplastic. Fully recyclable into polyester fibre or food-grade rPET.',
    preparation: 'Empty it, remove the cap and flatten it to save space in the bin.',
  },
  {
    id: 'battery',
    name: 'Lithium-ion battery',
    icon: BatteryFull,
    material: 'Lithium cobalt oxide (LiCoO2)',
    stream: 'Hazardous',
    disposal: 'Hazardous depot',
    why: 'Heavy metals and a fire risk if punctured. Needs specialist cathode recovery.',
    preparation: 'Tape the terminals and keep it dry, away from heat.',
  },
  {
    id: 'can',
    name: 'Aluminium drinks can',
    icon: CupSoda,
    material: 'Aluminium alloy 3104',
    stream: 'Dry waste',
    disposal: 'Recyclable',
    why: 'Recyclable forever without losing quality, using 95% less energy than new aluminium.',
    preparation: 'Give it a quick rinse. Leave it uncrushed if your deposit scheme scans barcodes.',
  },
  {
    id: 'food',
    name: 'Food scraps',
    icon: Apple,
    material: 'Biodegradable organic matter',
    stream: 'Wet waste',
    disposal: 'Compostable',
    why: 'In landfill it rots without air and releases methane. Compost or biogas avoids that.',
    preparation: 'Keep out plastic wrappers and twist ties, then use the green bin.',
  },
  {
    id: 'circuit',
    name: 'Circuit board',
    icon: Cpu,
    material: 'FR-4 laminate with copper, gold and silver',
    stream: 'E-waste',
    disposal: 'E-waste centre',
    why: 'Contains recoverable precious metals and traces of toxic solder.',
    preparation: 'Put it in an anti-static bag and take it to an e-waste collection point.',
  },
];

const STREAMS: { name: string; icon: LucideIcon; bin: string; body: string }[] = [
  { name: 'Wet waste', icon: Sprout, bin: 'Green bin', body: 'Kitchen scraps, leftovers, coffee grounds and soiled paper.' },
  { name: 'Dry recyclable', icon: Recycle, bin: 'Blue bin', body: 'Paper, clean cardboard, PET and HDPE plastics, cans and glass.' },
  { name: 'Hazardous', icon: TriangleAlert, bin: 'Secure depot', body: 'Batteries, aerosols, paint thinners, medicines and CFL tubes.' },
  { name: 'E-waste', icon: Cpu, bin: 'Collection point', body: 'Phones, chargers, cables, circuit boards and old peripherals.' },
  { name: 'Sanitary', icon: Bandage, bin: 'Wrapped, black bin', body: 'Diapers, hygiene products and medical swabs.' },
  { name: 'General residual', icon: Trash2, bin: 'Black bin', body: 'Chip packets, thermoset plastics and mixed composites.' },
];

const QUIZ_QUESTIONS = [
  {
    question: 'An oily pizza box with cheese stuck to it',
    options: [
      { label: 'Dry waste (paper)', correct: false, reason: 'Grease binds to paper fibres and cannot be separated when the paper is pulped.' },
      { label: 'Wet / compostable', correct: true, reason: 'Soiled paper breaks down in compost or a biogas digester.' },
      { label: 'Hazardous waste', correct: false, reason: 'It is not hazardous, but it would contaminate clean paper recycling.' },
    ],
  },
  {
    question: 'An empty aerosol deodorant can',
    options: [
      { label: 'Wet waste', correct: false, reason: 'Aerosols are metal and contain no organic matter.' },
      { label: 'Dry waste (metal)', correct: true, reason: 'Once fully empty, steel and aluminium aerosol cans are recyclable metal.' },
      { label: 'E-waste', correct: false, reason: 'Aerosol cans have no circuits or batteries.' },
    ],
  },
  {
    question: 'Broken phone glass with the touch layer still glued on',
    options: [
      { label: 'Glass recycling', correct: false, reason: 'Treated screen glass and laminates cannot be melted with bottle glass.' },
      { label: 'E-waste', correct: true, reason: 'It needs electronic scrap processing to recover the coatings safely.' },
      { label: 'Compost', correct: false, reason: 'Glass and adhesives do not break down.' },
    ],
  },
];

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

export const LandingPage: React.FC<LandingPageProps> = ({ onStartScanning, onOpenDashboard, onOpenImpact, onOpenHistory }) => {
  const [selected, setSelected] = useState<ExampleItem>(EXAMPLES[0]);
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [recent, setRecent] = useState<HistoryItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiService
      .getHistory({ limit: 4, sort_order: 'desc' })
      .then((res) => {
        if (!cancelled) setRecent(res.items || []);
      })
      .catch(() => {
        if (!cancelled) setRecent([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const startScanning = () => {
    sound.playTargetLock();
    onStartScanning();
  };

  const question = QUIZ_QUESTIONS[quizIndex];
  const SelectedIcon = selected.icon;

  return (
    <div className="flex flex-col gap-16 sm:gap-24 pb-8">
      {/* Hero */}
      <section className="relative rounded-[2rem] sm:rounded-[2.75rem] overflow-hidden bg-blush border border-ink/[0.12] min-h-[640px] sm:min-h-[680px] lg:min-h-[640px] flex flex-col">
        <Landscape className="lg:hidden absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMax meet" />
        <Landscape className="hidden lg:block absolute inset-0 w-full h-full" />

        <div className="relative flex flex-col items-center text-center px-6 pt-16 sm:pt-24">
          <h1 className="display text-[2.6rem] sm:text-6xl lg:text-7xl text-ink">Sort your waste</h1>
          <p className="accent-thin text-[2.1rem] sm:text-5xl lg:text-6xl text-ink mt-1">the right way</p>
          <p className="mt-6 text-base sm:text-lg text-ink-soft max-w-xl leading-relaxed">
            Take a photo of anything you are about to throw away. Classify.ai tells you what it is, which bin it
            belongs in and how to prepare it.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <button
              onMouseEnter={() => sound.playHover()}
              onClick={startScanning}
              className="cred-button-primary px-8 py-4 text-base flex items-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Start scanning
            </button>
            <button
              onMouseEnter={() => sound.playHover()}
              onClick={() => {
                sound.playClick();
                onOpenDashboard();
              }}
              className="px-8 py-4 rounded-2xl text-base font-medium text-ink bg-blush/80 border-[1.5px] border-ink/40 hover:bg-surface transition-colors"
            >
              See insights
            </button>
          </div>
        </div>
      </section>

      {/* What goes where + disposal streams */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
        <div className="cred-card p-6 sm:p-8">
          <h2 className="display text-2xl sm:text-3xl text-ink">What goes where?</h2>
          <p className="text-[15px] text-muted mt-2 leading-relaxed">
            Pick an item to see the kind of answer the scanner gives you.
          </p>

          <div className="grid grid-cols-5 gap-2 sm:gap-3 mt-6" role="tablist" aria-label="Example items">
            {EXAMPLES.map((item) => {
              const Icon = item.icon;
              const isSelected = selected.id === item.id;
              return (
                <button
                  key={item.id}
                  role="tab"
                  aria-selected={isSelected}
                  aria-label={item.name}
                  title={item.name}
                  onMouseEnter={() => sound.playHover()}
                  onClick={() => {
                    sound.playClick();
                    setSelected(item);
                  }}
                  className={`aspect-square rounded-2xl flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-lime/70 text-ink' : 'bg-paper-2 text-ink-soft hover:bg-lime/40'
                  }`}
                >
                  <Icon className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={1.75} />
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-2xl bg-paper-2 p-5" role="tabpanel">
            <div className="flex items-start gap-3">
              <SelectedIcon className="w-5 h-5 mt-1 text-moss shrink-0" strokeWidth={1.75} />
              <div>
                <h3 className="text-lg font-semibold text-ink">{selected.name}</h3>
                <p className="text-sm text-muted">{selected.material}</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-4 mt-5 text-sm">
              <div>
                <dt className="text-muted">Stream</dt>
                <dd className="font-medium text-ink mt-0.5">{selected.stream}</dd>
              </div>
              <div>
                <dt className="text-muted">Result</dt>
                <dd className="font-medium text-ink mt-0.5">{selected.disposal}</dd>
              </div>
            </dl>
            <p className="text-[15px] text-ink-soft leading-relaxed mt-5">{selected.why}</p>
            <p className="text-[15px] text-ink-soft leading-relaxed mt-3">
              <span className="font-medium text-ink">Before you bin it: </span>
              {selected.preparation}
            </p>
          </div>

          <button
            onMouseEnter={() => sound.playHover()}
            onClick={startScanning}
            className="cred-button-primary w-full mt-6 py-4 text-base"
          >
            Scan your own items
          </button>
        </div>

        <div>
          <h2 className="display text-2xl sm:text-3xl text-ink px-1">Disposal streams</h2>
          <p className="text-[15px] text-muted mt-2 px-1 leading-relaxed">
            Every result points to one of these six streams.
          </p>
          <ul className="flex flex-col gap-3 mt-6">
            {STREAMS.map((stream) => {
              const Icon = stream.icon;
              return (
                <li key={stream.name} className="flex items-center gap-4 rounded-3xl bg-surface border border-ink/[0.08] p-3 pr-5">
                  <span className="w-16 h-16 shrink-0 rounded-2xl bg-paper-2 flex items-center justify-center text-ink">
                    <Icon className="w-7 h-7" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <h3 className="text-[17px] font-semibold text-ink">{stream.name}</h3>
                      <span className="text-sm text-muted">{stream.bin}</span>
                    </div>
                    <p className="text-sm text-ink-soft leading-relaxed mt-0.5">{stream.body}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Recent scans + challenge */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
        <div className="cred-card p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="display text-2xl sm:text-3xl text-ink">Recent scans</h2>
            {onOpenHistory && (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenHistory();
                }}
                className="cred-button-secondary px-4 py-2 text-sm"
              >
                View all
              </button>
            )}
          </div>

          {recent === null ? (
            <p className="text-sm text-muted mt-6">Loading scans…</p>
          ) : recent.length === 0 ? (
            <p className="text-sm text-muted mt-6">No scans yet. Your results will show up here.</p>
          ) : (
            <ul className="flex flex-col gap-3 mt-6">
              {recent.map((item) => {
                const obj = item.objects[0];
                return (
                  <li key={item.id} className="flex items-center gap-4 rounded-2xl bg-paper-2 p-3 pr-4">
                    <span className="w-12 h-12 rounded-full bg-lime/60 text-ink flex items-center justify-center shrink-0">
                      <Leaf className="w-5 h-5" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-ink truncate">{obj?.label || item.primary_category}</p>
                      <p className="text-sm text-muted truncate">
                        {obj?.disposal_info.recommended_bin || item.primary_category}
                      </p>
                    </div>
                    <span className="text-sm text-muted shrink-0">{timeAgo(item.created_at)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="cred-card p-6 sm:p-8">
          <p className="kicker">Challenge {quizIndex + 1} of {QUIZ_QUESTIONS.length}</p>
          <h2 className="display text-2xl sm:text-3xl text-ink mt-1">Can this go in the blue bin?</h2>
          <p className="mt-5 text-lg text-ink">{question.question}</p>

          <div className="flex flex-col gap-2.5 mt-5">
            {question.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              return (
                <button
                  key={idx}
                  onMouseEnter={() => sound.playHover()}
                  onClick={() => {
                    if (opt.correct) sound.playSuccess();
                    else sound.playClick(400);
                    setSelectedOption(idx);
                  }}
                  aria-pressed={isSelected}
                  className={`flex items-center justify-between gap-3 px-5 py-4 rounded-2xl text-left text-[15px] font-medium transition-colors border-[1.5px] ${
                    isSelected
                      ? opt.correct
                        ? 'bg-lime/50 border-leaf text-ink'
                        : 'bg-rose-500/10 border-rose-500/60 text-ink'
                      : 'bg-paper-2 border-transparent text-ink hover:border-ink/25'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected &&
                    (opt.correct ? (
                      <CheckCircle2 className="w-5 h-5 text-moss shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-700 shrink-0" />
                    ))}
                </button>
              );
            })}
          </div>

          {selectedOption !== null && (
            <p className="mt-4 text-[15px] text-ink-soft leading-relaxed" role="status">
              <span className="font-medium text-ink">
                {question.options[selectedOption].correct ? 'Correct. ' : 'Not quite. '}
              </span>
              {question.options[selectedOption].reason}
            </p>
          )}

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onMouseEnter={() => sound.playHover()}
              onClick={() => {
                sound.playClick();
                setSelectedOption(null);
                setQuizIndex((prev) => (prev + 1) % QUIZ_QUESTIONS.length);
              }}
              className="cred-button-secondary px-5 py-3 text-[15px] flex items-center gap-2"
            >
              Next question
              <ChevronRight className="w-4 h-4" />
            </button>
            {onOpenImpact && (
              <button
                onMouseEnter={() => sound.playHover()}
                onClick={() => {
                  sound.playClick();
                  onOpenImpact();
                }}
                className="cred-button-primary px-5 py-3 text-[15px] flex items-center gap-2"
              >
                Estimate your eco-impact
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
