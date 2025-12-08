export type ConditionContext = {
  context: Record<string, any>;
  output: any;
  agentId?: string | null;
};

function getValue(name: string, ctx: ConditionContext): any {
  // Eerst uit de laatste agent-output
  if (ctx.output && typeof ctx.output === "object" && name in ctx.output) {
    return ctx.output[name];
  }

  // Dan uit de globale context (flow.variables, eerdere outputs, etc.)
  if (name in ctx.context) {
    return ctx.context[name];
  }

  return undefined;
}

/**
 * Evalueer een simpele condition-string tegen de context.
 *
 * Ondersteunt:
 *  - foo == 'bar'
 *  - foo != "bar"
 *  - contains(foo, 'bar')
 *
 * Alles wat niet herkend wordt → false.
 */
export function evaluateCondition(
  expression: string | undefined | null,
  ctx: ConditionContext
): boolean {
  if (!expression || typeof expression !== "string") {
    // Geen condition betekent "altijd waar"
    return true;
  }

  const expr = expression.trim();

  // contains(foo, 'bar')
  if (expr.startsWith("contains(") && expr.endsWith(")")) {
    const inner = expr.slice("contains(".length, -1).trim();
    const parts = inner.split(",");
    if (parts.length === 2) {
      const varName = parts[0].trim();
      const literalRaw = parts[1].trim();

      const match = literalRaw.match(/^(['"])(.*)\1$/);
      const literal = match ? match[2] : literalRaw;

      const value = getValue(varName, ctx);
      if (typeof value === "string") {
        return value.toLowerCase().includes(literal.toLowerCase());
      }
    }
    return false;
  }

  // foo == 'bar'  of  foo != "bar"
  const simpleCmp = expr.match(
    /^([a-zA-Z0-9_]+)\s*([=!]=)\s*(['"])(.*)\3$/
  );

  if (simpleCmp) {
    const [, varName, op, , literal] = simpleCmp;
    const value = getValue(varName, ctx);

    const valueStr =
      value === undefined || value === null ? "" : String(value);

    if (op === "==") {
      return valueStr === literal;
    }
    if (op === "!=") {
      return valueStr !== literal;
    }
  }

  // Onbekend formaat → voor nu niet matchen
  return false;
}
