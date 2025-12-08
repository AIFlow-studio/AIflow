

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  WORKFLOW = 'WORKFLOW',
  AGENTS = 'AGENTS',
  PROMPTS = 'PROMPTS',
  TOOLS = 'TOOLS',
  SETTINGS = 'SETTINGS',
  DOCS = 'DOCS',
  MEMORY = 'MEMORY',
  DEBUG = 'DEBUG', // 👈 nieuw
}

// AIFLOW Standard Types

export interface AgentModel {
  provider: string;
  name: string;
  temperature: number;
  max_tokens: number;
}

export interface Agent {
  id: string; // Internal use, mapped from filename
  name: string;
  role: string;
  model: AgentModel;
  prompt: string; // Path to prompt file
  instructions: string; // Path to instructions file
  tools: string[];
  memory: string;
  output_format: string;
  executionStatus?: 'idle' | 'running' | 'completed' | 'error'; // Visual status
}

export interface FlowLogic {
  id: string;
  from: string;
  to: string;
  condition: string;
  description: string;
  mapping?: string;
}

export interface FlowVariables {
  [key: string]: string | number | boolean;
}

export interface FlowJson {
  schema_version: string;
  entry_agent: string;
  agents: string[];
  variables: FlowVariables;
  logic: FlowLogic[];
  error_handling: {
    retry: number;
    fallback_agent: string;
  };
}

export interface ToolSchema {
  type: string;
  properties?: Record<string, any>;
  required?: string[];
  [key: string]: any;
}

export interface ToolAuth {
  type: 'none' | 'api_key' | 'bearer' | 'oauth2';
  key?: string;
  token?: string;
  header_key?: string; // e.g., "X-API-Key"
  client_id?: string;
  client_secret?: string;
  token_endpoint?: string;
  scope?: string;
}

export interface ToolDefinition {
  type: 'http' | 'builtin' | 'python';
  endpoint?: string;
  method?: string;
  operations?: string[];
  description?: string;
  input_schema?: ToolSchema; // JSON Schema
  output_schema?: ToolSchema;
  auth?: ToolAuth;
}

export interface ToolRegistry {
  [key: string]: ToolDefinition;
}

export interface AIFlowProject {
  metadata: {
    name: string;
    version: string;
    description: string;
    creator: string;
  };
  flow: FlowJson;
  agents: Agent[];
  tools: ToolRegistry;
  prompts: { [filename: string]: string }; // filename -> content
}