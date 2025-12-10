// runtime/cli/runFlow.ts

import { validateProject, hasValidationErrors } from '../core/validator';
import { evaluateExpression } from '../core/conditionEngineV2';

export interface RunFlowOptions {
  /**
   * Globale context die beschikbaar is in conditions.
   * Wordt doorgegeven als `context` in de evaluatie.
   */
  initialContext?: Record<string, any>;
  /**
   * Optionele map met "mock" outputs per agent-id.
   * Wordt doorgegeven als `output` in de evaluatie (zodat je conditions
   * als `output.score > 0.5` kunt testen zonder echte LLM-calls).
   */
  outputsByAgent?: Record<string, any>;
  /**
   * Veiligheidslimiet om infinite loops te voorkomen.
   * Default: 50 stappen.
   */
  maxSteps?: number;
}

export interface RunFlowStepEval {
  from: string | null;
  to: string | null;
  condition: string | null;
  result: boolean;
}

export interface RunFlowStep {
  agentId: string;
  evaluations: RunFlowStepEval[];
}

export interface RunFlowResult {
  finished: boolean;
  visitedAgents: string[];
  steps: RunFlowStep[];
  finalAgentId: string | null;
  context: Record<string, any>;
}

/**
 * Kleine v0.2 runtime:
 * - valideert het project met validator v0.2
 * - loopt vanaf flow.entry_agent door de logic-regels
 * - gebruikt conditionEngineV2 voor het evalueren van conditions
 */
export function runFlow(project: any, options: RunFlowOptions = {}): RunFlowResult {
  const issues = validateProject(project);
  if (hasValidationErrors(issues)) {
    const codes = issues
      .filter((i) => i.level === 'error')
      .map((i) => i.code)
      .join(', ');
    throw new Error(`Project has validation errors: ${codes}`);
  }

  const flow = project.flow ?? {};
  const logic: any[] = Array.isArray(flow.logic) ? flow.logic : [];
  const entryAgent: string | undefined = flow.entry_agent;

  if (!entryAgent || typeof entryAgent !== 'string') {
    // zou al door validator afgevangen moeten zijn, maar extra guard
    throw new Error('Project has no valid flow.entry_agent');
  }

  const maxSteps = options.maxSteps ?? 50;
  const context: Record<string, any> = {
    ...(options.initialContext ?? {}),
  };
  const outputsByAgent = options.outputsByAgent ?? {};

  const visitedAgents: string[] = [];
  const steps: RunFlowStep[] = [];

  let currentAgentId: string | null = entryAgent;
  let stepCount = 0;

  while (currentAgentId && stepCount < maxSteps) {
    visitedAgents.push(currentAgentId);

    const rulesForAgent = logic.filter(
      (rule) => rule && rule.from === currentAgentId,
    );

    const evals: RunFlowStepEval[] = [];
    let chosenNext: string | null = null;

    // Context voor conditionEngineV2 – sluit aan op v0.1 evaluateCondition
    const evalContext = {
      context,
      output: outputsByAgent[currentAgentId],
      agentId: currentAgentId,
      user: context.user,
    };

    for (const rule of rulesForAgent) {
      const conditionStr: string =
        typeof rule.condition === 'string' && rule.condition.trim().length > 0
          ? rule.condition
          : 'always';

      const result = evaluateExpression(conditionStr, evalContext);

      evals.push({
        from: rule.from ?? null,
        to: rule.to ?? null,
        condition: rule.condition ?? null,
        result,
      });

      if (!chosenNext && result && rule.to) {
        chosenNext = rule.to;
      }
    }

    steps.push({
      agentId: currentAgentId,
      evaluations: evals,
    });

    if (!chosenNext) {
      // geen matchende rule → flow eindigt hier
      currentAgentId = null;
      break;
    }

    currentAgentId = chosenNext;
    stepCount += 1;
  }

  return {
    finished: currentAgentId === null,
    visitedAgents,
    steps,
    finalAgentId: currentAgentId,
    context,
  };
}
