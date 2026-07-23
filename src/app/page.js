'use client';

import { useState } from 'react';

export default function CampusCopilot() {
  const [activeTab, setActiveTab] = useState('workspace');
  
  const [modules, setModules] = useState([
    { id: 1, name: 'Object-Oriented Programming', code: 'IT-201', status: 'Active' },
    { id: 2, name: 'Computer Networks', code: 'IT-203', status: 'Active' },
    { id: 3, name: 'Operating Systems', code: 'IT-205', status: 'Active' },
  ]);
  const [newModule, setNewModule] = useState({ name: '', code: '' });
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [editModuleName, setEditModuleName] = useState('');
  const [editModuleCode, setEditModuleCode] = useState('');

  const [activeCourse, setActiveCourse] = useState(null);
  const [courseHistories, setCourseHistories] = useState({});
  const [generalMessages, setGeneralMessages] = useState([
    { role: 'assistant', content: 'Hello! I am CampusCopilot AI, your academic advisor and coding assistant. Select a course module or ask a general question below.' }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const [tasks, setTasks] = useState([
    { id: 1, title: 'Workflow Automation Integration (n8n)', deadline: '2026-07-22', status: 'Pending' },
    { id: 2, title: 'CampusCopilot AI Capstone Project', deadline: '2026-07-27', status: 'In Progress' },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');

  const cleanText = (text) => {
    if (!text) return '';
    return text.replace(/[*#]/g, '');
  };

  const currentMessages = activeCourse 
    ? (courseHistories[activeCourse.id] || [{ role: 'assistant', content: `Welcome to the dedicated workspace for ${activeCourse.name} (${activeCourse.code}). Ask your questions or request code/notes for this module.` }])
    : generalMessages;

  const updateCurrentMessages = (newMsgs) => {
    if (activeCourse) {
      setCourseHistories(prev => ({ ...prev, [activeCourse.id]: newMsgs }));
    } else {
      setGeneralMessages(newMsgs);
    }
  };

  const handleSend = async (customPrompt) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim()) return;

    const updatedMsgs = [...currentMessages, { role: 'user', content: textToSend }];
    updateCurrentMessages(updatedMsgs);
    if (!customPrompt) setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: updatedMsgs, 
          course: activeCourse ? activeCourse.name : null 
        }),
      });
      const data = await response.json();
      updateCurrentMessages([...updatedMsgs, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error('Error:', error);
      updateCurrentMessages([...updatedMsgs, { role: 'assistant', content: 'Error: Failed to fetch response from backend.' }]);
    } finally {
      setLoading(false);
    }
  };

  const addModule = (e) => {
    e.preventDefault();
    if (!newModule.name || !newModule.code) return;
    setModules([...modules, { id: Date.now(), name: newModule.name, code: newModule.code, status: 'Active' }]);
    setNewModule({ name: '', code: '' });
  };

  const deleteModule = (id) => {
    setModules(modules.filter(m => m.id !== id));
    if (activeCourse && activeCourse.id === id) setActiveCourse(null);
  };

  const startEditingModule = (mod) => {
    setEditingModuleId(mod.id);
    setEditModuleName(mod.name);
    setEditModuleCode(mod.code);
  };

  const saveEditedModule = (id) => {
    setModules(modules.map(m => m.id === id ? { ...m, name: editModuleName, code: editModuleCode } : m));
    setEditingModuleId(null);
    if (activeCourse && activeCourse.id === id) {
      setActiveCourse({ ...activeCourse, name: editModuleName, code: editModuleCode });
    }
  };

  const selectCourseForWorkspace = (mod) => {
    setActiveCourse(mod);
    setActiveTab('workspace');
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    setTasks([...tasks, { id: Date.now(), title: newTaskTitle, deadline: newTaskDeadline || 'No Deadline', status: 'Pending' }]);
    setNewTaskTitle('');
    setNewTaskDeadline('');
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
      <aside className="w-64 border-r border-slate-800 p-6 flex flex-col gap-6">
        <h1 className="text-xl font-bold tracking-wider text-emerald-400">CAMPUSCOPILOT</h1>
        <nav className="flex flex-col gap-2 text-sm font-medium">
          <button 
            onClick={() => setActiveTab('workspace')}
            className={`text-left px-3 py-2 rounded transition ${activeTab === 'workspace' ? 'bg-slate-900 text-emerald-400 border border-slate-800' : 'text-slate-400 hover:text-emerald-400'}`}
          >
            AI WORKSPACE {activeCourse && <span className="block text-xs text-emerald-500 font-mono">({activeCourse.code})</span>}
          </button>
          <button 
            onClick={() => setActiveTab('modules')}
            className={`text-left px-3 py-2 rounded transition ${activeTab === 'modules' ? 'bg-slate-900 text-emerald-400 border border-slate-800' : 'text-slate-400 hover:text-emerald-400'}`}
          >
            COURSE MODULES
          </button>
          <button 
            onClick={() => setActiveTab('protocol')}
            className={`text-left px-3 py-2 rounded transition ${activeTab === 'protocol' ? 'bg-slate-900 text-emerald-400 border border-slate-800' : 'text-slate-400 hover:text-emerald-400'}`}
          >
            TASK PROTOCOL
          </button>
        </nav>

        {activeCourse && (
          <div className="mt-auto bg-emerald-950/30 border border-emerald-900/50 p-3 rounded-lg text-xs">
            <span className="text-slate-400 block mb-1">Active Course Context:</span>
            <span className="font-semibold text-emerald-400 block">{activeCourse.name}</span>
            <button onClick={() => setActiveCourse(null)} className="mt-2 text-slate-400 hover:text-slate-200 underline block">Clear course context</button>
          </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'workspace' && (
          <>
            <header className="border-b border-slate-800 p-4 flex justify-between items-center bg-slate-900/50">
              <h2 className="text-sm font-semibold tracking-wide text-slate-300">
                {activeCourse ? `WORKSPACE: ${activeCourse.name.toUpperCase()} (${activeCourse.code})` : 'GENERAL AI WORKSPACE'}
              </h2>
              <div className="flex gap-3">
                <button onClick={() => handleSend("Explain concept: ")} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded border border-slate-700 transition">Explain Concept</button>
                <button onClick={() => handleSend("Debug code: ")} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded border border-slate-700 transition">Debug Code</button>
                <button onClick={() => handleSend("Generate quiz: ")} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded border border-slate-700 transition">Generate Quiz</button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {currentMessages.map((msg, index) => (
                <div key={index} className={`p-4 rounded-lg max-w-3xl leading-relaxed text-sm ${msg.role === 'user' ? 'bg-emerald-950/40 border border-emerald-800/50 ml-auto' : 'bg-slate-900 border border-slate-800 mr-auto'}`}>
                  <div className="whitespace-pre-wrap">{msg.role === 'assistant' ? cleanText(msg.content) : msg.content}</div>
                </div>
              ))}
              {loading && <div className="text-xs text-slate-500 animate-pulse">CampusCopilot is analyzing module history...</div>}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2 max-w-4xl mx-auto">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={activeCourse ? `Ask questions specific to ${activeCourse.name}...` : "Enter prompt regarding any course, bug, or topic..."}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 text-slate-200"
                />
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold px-5 py-2.5 rounded text-sm transition">EXECUTE</button>
              </form>
            </div>
          </>
        )}

        {activeTab === 'modules' && (
          <div className="flex-1 p-8 overflow-y-auto max-w-4xl mx-auto w-full">
            <h2 className="text-2xl font-bold text-emerald-400 mb-2">Course Modules</h2>
            <p className="text-slate-400 text-sm mb-6">Manage, edit, or select a course to jump straight into its dedicated AI workspace history.</p>
            
            <form onSubmit={addModule} className="flex gap-2 mb-8 bg-slate-900 p-4 rounded-lg border border-slate-800">
              <input 
                type="text" 
                placeholder="Course Name (e.g., Operating Systems)" 
                value={newModule.name}
                onChange={(e) => setNewModule({...newModule, name: e.target.value})}
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <input 
                type="text" 
                placeholder="Course Code (e.g., IT-205)" 
                value={newModule.code}
                onChange={(e) => setNewModule({...newModule, code: e.target.value})}
                className="w-40 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold px-4 py-2 rounded text-sm transition">Add Module</button>
            </form>

            <div className="space-y-3">
              {modules.map((mod) => (
                <div key={mod.id} className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-lg">
                  {editingModuleId === mod.id ? (
                    <div className="flex gap-2 flex-1 mr-4">
                      <input 
                        type="text" 
                        value={editModuleName}
                        onChange={(e) => setEditModuleName(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200"
                      />
                      <input 
                        type="text" 
                        value={editModuleCode}
                        onChange={(e) => setEditModuleCode(e.target.value)}
                        className="w-28 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200 font-mono"
                      />
                      <button onClick={() => saveEditedModule(mod.id)} className="bg-emerald-600 text-slate-950 text-xs px-3 py-1 rounded font-semibold">Save</button>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-semibold text-slate-200">{mod.name}</h3>
                      <span className="text-xs text-emerald-400 font-mono">{mod.code}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={() => selectCourseForWorkspace(mod)} className="text-xs bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 px-3 py-1.5 rounded transition">Open Workspace</button>
                    {editingModuleId !== mod.id && (
                      <button onClick={() => startEditingModule(mod)} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded transition">Edit</button>
                    )}
                    <button onClick={() => deleteModule(mod.id)} className="text-xs bg-red-950/50 hover:bg-red-900/80 text-red-400 border border-red-800 px-3 py-1.5 rounded transition">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'protocol' && (
          <div className="flex-1 p-8 overflow-y-auto max-w-4xl mx-auto w-full">
            <h2 className="text-2xl font-bold text-emerald-400 mb-2">Task Protocol</h2>
            <p className="text-slate-400 text-sm mb-6">Track your workflow automation, deadlines, and project assignment execution protocols.</p>
            
            <form onSubmit={addTask} className="flex gap-2 mb-8 bg-slate-900 p-4 rounded-lg border border-slate-800">
              <input 
                type="text" 
                placeholder="Task title or project requirement..." 
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <input 
                type="date" 
                value={newTaskDeadline}
                onChange={(e) => setNewTaskDeadline(e.target.value)}
                className="w-40 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold px-4 py-2 rounded text-sm transition">Add Task</button>
            </form>

            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-slate-200">{task.title}</h3>
                    <span className="text-xs text-slate-400">Deadline: {task.deadline}</span>
                  </div>
                  <button onClick={() => deleteTask(task.id)} className="text-xs bg-red-950/50 hover:bg-red-900/80 text-red-400 border border-red-800 px-3 py-1.5 rounded transition">Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}