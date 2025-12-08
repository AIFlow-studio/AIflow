import { describe, it, expect } from "vitest";
import { evaluateCondition } from "../evaluateCondition.mts";

describe("evaluateCondition", () => {
  const ctx = {
    context: {
      user: "John",
      ticket_text: "My wifi is broken",
    },
    output: {
      classification: "Network Issue",
      priority: "High",
    },
    agentId: "agent1",
  };

  it("returns true for simple equality expressions", () => {
    expect(
      evaluateCondition("classification == 'Network Issue'", ctx)
    ).toBe(true);

    expect(
      evaluateCondition('classification == "Network Issue"', ctx)
    ).toBe(true);

    expect(
      evaluateCondition("priority == 'High'", ctx)
    ).toBe(true);
  });

  it("returns false for non-matching equality expressions", () => {
    expect(
      evaluateCondition("classification == 'Billing Issue'", ctx)
    ).toBe(false);

    expect(
      evaluateCondition("priority == 'Low'", ctx)
    ).toBe(false);
  });

  it("supports contains() with output and context fields", () => {
    // Zoeken in output.classification
    expect(
      evaluateCondition("contains(classification, 'Network')", ctx)
    ).toBe(true);

    expect(
      evaluateCondition("contains(classification, 'Billing')", ctx)
    ).toBe(false);

    // Zoeken in context.ticket_text
    expect(
      evaluateCondition("contains(ticket_text, 'wifi')", ctx)
    ).toBe(true);

    expect(
      evaluateCondition("contains(ticket_text, 'printer')", ctx)
    ).toBe(false);
  });

  it("supports nested keys", () => {
    const nestedCtx = {
      context: {
        output_agent1: {
          ticket_type: "billing",
        },
      },
      output: {},
      agentId: "agent1",
    };

    expect(
      evaluateCondition("output_agent1.ticket_type == 'billing'", nestedCtx)
    ).toBe(true);

    expect(
      evaluateCondition("output_agent1.ticket_type == 'support'", nestedCtx)
    ).toBe(false);
  });

  it("returns false for unknown or invalid expressions", () => {
    // Tot v0.2 zijn numeric compares nog niet geïmplementeerd: moeten false teruggeven
    expect(
      evaluateCondition("foo > 3", ctx)
    ).toBe(false);

    // Volledig onbekende syntax
    expect(
      evaluateCondition("weird stuff()", ctx)
    ).toBe(false);
  });
});
