# Customer Support Flow — Example (AIFLOW v0.1.0)

This example demonstrates a simple multi-agent AI workflow using the **AIFLOW Standard**.

It contains two agents:

1. **TriageBot**  
   Classifies the customer issue (e.g. "Network Issue", "Billing Issue", etc.)

2. **ResponderBot**  
   Generates a useful support reply based on the classification.

The workflow is defined in a single portable `.aiflow` file following the AIFLOW Standard v0.1.0.

---

## 📦 Files in this folder

- `CustomerSupportFlow_v1.0.0.aiflow`  
- `example-input.json` (optional, you can add this if you want)  
- This `README.md`

---

## ▶️ Running this example using the CLI

Make sure you have installed dependencies:

```bash
npm install
npm run run-flow -- ./examples/CustomerSupportFlow/CustomerSupportFlow_v1.0.0.aiflow

## **2. Voeg een screenshot of GIF ALVAST als placeholder toe**
Zelfs zonder echte demo-gif kun je:

```md
![Example Debug Trace](../docs/images/example-trace.png)