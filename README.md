# AIFLOW Studio

![CI Status](https://github.com/AIFlow-studio/AIflow/actions/workflows/ci.yml/badge.svg)
![Version](https://img.shields.io/badge/AIFLOW-v0.1.0-blue)

**Visual AI Agent Workflows — Design · Run · Debug**

AIFLOW is a visual + code-native framework for building multi‑agent AI workflows.

- 🧠 **Workflow Builder** – design your agents and routing logic as a graph  
- ✍️ **File‑based Prompts** – prompts live as files in your repo and are linked to agents  
- 🧰 **Tools Registry & Runtime** – define tools once, reuse them across agents  
- 💻 **CLI Runtime** – execute `.aiflow` projects locally or in CI  
- 🐛 **Debug Trace Viewer** – inspect each step of a CLI run with full execution context  
- ✨ **Graph Highlighting** – jump from a CLI trace into the visual workflow path

AIFLOW is built for developers who want **clear, debuggable multi‑agent systems** without hiding anything behind SaaS black boxes.

---

## 🌟 Current Stable Version

**AIFLOW Standard:** v0.1 — *Open Standard Preview*  
**Runtime & Studio:** v0.1.x  
**Next Version:** v0.2 — currently in active development on `main`  

For upcoming features (Condition Engine v0.2, Validator v0.2, Tools & Memory), see the  
➡️ **Roadmap section in [`AIFLOW.md`](./AIFLOW.md)**

---

## 🔗 Links

- 🧩 **Standard & Master Document:** [`AIFLOW.md`](./AIFLOW.md)  
- 📘 **Spec folder:** [`./spec`](./spec)  
- 🌐 **Docs & Website:** https://aiflow-studio.github.io/AIflow/  

---

## ✨ What’s in this repo?

This repository contains:

- The **AIFLOW Standard v0.1** spec (`./AIFLOW.md` and `./spec/aiflow-v0.1.md`)
- **AIFLOW Studio** (the web UI)
- The **CLI runtime** for running `.aiflow` projects
- The early **condition engine**, **validator**, and **tools runtime**
- Example projects under `./examples`

Everything is designed to be **git‑friendly**: flows, agents, prompts, tools and rules all live as files.

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/AIFlow-studio/AIflow.git
cd AIflow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run AIFLOW Studio (web UI)

```bash
npm run dev
```

Then open the URL shown in your terminal (usually `http://localhost:3000`).  
From here you can:

- Edit workflows visually in the **Workflow Builder**
- Configure **agents**, **prompts**, and **tools**
- Open the **Debug – CLI Trace Viewer**

---

## 🧪 Running an example flow via CLI

This repo ships with a fully‑worked example: **CustomerSupportFlow**.

From the project root:

```bash
npm run run-flow -- ./examples/CustomerSupportFlow/CustomerSupportFlow_v1.0.0.aiflow
```

You’ll see:

- Each agent step (e.g. `TriageBot`, `ResponderBot`)
- Raw model output
- Parsed output
- Selected routing rule and next agent

At the end, the CLI prints the **Final context JSON** with a `__trace` field.

Copy that JSON, then:

1. Open **Debug → CLI Trace Viewer** in AIFLOW Studio  
2. Paste the final context JSON  
3. Click **Parse trace** to inspect each step  
4. Use **Highlight full path in Workflow** to light up the executed path in the graph

---

## 🧠 Key Components

### Condition Engine (early v0.1)

An early expression engine for routing logic:

- Supports simple rule evaluation on context fields  
- Used to decide which edge/agent to follow next in a flow  
- A richer expression engine (nested keys, `contains()`, comparison operators) is being developed for v0.2  

See `runtime/core` for the current implementation and tests.

### Flow Validator (early v0.1)

The validator is the component that checks whether a `.aiflow` project is structurally sound.

- Performs basic structural checks on flows and agents  
- Integrates with the CLI and Studio to give early feedback on broken flows  
- A more complete validator (including advanced condition and tools validation) is planned for v0.2+

### Tools Runtime

- Central registry for tools defined in TypeScript  
- Runs tools for a given agent step during a flow  
- Makes tool input/output available in the agent context and trace  

Tools become a first‑class part of the standard in upcoming versions.

---

## 🐛 Debugging & Traces

The **Debug – CLI Trace Viewer** is designed to make multi‑agent behaviour understandable:

- See **Input Context**, **Parsed Output**, and **Evaluated Rules** per step  
- Clearly marked **selected rule** and **next agent**  
- Step badges (`STEP 0`, `STEP 1`, …) plus visual highlighting in the graph  
- Full‑path highlighting across the workflow

Instead of guessing why a route was taken, you can see exactly which condition fired.

---

## 📁 Project Structure (high‑level)

```text
core/              # Core runtime & spec helpers
runtime/           # CLI runtime, condition engine, validator, tools runtime
spec/              # AIFLOW Standard v0.x spec
studio/            # React app (AIFLOW Studio UI)
examples/          # Example flows, including CustomerSupportFlow
docs/screenshots/  # UI screenshots & marketing assets
```

---

## 🛠 Tech Stack

- **TypeScript / Node.js** – runtime & tooling  
- **React** – Studio UI  
- **Vitest** – tests for core logic and CLI  
- **GitHub Actions** – CI for build and tests

---

## 🤝 Contributing

Contributions are very welcome.

- Found a bug or have an idea? → open an **Issue**  
- Want to add an example flow or tool? → open a **Pull Request**  

A `CONTRIBUTING.md` will be added as the project matures.

---

## 📜 License

AIFLOW is released under the **MIT License**. See [`LICENSE`](./LICENSE) for details.

---

## 💬 Questions / Feedback

For now, the easiest way to reach the project is via:

- X (Twitter): **[@aiflowbuild](https://x.com/aiflowbuild)**  
- GitHub Issues on this repo

If you’re building something cool on top of AIFLOW, we’d love to see it. 🚀
