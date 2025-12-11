// ---------------------------------------------------------
// Condition Engine V2 — with full trace + "in" operator
// + smart auto-context generation
// ---------------------------------------------------------

export interface TraceNode {
  id: string;
  type: string; // "BINARY" | "UNARY" | "FIELD" | "LITERAL" | "ARRAY" | "ERROR"
  raw: string;
  operator?: string;
  value: any;
  children?: TraceNode[];
  shortCircuited?: boolean;
  error?: string;
}

export interface ReferencedField {
  path: string; // e.g. "customer.age"
  value: any;
}

export interface ConditionTrace {
  conditionId: string;
  runId: string;
  expression: string;
  expressionWithValues: string;
  result: boolean | null;
  root: TraceNode;
  referencedFields: ReferencedField[];
  debugContext?: any;
}

// ---------------------------------------------------------
// Tokenizer
// ---------------------------------------------------------

type TokenType =
  | 'NUMBER'
  | 'STRING'
  | 'BOOLEAN'
  | 'NULL'
  | 'IDENT'
  | 'OP'
  | 'LPAREN'
  | 'RPAREN'
  | 'LBRACK'
  | 'RBRACK'
  | 'COMMA';

interface Token {
  type: TokenType;
  value: string;
}

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  const isAlpha = (c: string) => /[A-Za-z_]/.test(c);
  const isNum = (c: string) => /[0-9]/.test(c);

  while (i < expr.length) {
    const c = expr[i];

    if (c === ' ' || c === '\n' || c === '\t') {
      i++;
      continue;
    }

    // Strings
    if (c === "'" || c === '"') {
      const quote = c;
      i++;
      let str = '';
      while (i < expr.length && expr[i] !== quote) {
        str += expr[i];
        i++;
      }
      i++; // skip closing quote
      tokens.push({ type: 'STRING', value: str });
      continue;
    }

    // Numbers
    if (isNum(c)) {
      let num = c;
      i++;
      while (i < expr.length && (isNum(expr[i]) || expr[i] === '.')) {
        num += expr[i];
        i++;
      }
      tokens.push({ type: 'NUMBER', value: num });
      continue;
    }

    // Identifiers / keywords
    if (isAlpha(c)) {
      let ident = c;
      i++;
      while (i < expr.length && /[A-Za-z0-9_.]/.test(expr[i])) {
        ident += expr[i];
        i++;
      }

      if (ident === 'true' || ident === 'false') {
        tokens.push({ type: 'BOOLEAN', value: ident });
      } else if (ident === 'null') {
        tokens.push({ type: 'NULL', value: ident });
      } else if (ident === 'in') {
        tokens.push({ type: 'OP', value: 'in' });
      } else {
        tokens.push({ type: 'IDENT', value: ident });
      }
      continue;
    }

    // Brackets / parentheses / comma
    if (c === '(') {
      tokens.push({ type: 'LPAREN', value: '(' });
      i++;
      continue;
    }
    if (c === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i++;
      continue;
    }
    if (c === '[') {
      tokens.push({ type: 'LBRACK', value: '[' });
      i++;
      continue;
    }
    if (c === ']') {
      tokens.push({ type: 'RBRACK', value: ']' });
      i++;
      continue;
    }
    if (c === ',') {
      tokens.push({ type: 'COMMA', value: ',' });
      i++;
      continue;
    }

    // Operators
    const two = expr.substring(i, i + 2);
    if (['==', '!=', '>=', '<='].includes(two)) {
      tokens.push({ type: 'OP', value: two });
      i += 2;
      continue;
    }

    if (['&&', '||'].includes(two)) {
      tokens.push({ type: 'OP', value: two });
      i += 2;
      continue;
    }

    if (['<', '>', '!'].includes(c)) {
      tokens.push({ type: 'OP', value: c });
      i++;
      continue;
    }

    throw new Error('Unexpected character in expression: ' + c);
  }

  return tokens;
}

// ---------------------------------------------------------
// Parser
// ---------------------------------------------------------

interface ASTNode {
  type: string;
  raw: string;
  operator?: string;
  left?: ASTNode;
  right?: ASTNode;
  value?: any;
  name?: string;
  elements?: ASTNode[];
}

function parse(tokens: Token[]): ASTNode {
  let i = 0;

  function peek() {
    return tokens[i];
  }

  function consume() {
    return tokens[i++];
  }

  function parseExpression(): ASTNode {
    return parseOr();
  }

  function parseOr(): ASTNode {
    let node = parseAnd();
    while (peek() && peek().type === 'OP' && peek().value === '||') {
      const op = consume().value;
      const right = parseAnd();
      node = {
        type: 'BINARY',
        operator: op,
        left: node,
        right,
        raw: `${node.raw} || ${right.raw}`,
      };
    }
    return node;
  }

  function parseAnd(): ASTNode {
    let node = parseComparison();
    while (peek() && peek().type === 'OP' && peek().value === '&&') {
      const op = consume().value;
      const right = parseComparison();
      node = {
        type: 'BINARY',
        operator: op,
        left: node,
        right,
        raw: `${node.raw} && ${right.raw}`,
      };
    }
    return node;
  }

  function parseComparison(): ASTNode {
    let node = parseTerm();

    while (
      peek() &&
      peek().type === 'OP' &&
      ['==', '!=', '>', '>=', '<', '<=', 'in'].includes(peek().value)
    ) {
      const op = consume().value;
      const right = parseTerm();

      node = {
        type: 'BINARY',
        operator: op,
        left: node,
        right,
        raw: `${node.raw} ${op} ${right.raw}`,
      };
    }

    return node;
  }

  function parseTerm(): ASTNode {
    const token = peek();

    if (!token) {
      throw new Error('Unexpected end of expression');
    }

    // Parentheses
    if (token.type === 'LPAREN') {
      consume(); // "("
      const node = parseExpression();
      if (!peek() || peek().type !== 'RPAREN')
        throw new Error('Missing closing parenthesis');
      consume();
      node.raw = `(${node.raw})`;
      return node;
    }

    // Array literal
    if (token.type === 'LBRACK') {
      consume(); // "["
      const elements: ASTNode[] = [];
      while (peek() && peek().type !== 'RBRACK') {
        elements.push(parseExpression());
        if (peek()?.type === 'COMMA') consume();
      }
      if (!peek() || peek().type !== 'RBRACK')
        throw new Error('Missing closing bracket for array');
      consume(); // "]"
      return {
        type: 'ARRAY',
        elements,
        raw: `[${elements.map((e) => e.raw).join(', ')}]`,
      };
    }

    // Unary NOT
    if (token.type === 'OP' && token.value === '!') {
      consume();
      const child = parseTerm();
      return {
        type: 'UNARY',
        operator: '!',
        raw: `!${child.raw}`,
        left: child,
      };
    }

    // Literal or identifier
    consume();
    switch (token.type) {
      case 'NUMBER':
        return { type: 'LITERAL', value: Number(token.value), raw: token.value };
      case 'STRING':
        return { type: 'LITERAL', value: token.value, raw: `"${token.value}"` };
      case 'BOOLEAN':
        return {
          type: 'LITERAL',
          value: token.value === 'true',
          raw: token.value,
        };
      case 'NULL':
        return { type: 'LITERAL', value: null, raw: 'null' };
      case 'IDENT':
        return { type: 'FIELD', name: token.value, raw: token.value };
      default:
        throw new Error('Unexpected token: ' + token.value);
    }
  }

  const ast = parseExpression();
  return ast;
}

// ---------------------------------------------------------
// Field Resolver
// ---------------------------------------------------------

function resolveField(path: string, ctx: any): any {
  const parts = path.split('.');
  let cur = ctx;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

// ---------------------------------------------------------
// AST Evaluator + Trace Builder
// ---------------------------------------------------------

function evaluateAST(
  node: ASTNode,
  ctx: any,
  fields: ReferencedField[]
): TraceNode {
  if (node.type === 'LITERAL') {
    return {
      id: Math.random().toString(),
      type: 'LITERAL',
      raw: node.raw,
      value: node.value,
    };
  }

  if (node.type === 'FIELD') {
    const val = resolveField(node.name!, ctx);
    fields.push({ path: node.name!, value: val });
    return {
      id: Math.random().toString(),
      type: 'FIELD',
      raw: node.raw,
      value: val,
    };
  }

  if (node.type === 'ARRAY') {
    const children = node.elements!.map((el) => evaluateAST(el, ctx, fields));
    return {
      id: Math.random().toString(),
      type: 'ARRAY',
      raw: node.raw,
      children,
      value: children.map((c) => c.value),
    };
  }

  if (node.type === 'UNARY') {
    const child = evaluateAST(node.left!, ctx, fields);
    const val = !child.value;
    return {
      id: Math.random().toString(),
      type: 'UNARY',
      operator: '!',
      raw: node.raw,
      children: [child],
      value: val,
    };
  }

  if (node.type === 'BINARY') {
    const left = evaluateAST(node.left!, ctx, fields);

    if (node.operator === '&&' && left.value === false) {
      return {
        id: Math.random().toString(),
        type: 'BINARY',
        operator: '&&',
        raw: node.raw,
        children: [left],
        value: false,
        shortCircuited: true,
      };
    }

    if (node.operator === '||' && left.value === true) {
      return {
        id: Math.random().toString(),
        type: 'BINARY',
        operator: '||',
        raw: node.raw,
        children: [left],
        value: true,
        shortCircuited: true,
      };
    }

    const right = evaluateAST(node.right!, ctx, fields);
    let v: any = null;

    switch (node.operator) {
      case '==':
        v = left.value == right.value;
        break;
      case '!=':
        v = left.value != right.value;
        break;
      case '>':
        v = left.value > right.value;
        break;
      case '>=':
        v = left.value >= right.value;
        break;
      case '<':
        v = left.value < right.value;
        break;
      case '<=':
        v = left.value <= right.value;
        break;
      case 'in':
        v = Array.isArray(right.value)
          ? right.value.includes(left.value)
          : false;
        break;
      default:
        throw new Error('Unknown operator: ' + node.operator);
    }

    return {
      id: Math.random().toString(),
      type: 'BINARY',
      operator: node.operator,
      raw: node.raw,
      children: [left, right],
      value: v,
    };
  }

  throw new Error('Unknown AST node type: ' + node.type);
}

// ---------------------------------------------------------
// Expression with values
// ---------------------------------------------------------

function buildExpressionWithValues(trace: TraceNode): string {
  if (!trace.children || trace.children.length === 0) {
    return JSON.stringify(trace.value);
  }

  if (trace.type === 'BINARY') {
    const [l, r] = trace.children;
    return `${buildExpressionWithValues(l)} ${trace.operator} ${buildExpressionWithValues(
      r
    )}`;
  }

  if (trace.type === 'UNARY') {
    return `!${buildExpressionWithValues(trace.children[0])}`;
  }

  if (trace.type === 'ARRAY') {
    return `[${trace.children
      .map((c) => buildExpressionWithValues(c))
      .join(', ')}]`;
  }

  return JSON.stringify(trace.value);
}

// ---------------------------------------------------------
// Auto-context helpers (Upgrade B)
// ---------------------------------------------------------

function setPath(obj: any, path: string, value: any) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (typeof cur[p] !== 'object' || cur[p] === null) {
      cur[p] = {};
    }
    cur = cur[p];
  }
  const last = parts[parts.length - 1];
  if (typeof cur[last] === 'undefined') {
    cur[last] = value;
  }
}

function getLiteralValue(node: ASTNode): any {
  if (node.type === 'LITERAL') return node.value;
  return undefined;
}

function sampleDifferentValue(val: any) {
  if (typeof val === 'boolean') return !val;
  if (typeof val === 'number') return val + 1;
  if (typeof val === 'string') return val + '_other';
  if (val === null) return 'non-null';
  return 'other';
}

function buildFallbackContext(): any {
  return {
    ticket: {
      id: 'T-1234',
      priority: 'medium',
      type: 'technical',
      status: 'open',
      channel: 'email',
    },
    customer: {
      id: 'C-42',
      country: 'NL',
      segment: 'pro',
      language: 'nl',
      age: 21,
    },
    meta: {
      source: 'inbox',
      environment: 'dev',
    },
  };
}

function collectAutoContextFromAST(ast: ASTNode): any {
  const ctx: any = {};

  function walk(node: ASTNode) {
    if (node.type === 'BINARY') {
      const op = node.operator;
      const left = node.left!;
      const right = node.right!;

      // Pattern: field IN array
      if (op === 'in' && left.type === 'FIELD' && right.type === 'ARRAY') {
        const first = right.elements && right.elements[0];
        if (first) {
          const lit = getLiteralValue(first);
          if (typeof lit !== 'undefined') {
            setPath(ctx, left.name!, lit);
          }
        }
      }

      // Comparisons / equality
      if (
        ['==', '!=', '>', '>=', '<', '<='].includes(op || '') &&
        ((left.type === 'FIELD' && right.type === 'LITERAL') ||
          (right.type === 'FIELD' && left.type === 'LITERAL'))
      ) {
        const fieldNode = left.type === 'FIELD' ? left : right;
        const literalNode = left.type === 'LITERAL' ? left : right;
        const litVal = getLiteralValue(literalNode);

        if (typeof litVal !== 'undefined') {
          let sample = litVal;

          if (op === '!=') {
            sample = sampleDifferentValue(litVal);
          } else if (op === '>' || op === '>=') {
            if (typeof litVal === 'number') {
              sample = op === '>' ? litVal + 1 : litVal;
            }
          } else if (op === '<' || op === '<=') {
            if (typeof litVal === 'number') {
              sample = op === '<' ? litVal - 1 : litVal;
            }
          }

          setPath(ctx, fieldNode.name!, sample);
        }
      }

      walk(left);
      walk(right);
    } else if (node.type === 'UNARY') {
      if (node.left) walk(node.left);
    } else if (node.type === 'ARRAY') {
      if (node.elements) node.elements.forEach(walk);
    }
  }

  walk(ast);
  return ctx;
}

// Public auto-context API
export function buildAutoContextForExpression(expression: string): any {
  try {
    const tokens = tokenize(expression);
    const ast = parse(tokens);
    const ctxFromExpr = collectAutoContextFromAST(ast);
    const hasKeys = Object.keys(ctxFromExpr).length > 0;

    if (hasKeys) {
      return ctxFromExpr;
    }

    return buildFallbackContext();
  } catch {
    return buildFallbackContext();
  }
}

// ---------------------------------------------------------
// Public evaluation API
// ---------------------------------------------------------

export function evaluateConditionWithTrace(
  expression: string,
  context: any
): ConditionTrace {
  const tokens = tokenize(expression);
  const ast = parse(tokens);

  const referencedFields: ReferencedField[] = [];
  const rootTrace = evaluateAST(ast, context, referencedFields);

  const exprValues = buildExpressionWithValues(rootTrace);

  return {
    conditionId: 'condition',
    runId: 'design-preview',
    expression,
    expressionWithValues: exprValues,
    result: typeof rootTrace.value === 'boolean' ? rootTrace.value : null,
    root: rootTrace,
    referencedFields,
    debugContext: context,
  };
}
