'use client';
import React, { useState } from 'react';
import { ArrowUpRight, ArrowRight, ShieldCheck, CheckCircle2, XCircle, Camera, Leaf } from 'lucide-react';
import { sound } from '../utils/audio';
import { Landscape } from '../components/Landscape';

interface LandingPageProps {
  onStartScanning: () => void;
  onOpenDashboard: () => void;
  onOpenImpact?: () => void;
}

interface HeroItem {
  id: string;
  name: string;
  emoji: string;
  material: string;
  category: 'DRY WASTE' | 'WET WASTE' | 'HAZARDOUS' | 'E-WASTE';
  disposal: 'RECYCLABLE' | 'COMPOSTABLE' | 'HAZARDOUS DEPOT' | 'E-WASTE VAULT';
  color: string;
  why: string;
  preparation: string;
}

const HERO_ITEMS: HeroItem[] = [
  {
    id: 'bottle',
    name: 'PET Plastic Bottle',
    emoji: '🧴',
    material: 'Polyethylene Terephthalate (PET #1)',
    category: 'DRY WASTE',
    disposal: 'RECYCLABLE',
    color: '#4878ad',
    why: 'High-purity thermoplastic polymer. Fully recyclable into spun polyester fibre or food-grade rPET resin.',
    preparation: 'Empty liquid residue, remove non-PET cap, flatten to optimize bin volume.',
  },
  {
    id: 'battery',
    name: 'Lithium-Ion Battery',
    emoji: '🔋',
    material: 'Lithium Cobalt Oxide (LiCoO2)',
    category: 'HAZARDOUS',
    disposal: 'HAZARDOUS DEPOT',
    color: '#c2453b',
    why: 'Heavy metal content and fire risk if punctured. Requires specialized metallurgical cathode extraction.',
    preparation: 'Tape battery terminals with electrical tape. Store dry away from thermal sources.',
  },
  {
    id: 'can',
    name: 'Aluminium Beverage Can',
    emoji: '🥫',
    material: 'Aluminium Alloy 3104',
    category: 'DRY WASTE',
    disposal: 'RECYCLABLE',
    color: '#6b7280',
    why: 'Infinitely recyclable without structural degradation. Saves 95% energy compared to raw bauxite smelting.',
    preparation: 'Rinse briefly. Do not crush if required by deposit return barcode scanners.',
  },
  {
    id: 'food',
    name: 'Organic Food Waste',
    emoji: '🥑',
    material: 'Biodegradable Organic Lignocellulose',
    category: 'WET WASTE',
    disposal: 'COMPOSTABLE',
    color: '#5f8c1e',
    why: 'Rapidly anaerobically degrades in landfill, generating methane. Ideal for aerobic compost or biogas digesters.',
    preparation: 'Keep free from plastic wrappers or twist ties. Transfer to green compost bin.',
  },
  {
    id: 'circuit',
    name: 'Printed Circuit Board',
    emoji: '📟',
    material: 'FR-4 Copper Clad Laminate + Gold/Silver',
    category: 'E-WASTE',
    disposal: 'E-WASTE VAULT',
    color: '#7a68a6',
    why: 'Contains precious recoverable metals (Au, Ag, Cu) and trace toxic solder (Pb, Sn).',
    preparation: 'Store in anti-static bag. Deliver to registered e-waste collection centre.',
  },
];

const QUIZ_QUESTIONS = [
  {
    question: 'Oily corrugated pizza box with cheese residue',
    options: [
      { label: 'Dry Waste (Paper)', correct: false, reason: 'Grease and food oils bind to paper fibres and cannot be separated during water-based pulping.' },
      { label: 'Wet / Compostable', correct: true, reason: 'Correct. Soiled paper decomposes organically in municipal compost or anaerobic digesters.' },
      { label: 'Hazardous Waste', correct: false, reason: 'Not hazardous, but will contaminate pure paper recycling streams.' },
    ],
  },
  {
    question: 'Empty aerosol deodorant can (depressurized)',
    options: [
      { label: 'Wet Waste', correct: false, reason: 'Aerosols are metallic and contain zero organic matter.' },
      { label: 'Dry Waste (Metal)', correct: true, reason: 'Correct. Once fully emptied, steel and aluminium aerosol containers are recyclable dry metal.' },
      { label: 'E-Waste', correct: false, reason: 'Aerosol cans do not contain electrical circuits or batteries.' },
    ],
  },
  {
    question: 'Broken smartphone glass with digitizer glued',
    options: [
      { label: 'Dry Glass Recycling', correct: false, reason: 'Treated Gorilla glass and optical laminates cannot be melted with standard bottle glass.' },
      { label: 'E-Waste / Specialized', correct: true, reason: 'Correct. Requires dedicated electronic scrap processing for indium tin oxide recovery.' },
      { label: 'General Compost', correct: false, reason: 'Glass and synthetic optical adhesives are non-biodegradable.' },
    ],
  },
];

const STEPS = [
  {
    title: 'Identify',
    body: 'YOLOv8 finds every object in the photo and draws a box around each one.',
  },
  {
    title: 'Classify',
    body: 'Each object is mapped to one of 9 standard municipal waste categories.',
  },
  {
    title: 'Explain',
    body: 'You get the reason behind the call, plus safety warnings and preparation steps.',
  },
  {
    title: 'Act',
    body: 'Drop it in the bin we point you to and keep the recycling stream clean.',
  },
];

const STREAMS = [
  {
    name: 'Wet waste',
    color: '#5f8c1e',
    bin: 'Green bin',
    route: 'Compost / biogas',
    body: 'Kitchen scraps, raw vegetables, cooked leftovers, coffee grounds and soiled compostable paper.',
  },
  {
    name: 'Dry recyclable',
    color: '#4878ad',
    bin: 'Blue bin',
    route: 'Material recovery',
    body: 'Paper, clean cardboard, PET, HDPE and PP plastics, steel and aluminium cans, and intact glass.',
  },
  {
    name: 'Hazardous',
    color: '#c2453b',
    bin: 'Red / secure',
    route: 'Special depot',
    body: 'Lithium batteries, aerosols, paint thinners, expired medicines and CFL mercury tubes.',
  },
  {
    name: 'E-waste',
    color: '#7a68a6',
    bin: 'Grey vault',
    route: 'Smelter refinery',
    body: 'Circuit boards, phones, chargers, copper cables and broken electronic peripherals.',
  },
  {
    name: 'Sanitary',
    color: '#c98a2b',
    bin: 'Wrapped black',
    route: 'High-temp incineration',
    body: 'Diapers, personal hygiene products, medical swabs and biologically contaminated disposables.',
  },
  {
    name: 'General residual',
    color: '#6b6576',
    bin: 'Black bin',
    route: 'Engineered landfill',
    body: 'Multi-layer chip packets, thermoset plastics and composite resins that cannot be recycled.',
  },
];

// Figures below come from the repository itself:
// mAP@50 from ml/evaluation/metrics/evaluation_report.json, 9 classes from the taxonomy,
// and the two input modes offered on the Scan page.
const FACTS = [
  { value: '87%', label: ['mAP@50 in', 'evaluation'] },
  { value: '9', label: ['Waste', 'categories'] },
  { value: '2', label: ['Ways to scan:', 'photo, camera'] },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onStartScanning, onOpenDashboard, onOpenImpact }) => {
  const [selectedItem, setSelectedItem] = useState<HeroItem>(HERO_ITEMS[0]);
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const startScanning = () => {
    sound.playTargetLock();
    onStartScanning();
  };

  return (
    <div className="flex flex-col gap-20 sm:gap-28 pb-12">
      {/* 1. HERO */}
      <section className="relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden bg-paper">
        <Landscape className="block lg:hidden w-full h-56 sm:h-80" preserveAspectRatio="xMidYMid slice" />
        <Landscape
          className="hidden lg:block absolute inset-0 w-full h-full"
          preserveAspectRatio="xMaxYMax slice"
        />
        {/* Paper panel with a lavender edge; stretches to whatever height the copy needs */}
        <svg
          viewBox="0 0 700 760"
          preserveAspectRatio="none"
          className="hidden lg:block absolute inset-y-0 left-0 w-[59%] h-full"
          aria-hidden="true"
        >
          <path
            d="M0 70 C260 20 470 70 540 230 C600 370 520 500 610 640 C640 690 670 730 700 760 L0 760 Z"
            fill="var(--l-band)"
          />
          <path
            d="M0 105 C240 60 420 100 490 250 C550 385 470 510 555 640 C585 690 615 730 640 760 L0 760 Z"
            fill="var(--paper)"
          />
        </svg>

        <div className="relative bg-paper lg:bg-transparent px-6 pt-8 pb-8 sm:px-10 lg:pl-14 lg:pr-0 lg:pt-32 lg:pb-12 lg:max-w-[560px]">
          <p className="kicker">We help you</p>
          <h1 className="display text-[2.75rem] sm:text-6xl lg:text-[3.2rem] xl:text-[3.35rem] text-ink mt-3">
            Sort waste
            <br />
            the right way
          </h1>
          <p className="mt-5 text-base sm:text-[17px] text-ink-soft leading-relaxed max-w-md">
            Take a photo of anything you are about to throw away. Classify.ai recognises the material, tells you which
            bin it belongs in and how to prepare it, so recyclables stay recyclable.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-8">
            <button
              onMouseEnter={() => sound.playHover()}
              onClick={startScanning}
              className="cred-button-primary px-7 py-3.5 text-[13px] uppercase flex items-center gap-2"
            >
              <span>Scan your waste</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onMouseEnter={() => sound.playHover()}
              onClick={() => {
                sound.playClick();
                onOpenDashboard();
              }}
              className="text-[13px] uppercase tracking-[0.12em] font-medium text-ink hover:text-lavender-deep flex items-center gap-1.5 py-3"
            >
              <span>See insights</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <dl className="flex flex-wrap gap-x-8 gap-y-4 mt-10">
            {FACTS.map((fact) => (
              <div key={fact.value + fact.label[0]} className="flex items-center gap-2.5">
                <dt className="sr-only">{fact.label.join(' ')}</dt>
                <dd className="text-3xl sm:text-[2.6rem] font-medium text-lavender leading-none">{fact.value}</dd>
                <dd className="text-[11px] sm:text-xs text-ink-soft leading-tight whitespace-nowrap" aria-hidden="true">
                  {fact.label[0]}
                  <br />
                  {fact.label[1]}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 2. ITEM EXPLORER */}
      <section className="w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <p className="kicker">Try it with an example</p>
            <h2 className="display text-3xl sm:text-[2.6rem] text-ink mt-2">What goes where?</h2>
          </div>
          <p className="text-sm text-muted max-w-md leading-relaxed">
            Pick a common item to see the kind of answer the scanner gives you: the material, the right stream and how
            to prepare it.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6" role="tablist" aria-label="Example items">
          {HERO_ITEMS.map((item) => {
            const isSelected = selectedItem.id === item.id;
            return (
              <button
                key={item.id}
                role="tab"
                aria-selected={isSelected}
                onMouseEnter={() => sound.playHover()}
                onClick={() => {
                  sound.playClick();
                  setSelectedItem(item);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-ink text-paper border-ink'
                    : 'bg-surface text-ink-soft border-ink/[0.12] hover:border-ink/30'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>

        <div className="cred-card p-5 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 relative w-full aspect-[4/3] lg:aspect-square rounded-3xl bg-paper-2 flex items-center justify-center overflow-hidden">
              <div className="relative w-40 h-40 sm:w-44 sm:h-44 rounded-2xl border-2 border-dashed border-leaf/70 flex items-center justify-center">
                <span className="text-6xl select-none" aria-hidden="true">
                  {selectedItem.emoji}
                </span>
                <span className="absolute -top-3.5 left-3 px-2.5 py-0.5 rounded-full bg-leaf text-on-leaf text-[11px] font-medium whitespace-nowrap">
                  {selectedItem.name}
                </span>
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium tracking-[0.08em] px-3 py-1 rounded-full bg-paper-2 text-ink-soft">
                  {selectedItem.category}
                </span>
                <span className="text-xs font-medium tracking-[0.08em] px-3 py-1 rounded-full cred-badge-emerald flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {selectedItem.disposal}
                </span>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-semibold text-ink">{selectedItem.name}</h3>
                <p className="text-sm text-muted mt-1">{selectedItem.material}</p>
              </div>

              <div className="p-5 rounded-2xl bg-paper-2">
                <p className="kicker !text-xs mb-1.5">Why it matters</p>
                <p className="text-[15px] text-ink-soft leading-relaxed">{selectedItem.why}</p>
              </div>

              <div className="flex items-start gap-3 text-[15px] text-ink-soft leading-relaxed">
                <ShieldCheck className="w-5 h-5 text-moss shrink-0 mt-0.5" />
                <p>
                  <strong className="font-semibold text-ink">Before you bin it:</strong> {selectedItem.preparation}
                </p>
              </div>

              <div>
                <button
                  onMouseEnter={() => sound.playHover()}
                  onClick={startScanning}
                  className="cred-button-secondary px-6 py-3 text-xs uppercase tracking-[0.1em] flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Scan your own items</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <p className="kicker">How it works</p>
            <h2 className="display text-3xl sm:text-[2.6rem] text-ink mt-2">Four steps, one photo</h2>
          </div>
          <p className="text-sm text-muted max-w-md leading-relaxed">
            One photo goes through detection, classification and the disposal rules engine in a single request.
          </p>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((step, idx) => (
            <li key={step.title} className="cred-card p-6 sm:p-7">
              <span className="text-4xl font-medium text-lavender leading-none">0{idx + 1}</span>
              <h3 className="mt-6 text-lg font-semibold uppercase tracking-[0.08em] text-ink">{step.title}</h3>
              <p className="text-sm text-muted mt-2 leading-relaxed">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 4. DISPOSAL STREAMS */}
      <section className="w-full">
        <div className="mb-8">
          <p className="kicker">Disposal streams</p>
          <h2 className="display text-3xl sm:text-[2.6rem] text-ink mt-2">Six bins, no guesswork</h2>
          <p className="text-sm text-muted mt-3 max-w-xl leading-relaxed">
            Every result points to one of these streams, so you know exactly where an item should end up.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STREAMS.map((stream) => (
            <article key={stream.name} className="cred-card p-6 sm:p-7 flex flex-col">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: `${stream.color}22` }}>
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: stream.color }} />
                </span>
                <h3 className="text-lg font-semibold uppercase tracking-[0.06em] text-ink">{stream.name}</h3>
              </div>
              <p className="text-sm text-muted mt-4 leading-relaxed flex-1">{stream.body}</p>
              <div className="mt-6 pt-4 border-t border-ink/[0.08] flex items-center justify-between text-xs">
                <span className="font-medium text-ink-soft uppercase tracking-[0.08em]">{stream.bin}</span>
                <span className="text-muted">{stream.route}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 5. QUIZ */}
      <section className="w-full">
        <div className="cred-card p-6 sm:p-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-6 border-b border-ink/[0.08]">
            <div>
              <p className="kicker">Quick quiz</p>
              <h2 className="text-2xl sm:text-3xl font-semibold text-ink mt-2">Can this go in the blue bin?</h2>
            </div>
            <p className="text-sm text-muted">
              Question {quizIndex + 1} of {QUIZ_QUESTIONS.length}
            </p>
          </div>

          <p className="my-7 text-lg sm:text-xl font-medium text-ink">
            &ldquo;{QUIZ_QUESTIONS[quizIndex].question}&rdquo;
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {QUIZ_QUESTIONS[quizIndex].options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              return (
                <button
                  key={idx}
                  onMouseEnter={() => sound.playHover()}
                  onClick={() => {
                    if (opt.correct) {
                      sound.playSuccess();
                    } else {
                      sound.playClick(400);
                    }
                    setSelectedOption(idx);
                  }}
                  aria-pressed={isSelected}
                  className={`p-4 rounded-2xl text-left transition-colors border-2 ${
                    isSelected
                      ? opt.correct
                        ? 'bg-emerald-500/10 border-emerald-500'
                        : 'bg-rose-500/10 border-rose-500'
                      : 'bg-paper-2 border-transparent hover:border-ink/15'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs uppercase tracking-[0.1em] text-muted">Option {idx + 1}</span>
                    {isSelected &&
                      (opt.correct ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-700" />
                      ))}
                  </div>
                  <span className="text-[15px] font-medium text-ink block">{opt.label}</span>
                </button>
              );
            })}
          </div>

          {selectedOption !== null && (
            <p
              className={`mt-6 p-4 rounded-2xl text-sm leading-relaxed ${
                QUIZ_QUESTIONS[quizIndex].options[selectedOption].correct
                  ? 'bg-emerald-500/10 text-emerald-800'
                  : 'bg-rose-500/10 text-rose-700'
              }`}
              role="status"
            >
              <strong>{QUIZ_QUESTIONS[quizIndex].options[selectedOption].correct ? 'Correct. ' : 'Not quite. '}</strong>
              {QUIZ_QUESTIONS[quizIndex].options[selectedOption].reason.replace(/^Correct\.\s*/, '')}
            </p>
          )}

          <div className="mt-8 flex justify-end">
            <button
              onMouseEnter={() => sound.playHover()}
              onClick={() => {
                sound.playClick();
                setSelectedOption(null);
                setQuizIndex((prev) => (prev + 1) % QUIZ_QUESTIONS.length);
              }}
              className="cred-button-secondary px-5 py-2.5 text-xs uppercase tracking-[0.1em] flex items-center gap-2"
            >
              <span>Next question</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 6. CLOSING CTA */}
      <section className="relative w-full rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden bg-leaf text-on-leaf">
        <svg
          viewBox="0 0 1200 160"
          preserveAspectRatio="none"
          className="absolute bottom-0 left-0 w-full h-24 sm:h-32"
          aria-hidden="true"
        >
          <path d="M0 110 C200 60 380 70 560 100 C760 135 960 70 1200 90 L1200 160 L0 160 Z" fill="var(--lime)" opacity="0.35" />
          <path d="M0 140 C240 105 460 115 700 135 C900 150 1060 120 1200 125 L1200 160 L0 160 Z" fill="var(--lime)" opacity="0.5" />
        </svg>

        <div className="relative px-6 py-12 sm:px-12 sm:py-16 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-xl">
            <p className="text-[13px] uppercase tracking-[0.14em] opacity-80 flex items-center gap-2">
              <Leaf className="w-4 h-4" /> Ready when you are
            </p>
            <h2 className="display text-3xl sm:text-5xl mt-3">Stop guessing, start sorting</h2>
            <p className="mt-4 text-[15px] opacity-90 leading-relaxed">
              No sign-up needed. Drop in a photo or open your camera and get a bin recommendation in seconds.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0 pb-6 lg:pb-0">
            <button
              onMouseEnter={() => sound.playHover()}
              onClick={startScanning}
              className="px-7 py-3.5 rounded-full bg-paper text-ink text-[13px] font-semibold uppercase tracking-[0.06em] flex items-center gap-2 hover:bg-surface transition-colors"
            >
              <Camera className="w-4 h-4" />
              <span>Open the scanner</span>
            </button>
            {onOpenImpact && (
              <button
                onMouseEnter={() => sound.playHover()}
                onClick={() => {
                  sound.playClick();
                  onOpenImpact();
                }}
                className="px-7 py-3.5 rounded-full border-[1.5px] border-current text-[13px] font-semibold uppercase tracking-[0.06em] hover:bg-black/10 transition-colors"
              >
                Estimate your eco-impact
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
