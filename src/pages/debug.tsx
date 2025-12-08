import React, { useState } from "react";

export default function DebugPage() {
  const [trace, setTrace] = useState<any[] | null>(null);

  function handlePaste(e: React.ChangeEvent<HTMLTextAreaElement>) {
    try {
      const parsed = JSON.parse(e.target.value);
      if (Array.isArray(parsed.__trace)) {
        setTrace(parsed.__trace);
      } else {
        alert("JSON has no __trace field.");
      }
    } catch (err) {
      alert("Invalid JSON");
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">AIFLOW Trace Viewer</h1>

      {!trace && (
        <div>
          <p className="mb-2 text-gray-600">
            Paste the final context (the JSON printed by the CLI).
          </p>
          <textarea
            className="w-full h-64 p-3 bg-gray-100 rounded"
            placeholder="Paste the full context JSON here..."
            onChange={handlePaste}
          />
        </div>
      )}

      {trace && (
        <div className="space-y-6">
          {trace.map((t, i) => (
            <div key={i} className="border rounded p-4 bg-white shadow">
              <h2 className="text-xl font-semibold">
                Step {t.step} — {t.agentName} ({t.agentId})
              </h2>

              <div className="mt-2 text-sm text-gray-700">
                <p><strong>Role:</strong> {t.role}</p>
                <p><strong>Selected Rule:</strong> {t.selectedRuleId ?? "None"}</p>
                <p><strong>Next Agent:</strong> {t.nextAgentId ?? "None"}</p>
              </div>

              <details className="mt-3">
                <summary className="cursor-pointer text-blue-600">
                  Input Context
                </summary>
                <pre className="mt-2 bg-gray-100 p-3 rounded text-xs overflow-auto">
{JSON.stringify(t.inputContext, null, 2)}
                </pre>
              </details>

              <details className="mt-3">
                <summary className="cursor-pointer text-blue-600">
                  Raw Output
                </summary>
                <pre className="mt-2 bg-gray-100 p-3 rounded text-xs overflow-auto">
{t.rawOutput}
                </pre>
              </details>

              <details className="mt-3">
                <summary className="cursor-pointer text-blue-600">
                  Parsed Output
                </summary>
                <pre className="mt-2 bg-gray-100 p-3 rounded text-xs overflow-auto">
{JSON.stringify(t.parsedOutput, null, 2)}
                </pre>
              </details>

              <details className="mt-3">
                <summary className="cursor-pointer text-blue-600">
                  Rules Evaluated
                </summary>
                <pre className="mt-2 bg-gray-100 p-3 rounded text-xs overflow-auto">
{JSON.stringify(t.rulesEvaluated, null, 2)}
                </pre>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
