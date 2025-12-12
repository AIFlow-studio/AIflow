// studio/runtime/autoRewriteExpression.ts

export interface KnownField {
  id: string;          // stable id (we gebruiken meestal gewoon het pad)
  path: string;        // b.v. "ticket.type"
  label: string;       // user-facing label (mag gelijk zijn aan path)
  aliases?: string[];  // b.v. ["ticket_type", "type"]
}

export interface RewriteChange {
  from: string;
  to: string;
  score: number; // 0..1 "confidence"
}

export interface AutoRewriteResult {
  original: string;
  rewritten: string;
  changes: RewriteChange[];
}

/**
 * Heel simpele tokeniser: we zoeken naar identifier-achtige stukjes
 * (letters, cijfers, underscore, dot) en laten dingen in strings met rust.
 */
function findCandidateTokens(expr: string): { token: string; start: number; end: number }[] {
  const regex = /[A-Za-z_][A-Za-z0-9_.]*/g;
  const tokens: { token: string; start: number; end: number }[] = [];

  let match: RegExpExecArray | null;
  while ((match = regex.exec(expr)) !== null) {
    const token = match[0];
    const start = match.index;
    const end = start + token.length;

    const before = expr[start - 1];
    const after = expr[end];

    // Sla dingen binnen quotes over: 'ticket_type' of "ticket_type"
    if (before === "'" || before === '"' || after === "'" || after === '"') {
      continue;
    }

    tokens.push({ token, start, end });
  }

  return tokens;
}

// Kleine stopwoordenlijst – dit zijn geen velden
const RESERVED = new Set([
  'true',
  'false',
  'null',
  'in',
  'and',
  'or',
  'not',
  'undefined',
  'NaN',
  'always',
]);

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

/**
 * Heel simpele similarity:
 * - exacte match → 1.0
 * - zelfde zonder underscores/dots → 0.9
 * - laatste segment matcht → 0.7
 */
function fieldSimilarity(candidate: string, field: KnownField): number {
  const cNorm = normalize(candidate);
  const variants = new Set<string>();

  variants.add(field.path);
  variants.add(field.path.replace(/\./g, '_'));
  variants.add(field.path.replace(/_/g, '.'));

  if (field.aliases) {
    field.aliases.forEach((a) => {
      variants.add(a);
      variants.add(a.replace(/\./g, '_'));
      variants.add(a.replace(/_/g, '.'));
    });
  }

  const normalizedVariants = Array.from(variants).map((v) => normalize(v));

  // Exact match
  if (normalizedVariants.includes(cNorm)) return 1.0;

  // Achtergrond: haal dots en underscores weg
  const cFlat = cNorm.replace(/[._]/g, '');
  if (
    normalizedVariants.some(
      (v) => v.replace(/[._]/g, '') === cFlat,
    )
  ) {
    return 0.9;
  }

  // Laatste segment / token match
  const lastSegment = cNorm.split(/[._]/).pop() || '';
  if (!lastSegment) return 0;

  const lastMatches = normalizedVariants.some((v) => {
    const seg = v.split(/[._]/).pop() || '';
    return seg === lastSegment;
  });

  if (lastMatches) return 0.7;

  return 0;
}

/**
 * Bepaal voor één token wat de beste field-match is.
 */
function pickBestField(candidate: string, fields: KnownField[]): RewriteChange | null {
  if (RESERVED.has(normalize(candidate))) return null;

  let best: { field: KnownField; score: number } | null = null;

  for (const f of fields) {
    const score = fieldSimilarity(candidate, f);
    if (score <= 0) continue;
    if (!best || score > best.score) {
      best = { field: f, score };
    }
  }

  if (!best || best.score < 0.65) {
    // onder deze drempel voelen we het te onzeker
    return null;
  }

  return {
    from: candidate,
    to: best.field.path,
    score: best.score,
  };
}

/**
 * Kern-API voor Studio:
 * - neemt een condition expression
 * - krijgt een lijst bekende velden (uit Rule Inspector / Condition Debugger)
 * - geeft een voorstel terug met:
 *   - originele string
 *   - herschreven string
 *   - lijst changes (from → to, met score)
 */
export function autoRewriteExpression(
  expression: string,
  knownFields: KnownField[],
): AutoRewriteResult | null {
  if (!expression || !knownFields || knownFields.length === 0) {
    return null;
  }

  const tokens = findCandidateTokens(expression);
  if (!tokens.length) return null;

  const changes: RewriteChange[] = [];

  for (const t of tokens) {
    const change = pickBestField(t.token, knownFields);
    if (!change) continue;

    // voorkom dubbele entries met hetzelfde "from"
    const already = changes.find((c) => c.from === change.from && c.to === change.to);
    if (!already || already.score < change.score) {
      if (already) {
        already.score = change.score;
      } else {
        changes.push(change);
      }
    }
  }

  if (!changes.length) return null;

  // Bouw de nieuwe string door van achter naar voren te replacen
  let rewritten = expression;
  // om overlapping indices te voorkomen: sorteer op start-index
  const indexed: { change: RewriteChange; start: number; end: number }[] = [];

  for (const t of tokens) {
    const change = changes.find((c) => c.from === t.token);
    if (!change) continue;
    indexed.push({ change, start: t.start, end: t.end });
  }

  indexed.sort((a, b) => b.start - a.start); // van rechts naar links

  for (const { change, start, end } of indexed) {
    rewritten =
      rewritten.slice(0, start) + change.to + rewritten.slice(end);
  }

  if (rewritten === expression) {
    return null;
  }

  return {
    original: expression,
    rewritten,
    changes,
  };
}
