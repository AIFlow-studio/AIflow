
import React, { useState, useEffect } from 'react';
import { Agent, ToolDefinition, ToolRegistry, ToolAuth } from '../../core/types';
import { Save, Globe, Calculator, Code, Trash2, Key, Braces, List, AlertCircle, ShieldCheck, Wand2, Info, Plus } from 'lucide-react';

interface ToolNodeEditorProps {
  agent: Agent;
  tools: ToolRegistry;
  onSave: (toolName: string, definition: ToolDefinition) => void;
  onDelete: () => void;
}

const ToolNodeEditor: React.FC<ToolNodeEditorProps> = ({ agent, tools, onSave, onDelete }) => {
  const toolName = agent.tools[0] || "web_search"; 
  const toolDef = tools[toolName] || { type: 'http', description: '', endpoint: '' };

  const [localDef, setLocalDef] = useState<ToolDefinition>(toolDef);
  const [localName, setLocalName] = useState(toolName);
  const [activeTab, setActiveTab] = useState<'general' | 'auth' | 'schema'>('general');

  // Validation States
  const [urlError, setUrlError] = useState<string | null>(null);
  const [inputSchemaStr, setInputSchemaStr] = useState("{}");
  const [outputSchemaStr, setOutputSchemaStr] = useState("{}");
  const [inputError, setInputError] = useState<string | null>(null);
  const [outputError, setOutputError] = useState<string | null>(null);

  // Operations state
  const [editingOp, setEditingOp] = useState<{index: number, value: string} | null>(null);
  const [newOpValue, setNewOpValue] = useState("");

  // Derived state
  const isNewTool = !tools[localName];

  useEffect(() => {
    const tName = agent.tools[0] || "web_search";
    const tDef = tools[tName] || { type: 'http', description: '', endpoint: '' };
    setLocalName(tName);
    setLocalDef(tDef);
    
    // Feature: Default HTTP Method
    if (tDef.type === 'http' && !tDef.method) {
        setLocalDef(prev => ({ ...prev, method: 'GET' }));
    }

    setInputSchemaStr(JSON.stringify(tDef.input_schema || {}, null, 2));
    setOutputSchemaStr(JSON.stringify(tDef.output_schema || {}, null, 2));
    setInputError(null);
    setOutputError(null);
    setUrlError(null);
    setEditingOp(null);
    setNewOpValue("");
  }, [agent, tools]);

  // URL Validation
  useEffect(() => {
      if (localDef.type === 'http' && localDef.endpoint) {
          try {
              new URL(localDef.endpoint);
              setUrlError(null);
          } catch (_) {
              setUrlError("Invalid URL format (must start with http:// or https://)");
          }
      } else {
          setUrlError(null);
      }
  }, [localDef.endpoint, localDef.type]);

  // Feature: Schema Validation
  const validateJson = (str: string, setError: (s: string|null) => void) => {
      try {
          const obj = JSON.parse(str);
          if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
              setError("Schema must be a valid JSON Object");
              return false;
          }
          setError(null);
          return true;
      } catch (e: any) {
          setError(e.message || "Invalid JSON syntax");
          return false;
      }
  };

  const prettify = (str: string, setStr: (s: string) => void, setError: (s: string|null) => void) => {
      try {
          const obj = JSON.parse(str);
          setStr(JSON.stringify(obj, null, 2));
          setError(null);
      } catch (e: any) {
          setError("Cannot prettify: " + (e.message || "Invalid JSON"));
      }
  };

  useEffect(() => { validateJson(inputSchemaStr, setInputError); }, [inputSchemaStr]);
  useEffect(() => { validateJson(outputSchemaStr, setOutputError); }, [outputSchemaStr]);

  const handleSave = () => {
    if (inputError || outputError) {
        alert("Please fix JSON errors in the Schema tab before saving.");
        return;
    }
    if (urlError) {
        alert("Please fix the Endpoint URL.");
        return;
    }
    // Feature: Description Validation
    if (!localDef.description?.trim()) {
        alert("A description is required. Agents rely on this to know when to use the tool.");
        return;
    }

    try {
        const inputSchema = JSON.parse(inputSchemaStr);
        const outputSchema = JSON.parse(outputSchemaStr);
        
        onSave(localName, { 
            ...localDef, 
            input_schema: inputSchema, 
            output_schema: outputSchema 
        });
    } catch (e) {
        alert("Invalid JSON Schema detected during save.");
    }
  };

  const addOperation = () => {
      if (!newOpValue) return;
      const ops = localDef.operations || [];
      if (!ops.includes(newOpValue)) {
          setLocalDef({...localDef, operations: [...ops, newOpValue]});
      }
      setNewOpValue("");
  };

  const removeOperation = (op: string) => {
      const ops = localDef.operations || [];
      setLocalDef({...localDef, operations: ops.filter(o => o !== op)});
  };

  const startEditOp = (index: number, val: string) => {
      setEditingOp({index, value: val});
      setNewOpValue(val);
  };

  const updateOperation = () => {
      if (!editingOp || !newOpValue) return;
      const ops = [...(localDef.operations || [])];
      ops[editingOp.index] = newOpValue;
      setLocalDef({...localDef, operations: ops});
      setEditingOp(null);
      setNewOpValue("");
  };

  const handleAuthChange = (field: keyof ToolAuth, value: string) => {
      setLocalDef({
          ...localDef,
          auth: { ...localDef.auth, type: localDef.auth?.type || 'none', [field]: value } as ToolAuth
      });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg shadow-sm border border-amber-200">
                {localDef.type === 'http' && <Globe size={20} />}
                {localDef.type === 'builtin' && <Calculator size={20} />}
                {localDef.type === 'python' && <Code size={20} />}
            </div>
            <div>
                <h2 className="text-lg font-bold text-slate-900">Tool Configuration</h2>
                <div className="flex items-center space-x-2">
                    <p className="text-xs text-slate-500 font-mono">{agent.id}</p>
                    {isNewTool && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">NEW REGISTRY ENTRY</span>}
                </div>
            </div>
        </div>
        <button 
            onClick={handleSave}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm shadow-sm">
            <Save size={16} className="mr-2" />
            {isNewTool ? 'Create & Link' : 'Save'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
          <button onClick={() => setActiveTab('general')} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'general' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>General</button>
          {localDef.type === 'http' && (
              <button onClick={() => setActiveTab('auth')} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'auth' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Auth</button>
          )}
          <button onClick={() => setActiveTab('schema')} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'schema' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Schema</button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* --- General Tab --- */}
        {activeTab === 'general' && (
            <>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Registry Key (Tool Name)
                        {isNewTool && <span className="ml-2 text-xs text-emerald-600 font-normal">(Creating new registry entry)</span>}
                    </label>
                    <input
                        type="text"
                        value={localName}
                        onChange={(e) => setLocalName(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none text-sm ${isNewTool ? 'border-emerald-400 focus:ring-emerald-200 bg-emerald-50' : 'border-slate-300 focus:ring-indigo-500'}`}
                        placeholder="unique_tool_name"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                    <select
                        value={localDef.type}
                        onChange={(e) => setLocalDef({ ...localDef, type: e.target.value as any })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-sm"
                    >
                        <option value="http">HTTP API</option>
                        <option value="builtin">Built-in Function</option>
                        <option value="python">Python Script</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1 flex justify-between items-center">
                        Description
                        <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Required</span>
                    </label>
                    {/* Feature: Prominent Description Warning */}
                    <textarea
                        value={localDef.description || ''}
                        onChange={(e) => setLocalDef({ ...localDef, description: e.target.value })}
                        rows={3}
                        placeholder="e.g. Fetches the current weather for a city. Input should be a city name..."
                        className={`w-full px-3 py-2 border rounded-lg outline-none text-sm transition-all ${
                            !localDef.description?.trim() 
                            ? 'border-amber-300 bg-amber-50 focus:ring-2 focus:ring-amber-200 placeholder:text-amber-400' 
                            : 'border-slate-300 focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400'
                        }`}
                    />
                    <div className="flex justify-between items-start mt-2">
                        {!localDef.description?.trim() ? (
                            <div className="flex items-start text-amber-600 text-xs animate-in fade-in">
                                <Info size={14} className="mr-1.5 mt-0.5 flex-shrink-0" />
                                <p>Agents rely entirely on this description to decide <strong>when</strong> and <strong>how</strong> to use this tool. Please be descriptive.</p>
                            </div>
                        ) : (
                            <span className="text-xs text-slate-400">{(localDef.description || '').length} characters</span>
                        )}
                    </div>
                </div>

                {localDef.type === 'http' && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-1">
                                <label className="block text-xs font-medium text-slate-500 mb-1">Method</label>
                                <select
                                    value={localDef.method || 'GET'}
                                    onChange={(e) => setLocalDef({ ...localDef, method: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-sm bg-white"
                                >
                                    <option>GET</option>
                                    <option>POST</option>
                                    <option>PUT</option>
                                    <option>DELETE</option>
                                    <option>PATCH</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-slate-500 mb-1">Endpoint</label>
                                {/* Feature: Endpoint Placeholder and Validation */}
                                <input
                                    type="text"
                                    value={localDef.endpoint || ''}
                                    onChange={(e) => setLocalDef({ ...localDef, endpoint: e.target.value })}
                                    placeholder="https://api.example.com/v1/resource"
                                    className={`w-full px-3 py-2 border rounded-lg outline-none text-sm font-mono ${urlError ? 'border-red-500 focus:ring-red-200' : 'border-slate-300'}`}
                                />
                                {urlError && (
                                    <p className="text-xs text-red-500 mt-1 flex items-center">
                                        <AlertCircle size={10} className="mr-1"/> {urlError}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                
                {localDef.type === 'builtin' && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center"><List size={14} className="mr-2"/> Operations</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {localDef.operations?.map((op, idx) => (
                                <span key={idx} 
                                    onClick={() => startEditOp(idx, op)}
                                    className="flex items-center px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono text-slate-600 shadow-sm cursor-pointer hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50"
                                    title="Click to Edit"
                                >
                                    {op}
                                    <button onClick={(e) => { e.stopPropagation(); removeOperation(op); }} className="ml-2 text-slate-400 hover:text-red-600">×</button>
                                </span>
                            ))}
                        </div>
                        <div className="flex space-x-2">
                            <input 
                                value={newOpValue}
                                onChange={(e) => setNewOpValue(e.target.value)}
                                placeholder={editingOp ? "Edit operation..." : "New operation..."}
                                className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                onKeyDown={e => {
                                    if(e.key === 'Enter') {
                                        editingOp ? updateOperation() : addOperation();
                                    }
                                }}
                            />
                            <button 
                                onClick={editingOp ? updateOperation : addOperation}
                                className={`px-3 py-1 text-xs rounded font-medium transition-colors ${editingOp ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>
                                {editingOp ? 'Update' : 'Add'}
                            </button>
                            {editingOp && (
                                <button onClick={() => { setEditingOp(null); setNewOpValue(""); }} className="px-2 text-xs text-slate-500 hover:text-slate-700">Cancel</button>
                            )}
                        </div>
                    </div>
                )}
            </>
        )}

        {/* --- Auth Tab --- */}
        {activeTab === 'auth' && (
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Auth Type</label>
                    <select
                        value={localDef.auth?.type || 'none'}
                        onChange={(e) => handleAuthChange('type', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-sm"
                    >
                        <option value="none">None</option>
                        <option value="api_key">API Key (Header)</option>
                        <option value="bearer">Bearer Token</option>
                        {/* Feature: OAuth2 Option */}
                        <option value="oauth2">OAuth 2.0</option>
                    </select>
                </div>
                {localDef.auth?.type === 'api_key' && (
                     <div className="animate-in fade-in space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Header Name</label>
                            <input
                                list="header-presets"
                                type="text"
                                value={localDef.auth?.header_key || ''}
                                onChange={(e) => handleAuthChange('header_key', e.target.value)}
                                placeholder="X-API-Key"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-sm font-mono"
                            />
                            <datalist id="header-presets">
                                <option value="Authorization" />
                                <option value="X-API-Key" />
                                <option value="Ocp-Apim-Subscription-Key" />
                                <option value="x-functions-key" />
                            </datalist>
                            <p className="text-[10px] text-slate-400 mt-1">Common headers: Authorization, X-API-Key</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Key Value</label>
                            <div className="relative">
                                <Key size={14} className="absolute left-3 top-3 text-slate-400" />
                                <input
                                    type="password"
                                    value={localDef.auth?.key || ''}
                                    onChange={(e) => handleAuthChange('key', e.target.value)}
                                    placeholder="Your secret key..."
                                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg outline-none text-sm font-mono"
                                />
                            </div>
                        </div>
                     </div>
                )}
                {localDef.auth?.type === 'bearer' && (
                    <div className="animate-in fade-in">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Token Value</label>
                         <div className="relative">
                            <Key size={14} className="absolute left-3 top-3 text-slate-400" />
                            <input
                                list="token-presets"
                                type="password"
                                value={localDef.auth?.token || ''}
                                onChange={(e) => handleAuthChange('token', e.target.value)}
                                placeholder="Bearer <token>"
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg outline-none text-sm font-mono"
                            />
                            <datalist id="token-presets">
                                <option value="Bearer " label="Standard Bearer Prefix" />
                            </datalist>
                            <p className="text-[10px] text-slate-400 mt-1">Common format: "Bearer [YOUR_TOKEN]"</p>
                        </div>
                    </div>
                )}
                 {/* Feature: OAuth2 Fields */}
                 {localDef.auth?.type === 'oauth2' && (
                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 animate-in fade-in">
                        <div className="flex items-center text-sm font-medium text-slate-700 mb-2">
                             <ShieldCheck size={16} className="mr-2 text-indigo-600"/> OAuth2 Credentials
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Client ID</label>
                            <input
                                type="text"
                                value={localDef.auth?.client_id || ''}
                                onChange={(e) => handleAuthChange('client_id', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-sm font-mono bg-white"
                                placeholder="your_client_id"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Client Secret</label>
                            <input
                                type="password"
                                value={localDef.auth?.client_secret || ''}
                                onChange={(e) => handleAuthChange('client_secret', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-sm font-mono bg-white"
                                placeholder="your_client_secret"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Token Endpoint</label>
                            <input
                                type="text"
                                value={localDef.auth?.token_endpoint || ''}
                                onChange={(e) => handleAuthChange('token_endpoint', e.target.value)}
                                placeholder="https://auth.example.com/oauth/token"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-sm font-mono bg-white"
                            />
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* --- Schema Tab --- */}
        {activeTab === 'schema' && (
            <div className="space-y-4 h-full flex flex-col">
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                        <label className="flex items-center text-sm font-medium text-slate-700">
                            <Braces size={14} className="mr-2" /> Input Schema (JSON)
                        </label>
                        <div className="flex items-center space-x-2">
                             {inputError && <span className="text-xs text-red-500 flex items-center bg-red-50 px-2 py-0.5 rounded border border-red-100 max-w-[200px] truncate" title={inputError}><AlertCircle size={10} className="mr-1 flex-shrink-0"/>{inputError}</span>}
                             <button onClick={() => prettify(inputSchemaStr, setInputSchemaStr, setInputError)} className="text-xs flex items-center text-slate-500 hover:text-indigo-600"><Wand2 size={10} className="mr-1"/> Format</button>
                        </div>
                    </div>
                    {/* Feature: Schema Linting */}
                    <textarea
                        value={inputSchemaStr}
                        onChange={(e) => setInputSchemaStr(e.target.value)}
                        className={`w-full h-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-mono bg-slate-50 resize-y ${inputError ? 'border-red-500 focus:ring-red-200 bg-red-50/10' : 'border-slate-300'}`}
                        spellCheck={false}
                        placeholder="{ ... }"
                    />
                </div>
                <div className="flex-1">
                     <div className="flex justify-between items-center mb-2">
                        <label className="flex items-center text-sm font-medium text-slate-700">
                            <Braces size={14} className="mr-2" /> Output Schema (JSON)
                        </label>
                        <div className="flex items-center space-x-2">
                             {outputError && <span className="text-xs text-red-500 flex items-center bg-red-50 px-2 py-0.5 rounded border border-red-100 max-w-[200px] truncate" title={outputError}><AlertCircle size={10} className="mr-1 flex-shrink-0"/>{outputError}</span>}
                             <button onClick={() => prettify(outputSchemaStr, setOutputSchemaStr, setOutputError)} className="text-xs flex items-center text-slate-500 hover:text-indigo-600"><Wand2 size={10} className="mr-1"/> Format</button>
                        </div>
                    </div>
                     <textarea
                        value={outputSchemaStr}
                        onChange={(e) => setOutputSchemaStr(e.target.value)}
                        className={`w-full h-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-mono bg-slate-50 resize-y ${outputError ? 'border-red-500 focus:ring-red-200 bg-red-50/10' : 'border-slate-300'}`}
                        spellCheck={false}
                        placeholder="{ ... }"
                    />
                </div>
            </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-slate-100 bg-slate-50/50">
             <button 
                onClick={onDelete}
                className="w-full flex items-center justify-center px-4 py-2 border border-red-200 text-red-600 bg-white rounded-lg hover:bg-red-50 transition-colors text-sm font-medium shadow-sm">
                <Trash2 size={16} className="mr-2" />
                Delete Node
            </button>
        </div>
    </div>
  );
};

export default ToolNodeEditor;
