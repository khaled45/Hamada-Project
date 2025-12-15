import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell,
} from 'recharts';
import { Status, Task, STATUS_COLORS, STATUS_HEX, Building, TaskType } from '../types';

interface DashboardProps {
  tasks: Task[];
}

export const Dashboard: React.FC<DashboardProps> = ({ tasks }) => {
  
  // --- Data Aggregation Logic ---
  
  const allParts = tasks.flatMap(t => Object.values(t.parts));
  const totalParts = allParts.length;
  const submittedCount = allParts.filter(p => p.status !== Status.NOT_SUBMITTED).length;
  const pendingCount = totalParts - submittedCount;
  
  const statusCounts = allParts.reduce((acc, part) => {
    acc[part.status] = (acc[part.status] || 0) + 1;
    return acc;
  }, {} as Record<Status, number>);

  const codeACount = statusCounts[Status.CODE_A] || 0;
  const codeBCount = statusCounts[Status.CODE_B] || 0;
  const approvedCount = codeACount + codeBCount;
  
  const progressPercent = totalParts > 0 ? Math.round((approvedCount / totalParts) * 100) : 0;
  
  // Data for Charts
  const pieData = Object.values(Status).filter(s => s !== Status.NOT_SUBMITTED).map(status => ({
    name: status,
    value: statusCounts[status] || 0
  })).filter(d => d.value > 0);

  const submissionData = [
    { name: 'Submitted', value: submittedCount },
    { name: 'Pending', value: pendingCount }
  ];

  const typeData = [
    { name: 'CDM', Completed: tasks.filter(t => t.type === TaskType.CDM).flatMap(t => Object.values(t.parts)).filter(p => p.status === Status.CODE_A || p.status === Status.CODE_B).length, Total: tasks.filter(t => t.type === TaskType.CDM).flatMap(t => Object.values(t.parts)).length },
    { name: 'RFT', Completed: tasks.filter(t => t.type === TaskType.RFT).flatMap(t => Object.values(t.parts)).filter(p => p.status === Status.CODE_A || p.status === Status.CODE_B).length, Total: tasks.filter(t => t.type === TaskType.RFT).flatMap(t => Object.values(t.parts)).length },
  ];

  // Helper for Heatmap
  const getHeatmapColor = (status: Status) => {
    switch (status) {
      case Status.NOT_SUBMITTED: return 'bg-gray-200';
      case Status.SUBMITTED: return 'bg-blue-400';
      case Status.CODE_A: return 'bg-green-500';
      case Status.CODE_B: return 'bg-yellow-400';
      case Status.CODE_C: return 'bg-red-300';
      case Status.CODE_D: return 'bg-red-600 animate-pulse';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="space-y-8 print:space-y-4">
      
      {/* 1. Executive Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <h3 className="text-sm font-medium text-gray-500">Total Deliverables</h3>
          <p className="text-2xl font-bold text-gray-900">{totalParts}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-indigo-500">
          <h3 className="text-sm font-medium text-gray-500">Submitted</h3>
          <p className="text-2xl font-bold text-gray-900">{submittedCount}</p>
          <p className="text-xs text-gray-400">{Math.round((submittedCount/totalParts)*100)}% of total</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-gray-500">Approved (Code A/B)</h3>
          <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
          <p className="text-xs text-gray-400">Progress: {progressPercent}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
          <h3 className="text-sm font-medium text-gray-500">Pending / Re-Submit</h3>
          <p className="text-2xl font-bold text-gray-900">{pendingCount + (statusCounts[Status.CODE_C]||0) + (statusCounts[Status.CODE_D]||0)}</p>
        </div>
      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3 print:break-inside-avoid">
        {/* Status Distribution */}
        <div className="bg-white p-4 rounded-lg shadow h-80 flex flex-col">
          <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider text-center">Consultant Codes</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_HEX[entry.name as Status]} stroke="#ccc" />
                  ))}
                </Pie>
                <ReTooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Submission Status */}
        <div className="bg-white p-4 rounded-lg shadow h-80 flex flex-col">
          <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider text-center">Submission Status</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={submissionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis />
                <ReTooltip />
                <Bar dataKey="value" fill="#6366f1" barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CDM vs RFT */}
        <div className="bg-white p-4 rounded-lg shadow h-80 flex flex-col">
          <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider text-center">Discipline Progress</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} layout="vertical">
                 <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                 <XAxis type="number" />
                 <YAxis dataKey="name" type="category" width={40} />
                 <ReTooltip />
                 <Legend />
                 <Bar dataKey="Completed" stackId="a" fill="#10b981" barSize={30} />
                 <Bar dataKey="Total" stackId="a" fill="#e5e7eb" barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Consultant Deliverables Control Table (Heatmap) */}
      <div className="bg-white rounded-lg shadow overflow-hidden print:shadow-none print:border print:border-gray-300">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 print:bg-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Consultant Deliverables Control</h3>
          <p className="text-xs text-gray-500">Visual Status Only - For Rapid Monitoring</p>
        </div>
        
        <div className="p-0 overflow-x-auto">
          <table className="min-w-full text-center border-collapse">
            <thead>
              <tr>
                <th className="bg-gray-100 p-2 text-xs font-bold text-gray-600 border border-gray-200 text-left w-64">Element</th>
                <th className="bg-gray-100 p-2 text-xs font-bold text-gray-600 border border-gray-200 w-20">Type</th>
                {/* Building A Headers */}
                <th colSpan={3} className="bg-blue-50 p-2 text-xs font-bold text-blue-800 border border-blue-200">Building A</th>
                {/* Building B Header */}
                <th className="bg-indigo-50 p-2 text-xs font-bold text-indigo-800 border border-indigo-200">Building B</th>
              </tr>
              <tr>
                <th className="border border-gray-200"></th>
                <th className="border border-gray-200"></th>
                <th className="bg-blue-50 p-1 text-xs text-blue-600 border border-blue-200 w-24">Part A</th>
                <th className="bg-blue-50 p-1 text-xs text-blue-600 border border-blue-200 w-24">Part B</th>
                <th className="bg-blue-50 p-1 text-xs text-blue-600 border border-blue-200 w-24">Part C</th>
                <th className="bg-indigo-50 p-1 text-xs text-indigo-600 border border-indigo-200 w-24">Single</th>
              </tr>
            </thead>
            <tbody>
              {/* Group by element name to merge logical rows if needed, but for simple dashboard, list all */}
              {tasks.reduce((rows: any[], task) => {
                // Find matching task in other building to align them? 
                // For simplicity in this simplified view, we just list Building A tasks then try to find matching B tasks or list B tasks separately.
                // Actually, simplified view usually consolidates. Let's list all unique elements and their status per building.
                
                // Let's stick to listing tasks as they come but grouped visually
                return [...rows, task];
              }, []).map((task) => {
                // Determine Parts
                const isBldgA = task.building === Building.A;
                
                return (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="p-2 border border-gray-200 text-left text-sm font-medium text-gray-700 truncate max-w-xs">
                       {task.elementName} <span className="text-xs text-gray-400 ml-1">({task.building === Building.A ? 'A' : 'B'})</span>
                    </td>
                    <td className="p-2 border border-gray-200 text-xs font-bold text-gray-500">{task.type}</td>
                    
                    {/* Render Part A, B, C cells */}
                    {isBldgA ? (
                      <>
                        <td className="p-1 border border-gray-200">
                          <div className={`h-6 w-full rounded-sm ${getHeatmapColor(task.parts['A'].status)}`} title={`Part A: ${task.parts['A'].status}`}></div>
                        </td>
                        <td className="p-1 border border-gray-200">
                           <div className={`h-6 w-full rounded-sm ${getHeatmapColor(task.parts['B'].status)}`} title={`Part B: ${task.parts['B'].status}`}></div>
                        </td>
                        <td className="p-1 border border-gray-200">
                           <div className={`h-6 w-full rounded-sm ${getHeatmapColor(task.parts['C'].status)}`} title={`Part C: ${task.parts['C'].status}`}></div>
                        </td>
                        <td className="p-1 border border-gray-200 bg-gray-50">
                          {/* Empty for Bldg B column if this is a Bldg A row */}
                        </td>
                      </>
                    ) : (
                      <>
                         <td className="p-1 border border-gray-200 bg-gray-50"></td>
                         <td className="p-1 border border-gray-200 bg-gray-50"></td>
                         <td className="p-1 border border-gray-200 bg-gray-50"></td>
                         <td className="p-1 border border-gray-200">
                           <div className={`h-6 w-full rounded-sm ${getHeatmapColor(task.parts['Single'].status)}`} title={`Single: ${task.parts['Single'].status}`}></div>
                         </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="p-3 flex items-center justify-center gap-4 text-xs text-gray-600 bg-white border-t border-gray-200">
            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-200 border border-gray-300 rounded-sm"></span> Not Submitted</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-400 rounded-sm"></span> Submitted</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded-sm"></span> Code A</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-400 rounded-sm"></span> Code B</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-red-300 rounded-sm"></span> Code C</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-red-600 rounded-sm animate-pulse"></span> Code D</div>
          </div>
        </div>
      </div>
    </div>
  );
};
