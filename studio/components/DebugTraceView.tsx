import React, { useState, useEffect } from "react";
import { Play, Pause, ChevronRight } from "lucide-react";

interface TraceRule {
  id: string;
  from: string;
  to: string;
  condition: string;
  result: boolean;
}

interface TraceStep {
  step: number;
  agentId: string;
  agentName: string;
  role: string;
  inputContext: unknown;
  rawOutput: string;
  parsedOutput: unknown;
  rulesEvaluated: TraceRule[];
  selectedRuleId: string | null;
  nextAgentId: string | null;
}

interface DebugTraceViewerProps {
  onJumpToAgentFromTrace?: (agentId: string) => void;
}

const DebugTraceViewer: React.FC<DebugTraceViewerProps> = ({
  onJumpToAgentFromTrace,
}) => {
  const [rawJson, setRawJson] = useState("");
  const [parsedContext, setParsedContext] = useState<Record<string, unknown> | null>(null);
  const [trace, setTrace] = useState<TraceStep[]>([]);
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Parse trace from Final context JSON
  const handleParse = () => {
    setError(null);
    try {
      const obj = JSON.parse(rawJson);

      if (!obj || typeof obj !== "object") {
        throw new Error("JSON root moet een object zijn.");
      }

      const { __trace, ...rest } = obj as { __trace?: TraceStep[] };

      if (!Array.isArray(__trace)) {
        throw new Error(
          "Geen geldige '__trace' gevonden in JSON. Zorg dat je het volledige Final context-object uit de CLI plakt."
        );
      }

      setParsedContext(rest);
      setTrace(__trace);
      setSelectedStepIndex(0);
      setIsPlaying(false);
    } catch (e: unknown) {
      console.error(e);
      setError(
        e instanceof Error
          ? `Kon JSON niet parsen: ${e.message}`
          : "Onbekende fout bij het parsen van JSON."
      );
      setParsedContext(null);
      setTrace([]);
      setSelectedStepIndex(0);
      setIsPlaying(false);
    }
  };

  // Auto-play: loop door de stappen met nette stop aan het einde
  useEffect(() => {
    if (!isPlaying) return;
    if (trace.length === 0) return;

    // Als we al op de laatste stap staan: stop de playback
    if (selectedStepIndex >= trace.length - 1) {
      setIsPlaying(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSelectedStepIndex((prev) =>
        prev + 1 >= trace.length ? trace.length - 1 : prev + 1
      );
    }, 1200);

    return () => window.clearTimeout(timeoutId);
  }, [isPlaying, selectedStepIndex, trace.length]);

  const handlePlayClick = () => {
    if (trace.length === 0) return;

    // Als hij al speelt → pauzeer
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    // Als we aan het einde staan → opnieuw vanaf 0 beginnen
    if (selectedStepIndex >= trace.length - 1) {
      setSelectedStepIndex(0);
    }

    setIsPlaying(true);
  };

  const handleSelectStep = (index: number) => {
    setSelectedStepIndex(index);
    setIsPlaying(false); // handmatige selectie pauzeert de playback
  };

  const handleOpenInBuilder = () => {
    const currentStep = trace[selectedStepIndex];
    if (!currentStep || !currentStep.agentId) return;
    onJumpToAgentFromTrace?.(currentStep.agentId);
  };

  const selectedStep = trace[selectedStepIndex] ?? null;

  return (
    <div className="p-6 h-screen flex flex-col bg-slate-50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Debug — CLI Trace Viewer</h1>
          <p className="text-slate-500 text-sm">
            Plak hier de <span className="font-mono">Final context</span> JSON uit een
            AIFLOW CLI-uitvoering om elke stap te inspecteren.
          </p>
        </div>

        <button
          onClick={handleOpenInBuilder}
          disabled={!selectedStep}
          className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium shadow-sm ${
            selectedStep
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "bg-slate-200 text-slate-500 cursor-not-allowed"
          }`}
        >
          Open in Workflow Builder
          <ChevronRight className="ml-2" size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Left: JSON input */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
            1. Plak hier de JSON van <span className="font-mono">Final context</span>:
          </label>
          <textarea
            value={rawJson}
            onChange={(e) => setRawJson(e.target.value)}
            placeholder='Bijvoorbeeld: { "ticket_text": "...", "output_agent1": {...}, "__trace": [...] }'
            className="flex-1 min-h-[220px] font-mono text-xs bg-slate-900 text-slate-100 rounded-xl p-3 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
          <div className="mt-2 flex items-center justify-between">
            <div className="text-xs text-emerald-700 flex items-center">
              <span className="font-semibold mr-1">Tip:</span> kopieer alleen het JSON-blok na{" "}
              <span className="font-mono">"Final context":</span> uit de CLI, niet de volledige
              terminal-output.
            </div>
            <button
              onClick={handleParse}
              className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 shadow-sm"
            >
              Parse trace
            </button>
          </div>
          {error && (
            <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </div>

        {/* Right: context overview */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Context overzicht
            </label>
            <button
              onClick={handlePlayClick}
              disabled={trace.length === 0}
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium shadow-sm ${
                trace.length === 0
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : isPlaying
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause size={14} className="mr-1" /> Pause
                </>
              ) : (
                <>
                  <Play size={14} className="mr-1" /> Play trace
                </>
              )}
            </button>
          </div>
          <div className="flex-1 min-h-[220px] bg-white rounded-xl border border-slate-200 p-3 overflow-auto font-mono text-xs text-slate-800">
            {parsedContext ? (
              <pre>{JSON.stringify(parsedContext, null, 2)}</pre>
            ) : (
              <span className="text-slate-400">
                Nog geen context. Plak eerst de JSON en klik op <strong>Parse trace</strong>.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Execution trace */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-baseline space-x-2">
            <h2 className="text-sm font-semibold text-slate-800">Execution Trace</h2>
            <span className="text-xs text-slate-400">
              {trace.length > 0 ? `(${trace.length} steps)` : "(geen steps)"}
            </span>
          </div>
        </div>

        {trace.length === 0 && (
          <div className="text-sm text-slate-400">
            Nog geen trace geladen. Plak een <span className="font-mono">Final context</span>{" "}
            JSON en klik op <strong>Parse trace</strong>.
          </div>
        )}

        {trace.length > 0 && (
          <div className="space-y-4">
            {/* Step indicator pills */}
            <div className="flex items-center space-x-2 mb-2">
              {trace.map((step, idx) => {
                const isActive = idx === selectedStepIndex;
                return (
                  <button
                    key={step.step}
                    onClick={() => handleSelectStep(idx)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    STEP {step.step} · {step.agentName}
                  </button>
                );
              })}
            </div>

            {/* Selected step details */}
            {selectedStep && (
              <div className="space-y-4">
                <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] gap-4">
                  {/* Input Context */}
                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                        Input Context
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium">
                        {selectedStep.agentName} · {selectedStep.role}
                      </span>
                    </div>
                    <pre className="font-mono text-[11px] text-slate-800 overflow-auto max-h-64">
                      {JSON.stringify(selectedStep.inputContext, null, 2)}
                    </pre>
                  </div>

                  {/* Parsed Output */}
                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                        Parsed Output
                      </span>
                    </div>
                    <pre className="font-mono text-[11px] text-slate-800 overflow-auto max-h-64">
                      {JSON.stringify(selectedStep.parsedOutput, null, 2)}
                    </pre>
                  </div>

                  {/* Evaluated rules */}
                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                        Evaluated Rules
                      </span>
                    </div>
                    {selectedStep.rulesEvaluated && selectedStep.rulesEvaluated.length > 0 ? (
                      <div className="space-y-2 text-[11px]">
                        {selectedStep.rulesEvaluated.map((rule) => {
                          const isSelected = rule.id === selectedStep.selectedRuleId;
                          return (
                            <div
                              key={rule.id}
                              className={`rounded-lg border px-2 py-1.5 ${
                                isSelected
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                  : "bg-white border-slate-200 text-slate-700"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[10px]">{rule.id}</span>
                                <span
                                  className={`text-[10px] font-semibold ${
                                    rule.result ? "text-emerald-700" : "text-slate-400"
                                  }`}
                                >
                                  {rule.result ? "TRUE" : "FALSE"}
                                </span>
                              </div>
                              <div className="text-[10px] mt-1 text-slate-500">
                                {rule.from} → {rule.to}
                              </div>
                              <div className="text-[10px] mt-1 font-mono text-slate-600">
                                {rule.condition}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400">
                        Geen regels geëvalueerd voor deze stap.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugTraceViewer;
