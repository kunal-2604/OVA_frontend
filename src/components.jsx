import React, { useState, useRef } from 'react';
import {
  Activity, Microscope, UploadCloud, RotateCcw,
  ChevronDown, ChevronUp, Eye, EyeOff
} from 'lucide-react';

// ── Navbar ─────────────────────────────────────────────────────────────────────
export function Header({ onReset, onJumpPhase2, hasResult }) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <div
          className="flex items-center space-x-3 cursor-pointer select-none"
          onClick={onReset}
        >
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <div className="leading-tight">
            <span className="text-sm font-bold text-slate-900 tracking-tight">OvaAI</span>
            <span className="text-[10px] font-medium text-slate-400 ml-1.5">Screening System</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex items-center space-x-1.5 text-[11px] text-slate-500 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>4 models loaded</span>
          </div>

          <div className="h-4 w-px bg-slate-200 mx-2 hidden sm:block" />

          {!hasResult && (
            <button
              onClick={onJumpPhase2}
              className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors px-3 py-1.5 rounded-md hover:bg-slate-100"
            >
              Skip to Phase 2
            </button>
          )}

          {hasResult && (
            <button
              onClick={onReset}
              className="inline-flex items-center space-x-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>New scan</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

// ── Image Viewer with View Toggle ──────────────────────────────────────────────
export function ImageViewer({
  originalUrl,
  overlayUrl,
  limeUrl = null,
  title = "Feature Attribution",
  className = ""
}) {
  const views = [
    { key: 'overlay', label: 'Grad-CAM' },
    { key: 'original', label: 'Original' },
  ];
  if (limeUrl) views.push({ key: 'lime', label: 'LIME' });

  const [active, setActive] = useState('overlay');

  const src = active === 'original' ? originalUrl : active === 'lime' ? limeUrl : overlayUrl;

  return (
    <div className={`bg-white rounded-xl border border-slate-200 overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700">{title}</span>
        <div className="flex bg-slate-100 rounded-md p-0.5 text-[11px] font-medium">
          {views.map(v => (
            <button
              key={v.key}
              onClick={() => setActive(v.key)}
              className={`px-2.5 py-1 rounded transition-all duration-200 ${
                active === v.key
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Image */}
      <div className="bg-slate-50 flex items-center justify-center p-6 min-h-[280px]">
        <div className="relative rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-white">
          <img
            src={src}
            alt={title}
            className="max-h-64 object-contain transition-opacity duration-300"
          />
        </div>
      </div>

      <div className="px-4 py-2 border-t border-slate-100 text-[11px] text-slate-400 font-mono flex justify-between">
        <span>
          {active === 'overlay' && 'Warm regions → higher model attention'}
          {active === 'lime' && 'Outlined superpixels supporting prediction'}
          {active === 'original' && 'Unprocessed input image'}
        </span>
        <span>224×224</span>
      </div>
    </div>
  );
}

// ── Probability Bars ───────────────────────────────────────────────────────────
export function ProbabilityList({ probabilities = [], maxItems = 4 }) {
  const [expanded, setExpanded] = useState(false);
  const items = expanded ? probabilities : probabilities.slice(0, maxItems);

  const getColor = (category) => {
    if (category === 'Malignant-Suspicious') return 'bg-rose-500';
    if (category === 'Normal') return 'bg-emerald-500';
    return 'bg-amber-500';
  };

  return (
    <div className="space-y-2.5">
      {items.map((p, i) => (
        <div key={i}>
          <div className="flex justify-between items-baseline text-xs mb-1">
            <span className="font-medium text-slate-700">
              {p.full_name ? `${p.class_name} — ${p.full_name}` : p.class_name}
            </span>
            <span className="font-mono font-semibold text-slate-900 tabular-nums">{p.percentage}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${getColor(p.category)} transition-all duration-500 ease-out`}
              style={{ width: `${Math.max(2, p.percentage)}%` }}
            />
          </div>
        </div>
      ))}

      {probabilities.length > maxItems && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center space-x-1 pt-1 transition-colors"
        >
          <span>{expanded ? 'Show fewer' : `Show all ${probabilities.length} classes`}</span>
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      )}
    </div>
  );
}

// ── Upload Dropzone ────────────────────────────────────────────────────────────
export function Uploader({
  title,
  subtitle,
  sampleOptions = [],
  onFileChosen,
  onSampleChosen,
  multiple = false,
}) {
  const ref = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="space-y-3">
      <div
        onClick={() => ref.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.length) onFileChosen(Array.from(e.dataTransfer.files));
        }}
        className={`rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ${
          dragOver
            ? 'border-slate-400 bg-slate-100'
            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
        }`}
      >
        <input
          ref={ref}
          type="file"
          multiple={multiple}
          accept=".jpg,.jpeg,.png,.tif,.tiff"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) onFileChosen(Array.from(e.target.files));
          }}
        />
        <UploadCloud className="h-8 w-8 text-slate-400 mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
      </div>

      {sampleOptions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Test with:
          </span>
          {sampleOptions.map((s, i) => (
            <button
              key={i}
              onClick={() => onSampleChosen(s)}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${
                s.tag === 'Malignant' ? 'bg-rose-500' : 'bg-emerald-500'
              }`} />
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
