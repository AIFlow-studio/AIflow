// runtime/cli/tests/runFlow.v0.2.test.ts

import { describe, it, expect } from 'vitest';
import { runFlow } from '../runFlow';
import { validateProject, hasValidationErrors } from '../../core/validator';

describe('CLI Engine v0.2 - runFlow', () => {
  it('validates project before running (no errors)', () => {
    const project = {
      flow: {
        entry_agent: 'triage',
        logic: [
          { from: 'triage', to: 'responder', condition: 'always' },
        ],
      },
      agents: [
        { id: 'triage', model: { provider: 'gemini', name: 'gemini-pro' } },
        { id: 'responder', model: { provider: 'gemini', name: 'gemini-pro' } },
      ],
    };

    const issues = validateProject(project);
    expect(hasValidationErrors(issues)).toBe(false);

    const result = runFlow(project, { initialContext: {} });

    expect(result.finished).toBe(true);
    expect(result.visitedAgents).toEqual(['triage', 'responder']);
  });

  it('throws when project has validation errors', () => {
    const invalidProject = {
      flow: {
        // entry_agent ontbreekt → validator error
        logic: [],
      },
      agents: [
        { id: 'triage', model: { provider: 'gemini', name: 'gemini-pro' } },
      ],
    };

    const issues = validateProject(invalidProject);
    expect(hasValidationErrors(issues)).toBe(true);

    expect(() => runFlow(invalidProject)).toThrowError(
      /validation errors/i,
    );
  });

  it('routes using AND / OR / NOT conditions during runtime', () => {
    const project = {
      flow: {
        entry_agent: 'start',
        logic: [
          {
            from: 'start',
            to: 'allowed',
            condition: 'NOT (user.role == "blocked" OR user.age < 18)',
          },
          {
            from: 'start',
            to: 'blocked',
            condition: 'always',
          },
        ],
      },
      agents: [
        { id: 'start', model: { provider: 'gemini', name: 'gemini-pro' } },
        { id: 'allowed', model: { provider: 'gemini', name: 'gemini-pro' } },
        { id: 'blocked', model: { provider: 'gemini', name: 'gemini-pro' } },
      ],
    };

    const result = runFlow(project, {
      initialContext: {
        user: { role: 'admin', age: 25 },
      },
    });

    expect(result.finished).toBe(true);
    // start → allowed, niet blocked
    expect(result.visitedAgents).toEqual(['start', 'allowed']);
  });

  it('supports contains() with arrays during runtime', () => {
    const project = {
      flow: {
        entry_agent: 'start',
        logic: [
          {
            from: 'start',
            to: 'vip_handler',
            condition: 'contains(user.tags, "vip")',
          },
          {
            from: 'start',
            to: 'default_handler',
            condition: 'always',
          },
        ],
      },
      agents: [
        { id: 'start', model: { provider: 'gemini', name: 'gemini-pro' } },
        { id: 'vip_handler', model: { provider: 'gemini', name: 'gemini-pro' } },
        { id: 'default_handler', model: { provider: 'gemini', name: 'gemini-pro' } },
      ],
    };

    const result = runFlow(project, {
      initialContext: {
        user: { tags: ['vip', 'gold'] },
      },
    });

    expect(result.finished).toBe(true);
    expect(result.visitedAgents).toEqual(['start', 'vip_handler']);
  });

  it('can use output.* values via outputsByAgent map', () => {
    const project = {
      flow: {
        entry_agent: 'triage',
        logic: [
          {
            from: 'triage',
            to: 'high_priority',
            condition: 'output.score > 0.7',
          },
          {
            from: 'triage',
            to: 'low_priority',
            condition: 'always',
          },
        ],
      },
      agents: [
        { id: 'triage', model: { provider: 'gemini', name: 'gemini-pro' } },
        { id: 'high_priority', model: { provider: 'gemini', name: 'gemini-pro' } },
        { id: 'low_priority', model: { provider: 'gemini', name: 'gemini-pro' } },
      ],
    };

    const result = runFlow(project, {
      initialContext: {},
      outputsByAgent: {
        triage: { score: 0.9 },
      },
    });

    expect(result.finished).toBe(true);
    expect(result.visitedAgents).toEqual(['triage', 'high_priority']);
  });
});
