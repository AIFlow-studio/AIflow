import React from 'react';
import {
  BookOpen,
  FileText,
  Server,
  Shield,
  Database,
  Code,
  Cpu,
  Layers,
  Box,
  Terminal,
  Key,
  Activity,
  GitBranch,
  Users,
  Folder,
  FileJson,
  FileCode,
} from 'lucide-react';

const Documentation: React.FC = () => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const NavLink = ({ id, label }: { id: string; label: string }) => (
    <button
      onClick={() => scrollToSection(id)}
      className="block w-full text-left text-slate-600 hover:text-indigo-600 py-1.5 px-2 hover:bg-indigo-50 rounded transition-colors text-sm"
    >
      {label}
    </button>
  );

  return (
    <div className="flex h-full bg-white">
      {/* Sidebar Navigation */}
      <div className="w-72 border-r border-slate-200 overflow-y-auto p-6 hidden lg:block sticky top-0 h-full bg-slate-50">
        <div className="mb-6">
          <h3 className="font-bold text-slate-900 mb-1 flex items-center">
            <div className="mr-2 h-5 w-5 rounded-md overflow-hidden bg-slate-900/80 flex items-center justify-center">
              <img src="/aiflow-logo.svg" alt="AIFLOW logo" className="h-4 w-4" />
            </div>
            AIFLOW Standard
          </h3>
          <p className="text-xs text-slate-500">Official Specification v0.1</p>
        </div>

        <nav className="space-y-1">
          <NavLink id="scope" label="1. Scope & Purpose" />
          <NavLink id="architecture" label="2. Architecture" />
          <NavLink id="schemas" label="3. File Structure & Schemas" />
          <NavLink id="logic" label="4. Logic & Execution" />
          <NavLink id="prompting" label="5. Prompting Standard" />
          <NavLink id="tools" label="6. Tool Standard" />
          <NavLink id="memory" label="7. Memory & State" />
          <NavLink id="security" label="8. Security & Trust" />
          <NavLink id="metadata" label="9. Metadata" />
          <NavLink id="runtime" label="10. Runtime Standard" />
          <NavLink id="bestpractices" label="11. Best Practices" />
          <NavLink id="example" label="12. Example Project" />
          <NavLink id="devguide" label="13. Developer Guide" />
          <NavLink id="roadmap" label="14. Roadmap" />
        </nav>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto p-8 lg:p-16 max-w-5xl text-slate-800 leading-relaxed scroll-smooth">
        {/* HEADER */}
        <div className="mb-12 border-b border-slate-200 pb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center">
              <img src="/aiflow-logo.svg" alt="AIFLOW logo" className="w-9 h-9" />
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              AIFLOW Open Standard
            </h1>
          </div>

          <p className="text-xl text-slate-500 font-light">
            A universal format for defining, sharing, and executing multi-agent AI workflows.
            <br />
            <span className="text-sm font-mono bg-slate-100 px-2 py-1 rounded text-slate-600 mt-2 inline-block">
              Extension: .aiflow
            </span>
          </p>
        </div>

        {/* 1. PURPOSE & SCOPE */}
        <section id="scope" className="mb-16 scroll-mt-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center border-b border-slate-100 pb-2">
            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm mr-3 font-mono">
              01
            </span>
            Purpose and Scope
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-slate-800 mb-2">Problem Statement</h3>
              <p className="text-slate-600 text-sm leading-6">
                AI agents today are fragmented across platforms. AIFLOW standardizes how workflows,
                agents, routing, prompts, tools, and memory are bundled inside a portable
                <code> .aiflow</code> container.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 mb-2">Value Proposition</h3>
              <p className="text-slate-600 text-sm leading-6">
                AIFLOW decouples <em>logic</em> from <em>execution</em>, allowing agents to run locally,
                in the cloud, in pipelines, or inside apps — with full transparency.
              </p>
            </div>
          </div>
        </section>

        {/* 2. ARCHITECTURE */}
        <section id="architecture" className="mb-16 scroll-mt-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center border-b border-slate-100 pb-2">
            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm mr-3 font-mono">
              02
            </span>
            Architecture
          </h2>

          <p className="text-slate-600 mb-6 text-sm">
            An <code>.aiflow</code> file is a ZIP container with a deterministic structure.
          </p>

          <div className="bg-slate-900 text-slate-300 p-6 rounded-xl font-mono text-sm shadow-lg overflow-hidden relative">
            <div className="absolute top-0 right-0 p-2 text-xs text-slate-400">
              Container Structure
            </div>

            <pre className="text-slate-200 text-xs leading-relaxed">
root.aiflow
├── flow.json
├── agents/
│   ├── agent1.json
│   └── agent2.json
├── prompts/
│   ├── system_agent1.txt
│   └── user_template.md
├── tools/
│   ├── registry.json
│   └── custom_script.py
├── memory/
│   └── schema.json
└── metadata/
    ├── manifest.json
    └── license.json
            </pre>
          </div>
        </section>

        {/* 3. FILE STRUCTURE & SCHEMAS */}
        <section id="schemas" className="mb-16 scroll-mt-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center border-b border-slate-100 pb-2">
            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm mr-3 font-mono">
              03
            </span>
            File Specifications
          </h2>

          <h3 className="font-bold text-slate-800 mb-3 flex items-center">
            <GitBranch size={16} className="mr-2" /> flow.json
          </h3>

          <p className="text-sm text-slate-600 mb-3">
            Defines workflow logic.
          </p>

          <pre className="bg-slate-50 border border-slate-200 text-slate-700 p-4 rounded-lg text-xs font-mono overflow-x-auto">
{`{
  "schema_version": "1.0",
  "entry_agent": "classifier_agent",
  "variables": { "language": "en" },
  "logic": [
    {
      "id": "rule_1",
      "from": "classifier_agent",
      "to": "tech_support_agent",
      "condition": "output.classification == 'technical'"
    }
  ]
}`}
          </pre>
        </section>

        {/* 4. LOGIC & EXECUTION MODEL */}
        <section id="logic" className="mb-16 scroll-mt-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center border-b border-slate-100 pb-2">
            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm mr-3 font-mono">
              04
            </span>
            Logic &amp; Execution Model
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm mb-2 flex items-center">
                <Activity size={16} className="mr-2 text-indigo-600" />
                Execution Graph
              </h3>
              <p className="text-xs text-slate-600">
                The runtime follows the <code>logic</code> array in <code>flow.json</code> to
                move from one agent to the next. Each step evaluates conditions in order
                and picks the first matching rule.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm mb-2 flex items-center">
                <Layers size={16} className="mr-2 text-emerald-600" />
                Context Model
              </h3>
              <p className="text-xs text-slate-600">
                Each agent receives a structured context object that includes
                global variables, prior agent outputs, and tool results. Outputs
                are written back under names like <code>output_agent1</code>.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm mb-2 flex items-center">
                <Box size={16} className="mr-2 text-amber-600" />
                Deterministic vs. Non-deterministic
              </h3>
              <p className="text-xs text-slate-600">
                While LLM calls are non-deterministic, the routing logic
                (conditions, tool wiring, variables) should remain deterministic
                and debuggable.
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-600">
            Runtimes are encouraged to emit a detailed <code>__trace</code> structure
            for every execution, capturing the input context, evaluated rules, outputs,
            and next hop at each step. This enables deep inspection in tools like
            AIFLOW Studio without coupling the spec to a particular engine.
          </p>
        </section>

        {/* 5. PROMPTING STANDARD */}
        <section id="prompting" className="mb-16 scroll-mt-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center border-b border-slate-100 pb-2">
            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm mr-3 font-mono">
              05
            </span>
            Prompting Standard
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm mb-2 flex items-center">
                <BookOpen size={16} className="mr-2 text-indigo-600" />
                File-based Prompts
              </h3>
              <p className="text-xs text-slate-600 mb-3">
                Prompts live as separate files under <code>prompts/</code> and
                are referenced from agents by relative path. This keeps prompts
                versionable and reviewable in Git.
              </p>

              <pre className="bg-slate-50 border border-slate-200 rounded p-3 text-[10px] font-mono text-slate-700 overflow-x-auto">
{`{
  "id": "triage_agent",
  "model": "gpt-4.1-mini",
  "prompt": {
    "system_path": "prompts/triage_system.txt",
    "user_template_path": "prompts/triage_user.md"
  }
}`}
              </pre>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm mb-2 flex items-center">
                <FileText size={16} className="mr-2 text-emerald-600" />
                Output Contracts
              </h3>
              <p className="text-xs text-slate-600 mb-2">
                Agents are encouraged to emit JSON when possible, with explicit
                output schemas. This allows downstream agents and tools to rely
                on structured fields instead of brittle string parsing.
              </p>
              <ul className="text-xs text-slate-600 list-disc pl-4 space-y-1">
                <li>Prefer JSON over free-form text for internal routing.</li>
                <li>
                  Use <code>output_format</code> hints like{' '}
                  <code>json_object</code>.
                </li>
                <li>
                  Keep user-facing text separate from machine-readable fields.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 6. TOOL STANDARD */}
        <section id="tools" className="mb-16 scroll-mt-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center border-b border-slate-100 pb-2">
            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm mr-3 font-mono">
              06
            </span>
            Tool Standard
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm mb-2 flex items-center">
                <Code size={16} className="mr-2 text-indigo-600" />
                Tool Registry
              </h3>
              <p className="text-xs text-slate-600 mb-2">
                Tools are registered in a central <code>tools/registry.json</code>.
                Each tool describes its name, parameters, and any runtime binding
                identifiers the engine needs.
              </p>

              <pre className="bg-slate-50 border border-slate-200 rounded p-3 text-[10px] font-mono text-slate-700 overflow-x-auto">
{`{
  "tools": [
    {
      "name": "web_search",
      "description": "Search the web for relevant documentation.",
      "parameters": {
        "type": "object",
        "properties": {
          "query": { "type": "string" }
        },
        "required": ["query"]
      }
    }
  ]
}`}
              </pre>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm mb-2 flex items-center">
                <Cpu size={16} className="mr-2 text-emerald-600" />
                Tool Invocation
              </h3>
              <p className="text-xs text-slate-600 mb-2">
                Agents request tools via model outputs (e.g. tool calls) or via
                explicit runtime APIs. Tool results are written back into the
                context under a predictable structure, accessible to later
                agents.
              </p>

              <ul className="text-xs text-slate-600 list-disc pl-4 space-y-1">
                <li>Runtimes should capture tool calls in the execution trace.</li>
                <li>
                  Tool errors should be structured (error type, message,
                  retriable).
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 7. MEMORY & STATE */}
        <section id="memory" className="mb-16 scroll-mt-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center border-b border-slate-100 pb-2">
            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm mr-3 font-mono">
              07
            </span>
            Memory &amp; State
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm mb-2 flex items-center">
                <Database size={16} className="mr-2 text-indigo-600" />
                Long-term Memory
              </h3>
              <p className="text-xs text-slate-600 mb-2">
                AIFLOW defines a logical <code>memory/</code> directory for
                schemas that describe how runtimes should persist conversational
                state, user profiles, or vector indexes.
              </p>
              <p className="text-xs text-slate-600">
                The spec does not mandate a particular storage engine, but
                encourages clear contracts for what persists across executions.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm mb-2 flex items-center">
                <Activity size={16} className="mr-2 text-emerald-600" />
                Ephemeral State
              </h3>
              <p className="text-xs text-slate-600">
                Per-execution state (like intermediate outputs) lives inside the
                runtime context and <code>__trace</code>. This should be
                reproducible via logs, but is not required to be persisted
                beyond the lifetime of a single flow run.
              </p>
            </div>
          </div>
        </section>

        {/* 8. SECURITY & TRUST */}
        <section id="security" className="mb-16 scroll-mt-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center border-b border-slate-100 pb-2">
            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm mr-3 font-mono">
              08
            </span>
            Security &amp; Trust
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm mb-2 flex items-center">
                <Shield size={16} className="mr-2 text-indigo-600" />
                Isolation
              </h3>
              <p className="text-xs text-slate-600">
                Runtimes should isolate tool execution from prompt logic to prevent
                arbitrary code execution from untrusted model output.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm mb-2 flex items-center">
                <Key size={16} className="mr-2 text-amber-600" />
                Secrets
              </h3>
              <p className="text-xs text-slate-600">
                API keys and credentials must never be stored inside{' '}
                <code>.aiflow</code> containers. Runtimes are responsible for secure
                secret injection at execution time.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm mb-2 flex items-center">
                <Users size={16} className="mr-2 text-emerald-600" />
                Auditability
              </h3>
              <p className="text-xs text-slate-600">
                Execution traces should include enough metadata to answer “who ran
                what, when, with which tools” — without exposing sensitive payloads.
              </p>
            </div>
          </div>
        </section>

        {/* 9. METADATA */}
        <section id="metadata" className="mb-16 scroll-mt-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center border-b border-slate-100 pb-2">
            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm mr-3 font-mono">
              09
            </span>
            Metadata
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm mb-2 flex items-center">
                <FileCode size={16} className="mr-2 text-indigo-600" />
                manifest.json
              </h3>

              <p className="text-xs text-slate-600 mb-3">
                Contains high-level project metadata.
              </p>

              <pre className="bg-slate-50 border border-slate-200 p-3 rounded text-[10px] font-mono text-slate-700 overflow-x-auto">
{`{
  "name": "CustomerSupportFlow",
  "version": "1.0.0",
  "aiflow_version": "0.1.0",
  "authors": ["Your Name"],
  "license": "MIT"
}`}
              </pre>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm mb-2 flex items-center">
                <FileText size={16} className="mr-2 text-emerald-600" />
                Tags &amp; Capabilities
              </h3>

              <p className="text-xs text-slate-600 mb-2">
                Workflows may declare tags like <code>domain: support</code>,{' '}
                <code>modality: text</code>, or <code>requires: tools</code>.
              </p>
              <p className="text-xs text-slate-600">
                Useful for search, cataloging, and registries.
              </p>
            </div>
          </div>
        </section>

        {/* 10. RUNTIME STANDARD */}
        <section id="runtime" className="mb-16 scroll-mt-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center border-b border-slate-100 pb-2">
            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm mr-3 font-mono">
              10
            </span>
            Runtime Standard
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm mb-2 flex items-center">
                <Server size={16} className="mr-2 text-indigo-600" />
                Engine Responsibilities
              </h3>
              <p className="text-xs text-slate-600">
                A compliant runtime can load, validate, and execute a{' '}
                <code>.aiflow</code> project, producing both a final context and a
                detailed execution trace.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm mb-2 flex items-center">
                <Terminal size={16} className="mr-2 text-emerald-600" />
                CLI Integration
              </h3>
              <p className="text-xs text-slate-600">
                Command-line interfaces are considered runtime environments as long
                as they follow validation, execution, and tracing semantics.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm mb-2 flex items-center">
                <Cpu size={16} className="mr-2 text-amber-600" />
                Compatibility
              </h3>
              <p className="text-xs text-slate-600">
                Runtimes should declare which <code>aiflow_version</code> they
                support and gracefully reject incompatible workflows.
              </p>
            </div>
          </div>
        </section>

        {/* 11. BEST PRACTICES */}
        <section id="bestpractices" className="mb-16 scroll-mt-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center border-b border-slate-100 pb-2">
            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm mr-3 font-mono">
              11
            </span>
            Best Practices &amp; Guidelines
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-2 flex items-center text-sm">
                <Activity size={16} className="mr-2 text-emerald-600" />
                Performance Optimization
              </h4>

              <ul className="text-xs text-slate-600 list-disc pl-4 space-y-2">
                <li>
                  <strong>Minimize Context:</strong> Pass only essential variables.
                </li>
                <li>
                  <strong>Parallelize:</strong> Branch logic to run agents in
                  parallel.
                </li>
                <li>
                  <strong>Cache Tools:</strong> For deterministic tool calls.
                </li>
              </ul>
            </div>

            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-2 flex items-center text-sm">
                <Terminal size={16} className="mr-2 text-amber-600" />
                Debugging Strategies
              </h4>

              <ul className="text-xs text-slate-600 list-disc pl-4 space-y-2">
                <li>
                  <strong>Trace IDs:</strong> Ensure flows have unique IDs.
                </li>
                <li>
                  <strong>Intermediate States:</strong> Capture all outputs in a
                  debug mode.
                </li>
                <li>
                  <strong>Mocking:</strong> Replace LLM calls with static responses
                  for development.
                </li>
              </ul>
            </div>
          </div>

          <h3 className="font-bold text-slate-800 mb-4 text-sm">Agent Role Patterns</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="border border-slate-200 p-4 rounded-lg">
              <strong className="block text-indigo-700 mb-2">
                The Triage Pattern
              </strong>
              <p className="text-slate-500 text-xs">
                Entry agent classifies input → routes to specialized agents.
              </p>
            </div>

            <div className="border border-slate-200 p-4 rounded-lg">
              <strong className="block text-indigo-700 mb-2">
                The Sequential Chain
              </strong>
              <p className="text-slate-500 text-xs">
                Linear execution where Agent A feeds Agent B.
              </p>
            </div>

            <div className="border border-slate-200 p-4 rounded-lg">
              <strong className="block text-indigo-700 mb-2">
                The Supervisor
              </strong>
              <p className="text-slate-500 text-xs">
                Manager agent breaks tasks into sub-tasks & delegates.
              </p>
            </div>
          </div>
        </section>

        {/* 12. EXAMPLE PROJECT */}
        <section id="example" className="mb-16 scroll-mt-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center border-b border-slate-100 pb-2">
            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm mr-3 font-mono">
              12
            </span>
            Example Project: Customer Support
          </h2>

          <p className="text-sm text-slate-600 mb-6">
            Reference implementation using the <strong>Triage Pattern</strong>.
          </p>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/3">
              <h4 className="font-bold text-slate-800 text-sm mb-3">
                Directory Structure
              </h4>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-xs text-slate-600">
                <div className="flex items-center text-indigo-600 font-bold mb-2">
                  <Folder size={14} className="mr-2" />
                  customer_support/
                </div>

                <div className="pl-4 flex items-center mb-1">
                  <FileJson size={14} className="mr-2 text-slate-400" />
                  flow.json
                </div>

                <div className="pl-4 flex items-center mb-1">
                  <Folder size={14} className="mr-2 text-emerald-500" />
                  agents/
                </div>

                <div className="pl-8 mb-1">├── triage.json</div>
                <div className="pl-8 mb-1">├── tech_solver.json</div>
                <div className="pl-8 mb-3">└── responder.json</div>

                <div className="pl-4 flex items-center mb-1">
                  <Folder size={14} className="mr-2 text-amber-500" />
                  prompts/
                </div>

                <div className="pl-8 mb-1">├── classify.txt</div>
                <div className="pl-8 mb-3">└── tone_guide.md</div>

                <div className="pl-4 flex items-center mb-1">
                  <Folder size={14} className="mr-2 text-blue-500" />
                  tools/
                </div>

                <div className="pl-8">└── registry.json</div>
              </div>
            </div>

            <div className="lg:w-2/3 space-y-4">
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <h4 className="font-bold text-slate-800 text-sm mb-2">
                  Agent Roles
                </h4>

                <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
                  <li>
                    <strong>TriageBot (Classifier):</strong> Classifies tickets.
                  </li>
                  <li>
                    <strong>TechSolver (Engineer):</strong> Uses diagnostic tools to
                    find fixes.
                  </li>
                  <li>
                    <strong>Responder (Copywriter):</strong> Generates polished
                    replies for end users.
                  </li>
                </ul>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <h4 className="font-bold text-slate-800 text-sm mb-2">
                  Key Logic (flow.json)
                </h4>

                <pre className="bg-slate-50 p-2 rounded text-xs font-mono text-slate-600 overflow-x-auto">
{`"logic": [
  { "from": "TriageBot", "to": "TechSolver", "condition": "category == 'technical'" },
  { "from": "TriageBot", "to": "Responder", "condition": "category == 'general'" }
]`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* 13. DEVELOPER GUIDE */}
        <section id="devguide" className="mb-16 scroll-mt-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center border-b border-slate-100 pb-2">
            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm mr-3 font-mono">
              13
            </span>
            Developer Guide
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-slate-800 mb-3 text-sm">
                1. Loading an .aiflow File
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase mb-2">
                    Python Runtime (future)
                  </div>

                  <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg text-xs font-mono overflow-x-auto">
{`from aiflow_core import FlowEngine

engine = FlowEngine.load("./CustomerSupport.aiflow")
result = engine.run(input={"ticket": "My wifi is broken"}, stream=True)`}
                  </pre>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase mb-2">
                    Node.js Runtime (future)
                  </div>

                  <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg text-xs font-mono overflow-x-auto">
{`import { AIFlowRuntime } from '@aiflow/node';

const runtime = new AIFlowRuntime();
await runtime.load('./CustomerSupport.aiflow');

const result = await runtime.execute({
  ticket: "My wifi is broken"
});

console.log(result.final_output);`}
                  </pre>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 mb-3 text-sm">
                2. Validating a Workflow
              </h3>

              <ul className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-700 space-y-2 list-disc pl-5">
                <li>
                  <strong>Schema Check:</strong> Validate <code>flow.json</code>{' '}
                  against the AIFLOW JSON Schema.
                </li>
                <li>
                  <strong>Graph Integrity:</strong> Ensure no circular routes exists
                  unless explicitly allowed.
                </li>
                <li>
                  <strong>Tool Availability:</strong> Verify tools referenced in
                  agents exist in <code>tools/registry.json</code>.
                </li>
                <li>
                  <strong>Asset Links:</strong> Confirm prompt file paths resolve
                  correctly.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 14. ROADMAP */}
        <section id="roadmap" className="mb-28 scroll-mt-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center border-b border-slate-100 pb-2">
            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm mr-3 font-mono">
              14
            </span>
            Possible Extensions &amp; Roadmap
          </h2>

          <div className="space-y-6">
            <div className="flex items-start bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold mr-4 mt-0.5">
                v1.1
              </span>
              <div>
                <strong className="text-slate-800 text-sm">UI Schemas</strong>
                <p className="text-xs text-slate-600 mt-1">
                  Standardization for <code>ui_schema.json</code> enabling rich UI
                  input components like forms and selectors.
                </p>
              </div>
            </div>

            <div className="flex items-start bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-bold mr-4 mt-0.5">
                v1.2
              </span>
              <div>
                <strong className="text-slate-800 text-sm">
                  Plugin Bundles &amp; Events
                </strong>
                <p className="text-xs text-slate-600 mt-1">
                  Support for distributing tool bundles and introducing event
                  hooks (e.g. <code>onTokenStream</code>, <code>onToolStart</code>)
                  for richer runtime observability.
                </p>
              </div>
            </div>

            <div className="flex items-start bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold mr-4 mt-0.5">
                v2.0
              </span>
              <div>
                <strong className="text-slate-800 text-sm">Multi-Modal Flow</strong>
                <p className="text-xs text-slate-600 mt-1">
                  First-class support for audio/video streams, enabling real-time
                  multimodal agent workflows.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Documentation;
