import React, { useState } from 'react';
import { Building, Task, TaskType, Status, PartData } from './types';
import { INITIAL_TASKS } from './constants';
import { Dashboard } from './components/Dashboard';
import { TrackingTable } from './components/TrackingTable';
import { downloadCSV } from './utils/exportUtils';
import { Printer, Download, Plus, LayoutDashboard, Building2, Building as BuildingIcon } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'buildingA' | 'buildingB'>('dashboard');
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  // --- Actions ---

  const handleUpdateTask = (taskId: string, partKey: string, field: string, value: any) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        parts: {
          ...t.parts,
          [partKey]: {
            ...t.parts[partKey],
            [field]: value
          }
        }
      };
    }));
  };

  const handleUpdateRemarks = (taskId: string, value: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, remarks: value } : t));
  };

  const handleUpdateTaskDetail = (taskId: string, field: keyof Task, value: any) => {
    // Logic: If user clears the name, confirm deletion
    if (field === 'elementName' && (!value || value.trim() === '')) {
      if (window.confirm("Name cleared. Delete this task?")) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        return;
      }
      // If cancelled, do not update state, so the old name remains
      return;
    }

    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        [field]: value
      };
    }));
  };

  const handleAddTask = () => {
    const building = activeTab === 'buildingA' ? Building.A : Building.B;
    const newId = (Math.max(...tasks.map(t => parseInt(t.id) || 0), 0) + 1).toString();
    
    const createEmptyPart = () => ({ status: Status.NOT_SUBMITTED, startDate: '', endDate: '', remarks: '' });
    
    const newTask: Task = {
      id: newId,
      building: building,
      elementName: "New Element",
      type: TaskType.CDM,
      parts: building === Building.A 
        ? { A: createEmptyPart(), B: createEmptyPart(), C: createEmptyPart() } 
        : { Single: createEmptyPart() },
      remarks: ""
    };
    
    setTasks([...tasks, newTask]);
  };

  const handleReorderTask = (taskId: string, direction: 'up' | 'down') => {
    setTasks(prev => {
      const index = prev.findIndex(t => t.id === taskId);
      if (index === -1) return prev;
      
      const sameBuildingIndices = prev
        .map((t, i) => t.building === prev[index].building ? i : -1)
        .filter(i => i !== -1);
      
      const currentPosInBuilding = sameBuildingIndices.indexOf(index);
      
      if (direction === 'up') {
        if (currentPosInBuilding <= 0) return prev; 
        const swapTargetIndex = sameBuildingIndices[currentPosInBuilding - 1];
        
        const newTasks = [...prev];
        [newTasks[index], newTasks[swapTargetIndex]] = [newTasks[swapTargetIndex], newTasks[index]];
        return newTasks;
      } else {
        if (currentPosInBuilding >= sameBuildingIndices.length - 1) return prev; 
        const swapTargetIndex = sameBuildingIndices[currentPosInBuilding + 1];
        
        const newTasks = [...prev];
        [newTasks[index], newTasks[swapTargetIndex]] = [newTasks[swapTargetIndex], newTasks[index]];
        return newTasks;
      }
    });
  };

  const handleExport = () => {
    downloadCSV(tasks, `Sportsplex_Tracker_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-md print:hidden">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Sportsplex Project</h1>
            <p className="text-xs text-slate-400">Structural Shop Drawing Tracker</p>
          </div>
          <div className="flex gap-3">
             <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors"
            >
              <Download size={16} /> Export
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium transition-colors"
            >
              <Printer size={16} /> Print Report
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6 print:px-0 print:py-0 print:max-w-full">
        
        {/* Tabs (Hidden on Print, Tabs content is selective on Print based on active view) */}
        <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg w-fit mb-6 print:hidden">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'dashboard' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <LayoutDashboard size={16} /> Dashboard
          </button>
          <button
            onClick={() => setActiveTab('buildingA')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'buildingA' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Building2 size={16} /> Building A (Matrix)
          </button>
          <button
            onClick={() => setActiveTab('buildingB')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'buildingB' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BuildingIcon size={16} /> Building B (Matrix)
          </button>
        </div>

        {/* Content Render */}
        <div className="bg-white rounded-xl shadow-sm min-h-[600px] p-6 print:p-0 print:shadow-none print:min-h-0">
          
          {/* Dashboard View */}
          <div className={activeTab === 'dashboard' ? 'block' : 'hidden'}>
             <div className="print:block mb-6 hidden">
               <h2 className="text-2xl font-bold border-b pb-2 mb-4">Executive Dashboard</h2>
             </div>
             <Dashboard tasks={tasks} />
          </div>

          {/* Building A View */}
          <div className={activeTab === 'buildingA' ? 'block' : 'hidden'}>
            <div className="flex justify-between items-center mb-4 print:mb-2">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                Building A Tracking Matrix
              </h2>
              <button 
                onClick={handleAddTask}
                className="flex items-center gap-1 text-sm bg-green-50 text-green-700 px-3 py-1 rounded border border-green-200 hover:bg-green-100 print:hidden"
              >
                <Plus size={16} /> Add Task
              </button>
            </div>
            <TrackingTable 
              building={Building.A} 
              tasks={tasks} 
              onUpdateTask={handleUpdateTask} 
              onUpdateRemarks={handleUpdateRemarks}
              onUpdateTaskDetail={handleUpdateTaskDetail}
              onReorderTask={handleReorderTask}
            />
          </div>

          {/* Building B View */}
          <div className={activeTab === 'buildingB' ? 'block' : 'hidden'}>
            <div className="flex justify-between items-center mb-4 print:mb-2">
               <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
                Building B Tracking Matrix
              </h2>
              <button 
                onClick={handleAddTask}
                className="flex items-center gap-1 text-sm bg-green-50 text-green-700 px-3 py-1 rounded border border-green-200 hover:bg-green-100 print:hidden"
              >
                <Plus size={16} /> Add Task
              </button>
            </div>
            <TrackingTable 
              building={Building.B} 
              tasks={tasks} 
              onUpdateTask={handleUpdateTask} 
              onUpdateRemarks={handleUpdateRemarks}
              onUpdateTaskDetail={handleUpdateTaskDetail}
              onReorderTask={handleReorderTask}
            />
          </div>

        </div>

        {/* Print Footer */}
        <div className="hidden print:block fixed bottom-0 left-0 w-full text-center text-xs text-gray-400 p-2 bg-white">
          Sportsplex Project - Structural Tracking System | Generated on {new Date().toLocaleDateString()}
        </div>
      </main>
    </div>
  );
}