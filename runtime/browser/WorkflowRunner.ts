
import { AIFlowProject, Agent } from '../../core/types';
import { GoogleGenAI } from "@google/genai";

export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  agentId?: string;
  details?: any;
}

export class WorkflowRunner {
  private project: AIFlowProject;
  private ai: GoogleGenAI;
  private context: Record<string, any> = {};
  private onLog: (log: LogEntry) => void;
  private onStatusChange: (agentId: string, status: 'idle' | 'running' | 'completed' | 'error') => void;
  private isRunning: boolean = false;
  private apiKey: string;

  constructor(
    project: AIFlowProject,
    apiKey: string,
    inputs: Record<string, string>,
    onLog: (log: LogEntry) => void,
    onStatusChange: (agentId: string, status: 'idle' | 'running' | 'completed' | 'error') => void
  ) {
    this.project = project;
    this.onLog = onLog;
    this.onStatusChange = onStatusChange;
    
    // Initialize Google GenAI
    // Use passed key or fall back to env var
    this.apiKey = apiKey || process.env.API_KEY || '';
    this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    
    // Initialize context with variables and inputs
    this.context = { ...project.flow.variables, ...inputs };
  }

  async start() {
    this.isRunning = true;
    this.log('info', 'Starting workflow execution...', undefined, { initialContext: this.context });
    
    let currentAgentId: string | null = this.project.flow.entry_agent;
    let steps = 0;
    const MAX_STEPS = 20;

    while (currentAgentId && this.isRunning && steps < MAX_STEPS) {
      const agent = this.project.agents.find(a => a.id === currentAgentId);
      if (!agent) {
        this.log('error', `Agent '${currentAgentId}' not found in configuration.`);
        break;
      }

      await this.executeAgent(agent);
      
      if (!this.isRunning) break;

      const nextAgentId = this.evaluateLogic(currentAgentId);
      
      if (nextAgentId) {
        this.log('info', `Transitioning: ${agent.name} ➔ ${nextAgentId}`);
        currentAgentId = nextAgentId;
      } else {
        this.log('success', 'Workflow execution finished. No further valid transitions.');
        currentAgentId = null;
      }
      steps++;
    }

    if (steps >= MAX_STEPS) {
      this.log('warn', 'Execution stopped: Max steps exceeded (Loop protection).');
    }
    
    this.isRunning = false;
  }

  stop() {
    this.isRunning = false;
    this.log('warn', 'Workflow execution stopped by user.');
  }

  private async executeAgent(agent: Agent) {
    this.onStatusChange(agent.id, 'running');
    this.log('info', `Executing Agent: ${agent.name}`, agent.id);

    try {
      let promptText = this.project.prompts[agent.prompt] || `You are a helpful AI assistant acting as ${agent.role}.`;
      
      // Template Injection
      promptText = promptText.replace(/\{\{(\w+)\}\}/g, (_, key) => {
          return this.context[key] !== undefined ? String(this.context[key]) : `{{${key}}}`;
      });

      const contextString = JSON.stringify(this.context, null, 2);
      const fullPrompt = `${promptText}\n\n[Current Context Variables]:\n${contextString}\n\nInstructions: Perform your task based on the context.`;

      let output = "";
      
      if (this.apiKey) { 
         let modelId = 'gemini-2.5-flash';
         if (agent.model.name.includes('pro') || agent.model.name.includes('gpt-4')) modelId = 'gemini-3-pro-preview';
         
         this.log('info', `Generating content with model: ${modelId}...`, agent.id);
         
         const response = await this.ai.models.generateContent({
            model: modelId,
            contents: fullPrompt,
            config: {
                temperature: agent.model.temperature,
                maxOutputTokens: agent.model.max_tokens || 1000,
                responseMimeType: agent.output_format === 'json' ? 'application/json' : 'text/plain'
            }
         });
         
         output = response.text || "";
      } else {
          this.log('warn', `Missing API Key. Simulating response...`, agent.id);
          await new Promise(r => setTimeout(r, 1000));
          output = `[Simulated Output from ${agent.name}]: Task completed successfully.`;
          if (agent.output_format === 'json') {
              output = JSON.stringify({ status: "completed", summary: "Simulated result" });
          }
      }

      this.log('success', `Agent completed task.`, agent.id, { output });
      
      this.context['last_output'] = output;
      this.context[`${agent.id}.output`] = output;
      
      if (agent.output_format === 'json') {
          try {
              const json = JSON.parse(output);
              this.context = { ...this.context, ...json };
              this.log('info', 'Context updated with parsed JSON.', agent.id, json);
          } catch (e) {
              this.log('warn', 'Failed to parse JSON output.', agent.id);
          }
      }

      this.onStatusChange(agent.id, 'completed');

    } catch (error: any) {
      this.log('error', `Execution failed: ${error.message}`, agent.id);
      this.onStatusChange(agent.id, 'error');
      throw error; 
    }
  }

  private evaluateLogic(currentAgentId: string): string | null {
    const rules = this.project.flow.logic.filter(l => l.from === currentAgentId);
    
    for (const rule of rules) {
        if (rule.condition === 'always') return rule.to;
        
        try {
            const condition = rule.condition.trim();
            if (condition.includes('==')) {
                const [key, val] = condition.split('==').map(s => s.trim().replace(/['"]/g, ''));
                if (String(this.context[key]) === val) return rule.to;
            } else {
                if (this.context[condition]) return rule.to;
            }
        } catch (e) {
            console.warn(`Error evaluating rule: ${rule.condition}`, e);
        }
    }
    return null;
  }

  private log(level: LogEntry['level'], message: string, agentId?: string, details?: any) {
    this.onLog({
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        level,
        message,
        agentId,
        details
    });
  }
}
