
import React, { useState } from 'react';
import { Agent } from '../../core/types';
import { Save, Sparkles, Plus, X } from 'lucide-react';
import { generateAgentConfig } from '../services/geminiService';

interface AgentEditorProps {
  agent: Agent;
  availableTools: string[];
  onSave: (agent: Agent) => void;
}

const AgentEditor: React.FC<AgentEditorProps> = ({ agent, availableTools, onSave }) => {
  const [localAgent, setLocalAgent] = useState<Agent>(agent);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAddingTool, setIsAddingTool] = useState(false);

  React.useEffect(() => {
    setLocalAgent(agent);
  }, [agent]);

  const handleChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setLocalAgent({
        ...localAgent,
        [parent]: {
          ...(localAgent as any)[parent],
          [child]: value
        }
      });
    } else {
      setLocalAgent({ ...localAgent, [field]: value });
    }
  };

  const handleMagicFill = async () => {
    setIsGenerating(true);
    try {
        const jsonStr = await generateAgentConfig(`An agent named ${localAgent.name} that acts as a ${localAgent.role}`);
        const data = JSON.parse(jsonStr);
        setLocalAgent(prev => ({
            ...prev,
            ...data,
            model: { ...prev.model, ...data.model }
        }));
    } catch (e) {
        alert("Failed to generate agent config");
    } finally {
        setIsGenerating(false);
    }
  }

  const addTool = (toolName: string) => {
    if (!localAgent.tools.includes(toolName)) {
      setLocalAgent({ ...localAgent, tools: [...localAgent.tools, toolName] });
    }
    setIsAddingTool(false);
  };

  const removeTool = (toolName: string) => {
    setLocalAgent({ ...localAgent, tools: localAgent.tools.filter(t => t !== toolName) });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Agent Configuration</h2>
          <p className="text-sm text-slate-500">{localAgent.id}.json</p>
        </div>
        <div className="flex space-x-2">
            <button 
                onClick={handleMagicFill}
                disabled={isGenerating}
                className="flex items-center px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium border border-purple-200">
                <Sparkles size={16} className="mr-2" />
                {isGenerating ? 'Thinking...' : 'AI Autofill'}
            </button>
            <button 
            onClick={() => onSave(localAgent)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
            <Save size={18} className="mr-2" />
            Save
            </button>
        </div>
      </div>

      <div className="space-y-6 overflow-y-auto pr-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              value={localAgent.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <input
              type="text"
              value={localAgent.role}
              onChange={(e) => handleChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Model Parameters</h3>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Provider</label>
                    <select
                        value={localAgent.model.provider}
                        onChange={(e) => handleChange('model.provider', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                        <option value="openai">OpenAI</option>
                        <option value="anthropic">Anthropic</option>
                        <option value="google">Google Gemini</option>
                        <option value="mistral">Mistral</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Model Name</label>
                    <input
                        type="text"
                        value={localAgent.model.name}
                        onChange={(e) => handleChange('model.name', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Temperature ({localAgent.model.temperature})</label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={localAgent.model.temperature}
                        onChange={(e) => handleChange('model.temperature', parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Max Tokens</label>
                    <input
                        type="number"
                        value={localAgent.model.max_tokens}
                        onChange={(e) => handleChange('model.max_tokens', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                </div>
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Linked Prompt File</label>
            <div className="flex space-x-2">
                <input
                type="text"
                readOnly
                value={localAgent.prompt}
                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg outline-none cursor-not-allowed"
                />
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Enabled Tools</label>
            <div className="flex flex-wrap gap-2">
                {localAgent.tools.map(tool => (
                    <span key={tool} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100 flex items-center">
                        {tool}
                        <button onClick={() => removeTool(tool)} className="ml-2 hover:text-indigo-900 rounded-full p-0.5 hover:bg-indigo-200 transition-colors"><X size={12} /></button>
                    </span>
                ))}
                
                <div className="relative">
                  <button 
                    onClick={() => setIsAddingTool(!isAddingTool)}
                    className="px-3 py-1 border border-dashed border-slate-300 text-slate-500 rounded-full text-sm hover:border-indigo-300 hover:text-indigo-600 transition-colors flex items-center"
                  >
                    <Plus size={14} className="mr-1" /> Add Tool
                  </button>
                  
                  {isAddingTool && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                      <div className="max-h-48 overflow-y-auto">
                        {availableTools.filter(t => !localAgent.tools.includes(t)).length === 0 ? (
                           <div className="px-4 py-3 text-xs text-slate-400">No tools available</div>
                        ) : (
                          availableTools.filter(t => !localAgent.tools.includes(t)).map(tool => (
                            <button
                              key={tool}
                              onClick={() => addTool(tool)}
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                            >
                              {tool}
                            </button>
                          ))
                        )}
                      </div>
                      <div className="border-t border-slate-100 p-2">
                        <button onClick={() => setIsAddingTool(false)} className="w-full text-center text-xs text-slate-400 hover:text-slate-600">Close</button>
                      </div>
                    </div>
                  )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AgentEditor;
