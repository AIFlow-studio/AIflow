# AIFlow v0.1 — Completion Checklist

_Doel: v0.1 als “Open Standard Preview” netjes afronden, zonder nieuwe features, met maximale duidelijkheid voor gebruikers._

---

## 1. Spec & Versioning

- [ ] **Versie duidelijk maken in spec**
  - [ ] Bovenaan `spec/aiflow-v0.1.md` staat duidelijk: **“AIFLOW Standard v0.1 (frozen)”**
  - [ ] Versieveld(en) in JSON-voorbeelden gebruiken consequent `0.1.0` waar relevant
  - [ ] In `AIFLOW.md` wordt v0.1 benoemd als huidige standaard

- [ ] **README versie-informatie**
  - [ ] README bevat een korte sectie:  
        `Current stable: AIFLOW Standard v0.1 (Runtime/Studio v0.1.x)`
  - [ ] Link naar de spec (`AIFLOW.md` / `spec/aiflow-v0.1.md`) staat duidelijk in README

---

## 2. Runtime & Tests

- [ ] **CLI-runtime**
  - [ ] Minstens één voorbeeldflow (bijv. `CustomerSupportFlow_v1.0.0.aiflow`) runt succesvol met:
        ```bash
        npm run run-flow -- ./examples/CustomerSupportFlow/CustomerSupportFlow_v1.0.0.aiflow
        ```
  - [ ] CLI-foutmeldingen zijn begrijpelijk als er geen API key is / model faalt

- [ ] **Browser-runtime (Studio)**
  - [ ] Een voorbeeldflow is te draaien via de Studio (in-browser runner)
  - [ ] Basisfouten (geen API key, invalid input) geven zichtbare, duidelijke feedback in de UI

- [ ] **Tests & CI**
  - [ ] `npm test` draait lokaal zonder fouten
  - [ ] GitHub Actions (CI) draait succesvol op `main` (tests + build)
  - [ ] README bevat een CI-statusbadge (optioneel, maar aanbevolen)

---

## 3. Studio & Debug

- [ ] **Workflow Builder**
  - [ ] Agents kunnen worden aangemaakt, verplaatst en verwijderd
  - [ ] Edges (logic rules) kunnen worden gecreëerd tussen agents
  - [ ] Project-metadata (naam, beschrijving, versie) is aanpasbaar

- [ ] **Prompts / Agents**
  - [ ] Prompts zijn te bewerken en op te slaan binnen de Studio
  - [ ] Ten minste één template-agent is aanwezig (bijv. classifier / responder)

- [ ] **Debug Trace Viewer**
  - [ ] Final context JSON uit de CLI is succesvol te plakken en te parsen
  - [ ] Per step worden context, output en rules netjes weergegeven
  - [ ] De “play trace”-functionaliteit werkt (steps automatisch doorlopen)
  - [ ] Vanuit de debug-view is de link naar de Workflow Builder logisch (bijv. “Open in Workflow Builder”)

---

## 4. Examples

- [ ] **Customer Support Flow**
  - [ ] Bestaat in `examples/CustomerSupportFlow/` met:
        - [ ] `.aiflow`-bestand
        - [ ] `README.md` met uitleg en run-instructies (CLI + Studio indien relevant)
  - [ ] Flow is reproduceerbaar uitvoerbaar (met geldige API key)

- [ ] **(Optioneel) Tweede example**
  - [ ] Eenvoudige tweede use case (bijv. Lead Qualification) is aanwezig als voorbeeld
  - [ ] Duidelijk gemarkeerd als voorbeeld, niet als officiële “template”

---

## 5. Docs & Website

- [ ] **AIFLOW.md / Spec-landing**
  - [ ] `AIFLOW.md` beschrijft:
        - [ ] Visie & positionering
        - [ ] Repos & structuur
        - [ ] Samenvatting van de standaard v0.1
        - [ ] Huidige status (runtime, studio, debug)
        - [ ] Korte roadmap (v0.2, v0.3, …)

- [ ] **Website / Docs hub**
  - [ ] Landing page legt in eenvoudige taal uit wat AIFlow is
  - [ ] Er is een link naar:
        - [ ] GitHub repo
        - [ ] Docs / spec
        - [ ] Minstens één voorbeeldflow / demo
  - [ ] OG-image / banner is ingesteld zodat links mooi delen op social

---

## 6. GitHub & Community

- [ ] **Releases & tags**
  - [ ] Tag `v0.1.0` bestaat en is gekoppeld aan een release
  - [ ] Release notes leggen kort uit:
        - [ ] Wat v0.1 is (Open Standard Preview)
        - [ ] Belangrijkste features (runtime, studio, debug, examples)
        - [ ] Link naar docs / spec

- [ ] **README polish**
  - [ ] Bovenaan:
        - [ ] Korte elevator pitch (1–2 zinnen)
        - [ ] Links naar repo, docs, website
        - [ ] Eventueel één screenshot (Studio of Debug viewer)
  - [ ] `Getting Started`-sectie met:
        - [ ] Installatie
        - [ ] Studio starten
        - [ ] Example flow runnen via CLI

- [ ] **Community entrypoints**
  - [ ] Contact / feedbackkanaal vermeld (issue tracker, X/LinkedIn, email)
  - [ ] Korte `Contributing`-sectie aanwezig

---

## 7. Optioneel: v0.1.1 (Docs / Bugfix Release)

_Alleen doen als er nog kleine dingen worden rechtgetrokken nadat v0.1 live is:_

- [ ] Kleinere bugfix(es) of doc-updates toegevoegd
- [ ] Nieuwe tag `v0.1.1` aangemaakt
- [ ] Release notes beschrijven duidelijk dat er geen breaking changes zijn
