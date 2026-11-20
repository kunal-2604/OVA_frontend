import React, { useState } from 'react';
import {
  ArrowRight, CheckCircle2, AlertTriangle, FileDown,
  RotateCcw, Microscope, Loader2, Zap, ArrowDown
} from 'lucide-react';
import { api } from './api';
import { Header, ImageViewer, ProbabilityList, Uploader } from './components';

export default function App() {
  const [usFile, setUsFile] = useState(null);
  const [usPreview, setUsPreview] = useState(null);
  const [usResult, setUsResult] = useState(null);
  const [usLoading, setUsLoading] = useState(false);
  const [usError, setUsError] = useState(null);

  const [showPhase2Manual, setShowPhase2Manual] = useState(false);
  const [histoFiles, setHistoFiles] = useState([]);
  const [histoPreview, setHistoPreview] = useState(null);
  const [histoResult, setHistoResult] = useState(null);
  const [histoLoading, setHistoLoading] = useState(false);
  const [histoError, setHistoError] = useState(null);

  const usSamples = [
    { label: 'Simple Cyst', filename: '1.JPG', tag: 'Benign' },
    { label: 'Endometrioma', filename: '10.JPG', tag: 'Benign' },
    { label: 'High-Grade Serous', filename: '1426.JPG', tag: 'Malignant' },
  ];
  const histoSamples = [
    { label: 'Clear Cell (CC)', filename: 'CC_1170.png' },
    { label: 'High-Grade Serous (HGSC)', filename: 'HGSC_55.png' },
    { label: 'Endometrioid (EC)', filename: 'EC_2397.png' },
    { label: 'Mucinous (MC)', filename: 'MC_1323.png' },
  ];

  const handleReset = () => {
    setUsFile(null); setUsPreview(null); setUsResult(null);
    setUsLoading(false); setUsError(null); setShowPhase2Manual(false);
    setHistoFiles([]); setHistoPreview(null); setHistoResult(null);
    setHistoLoading(false); setHistoError(null);
  };

  const pickSampleUs = async (s) => {
    try {
      setUsLoading(true); setUsError(null);
      const res = await fetch(`/samples/${s.filename}`);
      const blob = await res.blob();
      const file = new File([blob], s.filename, { type: 'image/jpeg' });
      setUsFile(file); setUsPreview(URL.createObjectURL(file));
    } catch { setUsError('Could not load sample.'); }
    finally { setUsLoading(false); }
  };

  const runUltrasound = async () => {
    if (!usFile) return;
    setUsLoading(true); setUsError(null);
    try {
      setUsResult(await api.predictUltrasound(usFile));
    } catch (e) {
      setUsError(e.response?.data?.detail || e.message || 'Analysis failed.');
    } finally { setUsLoading(false); }
  };

  const pickSampleHisto = async (s) => {
    try {
      setHistoLoading(true); setHistoError(null);
      const res = await fetch(`/samples/${s.filename}`);
      const blob = await res.blob();
      const file = new File([blob], s.filename, { type: 'image/png' });
      setHistoFiles([file]); setHistoPreview(URL.createObjectURL(file));
    } catch { setHistoError('Could not load sample.'); }
    finally { setHistoLoading(false); }
  };

  const runHistopathology = async () => {
    if (!histoFiles.length) return;
    setHistoLoading(true); setHistoError(null);
    try {
      setHistoResult(await api.predictHistopathology(histoFiles, usResult?.result_id));
    } catch (e) {
      setHistoError(e.response?.data?.detail || e.message || 'Classification failed.');
    } finally { setHistoLoading(false); }
  };

  const isMalignant = usResult?.ensemble?.is_malignant_suspicious || false;
  const showPhase2 = isMalignant || showPhase2Manual;

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onReset={handleReset}
        onJumpPhase2={() => setShowPhase2Manual(true)}
        hasResult={Boolean(usResult || histoResult)}
      />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-10 w-full space-y-8">

        {/* ─── Hero ─── */}
        {!usResult && !showPhase2Manual && (
          <div className="text-center max-w-xl mx-auto pt-6 pb-2 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Ovarian Lesion Screening
              <br />
              <span className="text-slate-400">&amp; Classification</span>
            </h1>
            <p className="text-sm text-slate-500 mt-3 max-w-md mx-auto leading-relaxed">
              Upload an ultrasound scan for AI-assisted screening.
              Suspicious findings are guided to histopathological subtype classification.
            </p>

            {/* Workflow steps */}
            <div className="flex items-center justify-center mt-6 space-x-3 text-xs text-slate-500">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-700">
                <span className="font-mono text-[10px] text-slate-400">01</span>
                <span>Ultrasound</span>
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
              <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-700">
                <span className="font-mono text-[10px] text-slate-400">02</span>
                <span>Histopathology</span>
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
              <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-700">
                <span className="font-mono text-[10px] text-slate-400">03</span>
                <span>Report</span>
              </span>
            </div>
          </div>
        )}

        {/* ━━━ PHASE 1: ULTRASOUND ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Section header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="font-mono text-xs font-semibold text-slate-400 bg-slate-100 w-7 h-7 rounded-lg flex items-center justify-center">
                01
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Ultrasound Screening</h2>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">ResNet50 + EfficientNet-B0 · 8-class MMOTU</p>
              </div>
            </div>

            {usResult && (
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md ${
                isMalignant
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {usResult.ensemble.category}
              </span>
            )}
          </div>

          <div className="p-6 space-y-6">
            {/* Upload / Preview */}
            {!usResult && (
              <div className="space-y-4">
                {!usFile ? (
                  <Uploader
                    title="Upload ovarian ultrasound scan"
                    subtitle="JPG, PNG, or TIFF — drag and drop or click to browse"
                    sampleOptions={usSamples}
                    onFileChosen={(f) => { setUsFile(f[0]); setUsPreview(URL.createObjectURL(f[0])); }}
                    onSampleChosen={pickSampleUs}
                  />
                ) : (
                  <div className="space-y-4 animate-fade-in">
                    <div className="rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center p-4">
                      <img src={usPreview} alt="Scan" className="max-h-64 object-contain rounded-lg" />
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => { setUsFile(null); setUsPreview(null); }}
                        className="text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors"
                      >
                        ← Choose different scan
                      </button>
                      <button
                        disabled={usLoading}
                        onClick={runUltrasound}
                        className="inline-flex items-center space-x-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                      >
                        {usLoading
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <Zap className="h-3.5 w-3.5" />}
                        <span>{usLoading ? 'Analysing...' : 'Run screening'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {usError && <p className="text-xs text-rose-600 font-medium">{usError}</p>}
              </div>
            )}

            {/* Results */}
            {usResult && (
              <div className="space-y-6 animate-slide-up">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: Diagnosis + Probabilities */}
                  <div className="space-y-4">
                    {/* Primary result card */}
                    <div className={`p-5 rounded-xl border ${
                      isMalignant
                        ? 'bg-rose-50 border-rose-200'
                        : 'bg-emerald-50 border-emerald-200'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                          Ensemble Assessment
                        </span>
                      </div>

                      <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                        {usResult.ensemble.predicted_class}
                      </h3>

                      <div className="flex items-center space-x-2 mt-1 text-xs text-slate-600">
                        <span className="font-mono font-semibold">
                          {(usResult.ensemble.confidence * 100).toFixed(1)}%
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className={`font-semibold ${
                          isMalignant ? 'text-rose-600' : 'text-emerald-600'
                        }`}>
                          {usResult.ensemble.category}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-3 pt-3 border-t border-slate-200/60 leading-relaxed">
                        {usResult.recommendation}
                      </p>
                    </div>

                    {/* Probabilities */}
                    <div className="p-4 rounded-xl bg-white border border-slate-200">
                      <span className="text-xs font-semibold text-slate-700 block mb-3">
                        Class probabilities
                      </span>
                      <ProbabilityList probabilities={usResult.ensemble.probabilities} maxItems={4} />
                    </div>
                  </div>

                  {/* Right: Grad-CAM */}
                  <ImageViewer
                    title="Grad-CAM Attribution"
                    originalUrl={usResult.original_image_url}
                    overlayUrl={usResult.models['EfficientNet-B0']?.overlay_url}
                  />
                </div>

                {/* Outcome banner */}
                {!isMalignant && (
                  <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center space-x-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                      <p className="text-xs text-emerald-800">
                        <strong>No malignant-suspicious finding.</strong> Histopathological analysis is not indicated.
                      </p>
                    </div>
                    <button
                      onClick={handleReset}
                      className="shrink-0 ml-4 text-xs font-semibold text-emerald-700 hover:text-emerald-900 px-3 py-1.5 bg-white border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors"
                    >
                      New scan
                    </button>
                  </div>
                )}

                {isMalignant && !showPhase2 && null}
              </div>
            )}
          </div>
        </section>

        {/* ─── Referral connector ─── */}
        {isMalignant && (
          <div className="flex flex-col items-center space-y-2 animate-fade-in">
            <ArrowDown className="h-4 w-4 text-slate-300" />
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-amber-50 border border-amber-200 w-full">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-800 flex-1">
                Malignant-suspicious lesion detected. Histopathological confirmation is recommended.
              </p>
            </div>
            <ArrowDown className="h-4 w-4 text-slate-300" />
          </div>
        )}

        {/* ━━━ PHASE 2: HISTOPATHOLOGY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {showPhase2 && (
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="font-mono text-xs font-semibold text-slate-400 bg-slate-100 w-7 h-7 rounded-lg flex items-center justify-center">
                  02
                </span>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Histopathological Classification</h2>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">EfficientNet-B4 + ResNet50 · 5 subtypes · Grad-CAM + LIME</p>
                </div>
              </div>

              {isMalignant && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                  Referral
                </span>
              )}
            </div>

            <div className="p-6 space-y-6">
              {/* Upload */}
              {!histoResult && (
                <div className="space-y-4">
                  {!histoFiles.length ? (
                    <Uploader
                      title="Upload tissue slide image"
                      subtitle="H&E stained histopathological slide — JPG, PNG, or TIFF"
                      sampleOptions={histoSamples}
                      onFileChosen={(f) => { setHistoFiles(f); setHistoPreview(URL.createObjectURL(f[0])); }}
                      onSampleChosen={pickSampleHisto}
                    />
                  ) : (
                    <div className="space-y-4 animate-fade-in">
                      <div className="rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center p-4">
                        <img src={histoPreview} alt="Tissue slide" className="max-h-64 object-contain rounded-lg" />
                      </div>

                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => { setHistoFiles([]); setHistoPreview(null); }}
                          className="text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors"
                        >
                          ← Choose different slide
                        </button>
                        <button
                          disabled={histoLoading}
                          onClick={runHistopathology}
                          className="inline-flex items-center space-x-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                        >
                          {histoLoading
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Microscope className="h-3.5 w-3.5" />}
                          <span>{histoLoading ? 'Classifying...' : 'Classify subtype'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {histoError && <p className="text-xs text-rose-600 font-medium">{histoError}</p>}
                </div>
              )}

              {/* Results */}
              {histoResult && (
                <div className="space-y-6 animate-slide-up">
                  {histoResult.images.map((im) => {
                    const eff = im.models['EfficientNet-B4'];
                    return (
                      <div key={im.image_id}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Subtype + Probabilities */}
                          <div className="space-y-4">
                            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                                Carcinoma Subtype
                              </span>
                              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                                {eff.predicted_full_name}
                              </h3>
                              <div className="flex items-center space-x-2 mt-1 text-xs">
                                <span className="font-mono font-semibold text-slate-700">
                                  {(eff.confidence * 100).toFixed(1)}%
                                </span>
                                <span className="text-slate-300">·</span>
                                <span className="font-mono text-slate-500">
                                  Code: {eff.predicted_class}
                                </span>
                                <span className="text-slate-300">·</span>
                                <span className="font-mono text-slate-500">
                                  Agreement: {(im.agreement_score * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>

                            <div className="p-4 rounded-xl bg-white border border-slate-200">
                              <span className="text-xs font-semibold text-slate-700 block mb-3">
                                Subtype probabilities
                              </span>
                              <ProbabilityList probabilities={eff.probabilities} maxItems={5} />
                            </div>
                          </div>

                          {/* Visualisations */}
                          <ImageViewer
                            title="Grad-CAM & LIME"
                            originalUrl={im.original_image_url}
                            overlayUrl={eff.overlay_url}
                            limeUrl={im.lime_overlay_url}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {/* Report download */}
                  <div className="flex items-center justify-between p-5 rounded-xl bg-white border border-slate-200">
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Analysis complete</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Includes ultrasound screening, subtype classification, and XAI visualisations.
                      </p>
                    </div>
                    <a
                      href={api.getReportUrl(histoResult.result_id)}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 inline-flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      <FileDown className="h-3.5 w-3.5" />
                      <span>Download PDF</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-slate-200 py-5 text-center text-[11px] text-slate-400">
        OvaAI · Ovarian Cancer Screening & Classification · Academic Research Tool
      </footer>
    </div>
  );
}
