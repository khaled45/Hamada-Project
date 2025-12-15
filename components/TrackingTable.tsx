import React, { useState } from 'react';
import { Task, Building, Status, STATUS_COLORS, TaskType, PartData } from '../types';
import { differenceInDays, isValid, parseISO } from 'date-fns';
import { Search, FilterX, ArrowUp, ArrowDown } from 'lucide-react';

interface TrackingTableProps {
  building: Building;
  tasks: Task[];
  onUpdateTask: (taskId: string, partKey: string, field: string, value: any) => void;
  onUpdateRemarks: (taskId: string, value: string) => void;
  onUpdateTaskDetail: (taskId: string, field: keyof Task, value: any) => void;
  onReorderTask: (taskId: string, direction: 'up' | 'down') => void;
}

export const TrackingTable: React.FC<TrackingTableProps> = ({ 
  building, 
  tasks, 
  onUpdateTask,
  onUpdateRemarks,
  onUpdateTaskDetail,
  onReorderTask
}) => {
  
  const isBuildingA = building === Building.A;
  const partsList = isBuildingA ? ['A', 'B', 'C'] : ['Single'];

  // --- Filter State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Filter tasks for this building
  const buildingTasks = tasks.filter(t => t.building === building);

  // Apply filters
  const filteredTasks = buildingTasks.filter(task => {
    // 1. Search Filter (Element Name)
    const matchesSearch = task.elementName.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Type Filter
    const matchesType = typeFilter === "ALL" || task.type === typeFilter;

    // 3. Status Filter (Matches if ANY part has this status)
    const matchesStatus = statusFilter === "ALL" || 
      Object.values(task.parts).some((part: PartData) => part.status === statusFilter);

    return matchesSearch && matchesType && matchesStatus;
  });

  const isFiltered = searchTerm !== "" || typeFilter !== "ALL" || statusFilter !== "ALL";

  // Helper to calculate duration display
  const getDuration = (start: string, end: string) => {
    if (!start || !end) return null;
    const s = parseISO(start);
    const e = parseISO(end);
    if (isValid(s) && isValid(e)) {
      const days = differenceInDays(e, s);
      return days >= 0 ? `${days}d` : 'Err';
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-4">
      
      {/* Filter Toolbar (Hidden on Print) */}
      <div className="bg-gray-100 p-3 rounded-lg flex flex-wrap gap-4 items-center print:hidden border border-gray-200">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search elements..."
            className="pl-9 pr-3 py-2 w-full text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 uppercase">Type:</span>
          <select 
            className="text-sm border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">All Types</option>
            {Object.values(TaskType).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 uppercase">Status:</span>
          <select 
            className="text-sm border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            {Object.values(Status).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Reset Filters */}
        {isFiltered && (
          <button 
            onClick={() => { setSearchTerm(""); setTypeFilter("ALL"); setStatusFilter("ALL"); }}
            className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 px-3 py-1 rounded bg-red-50 hover:bg-red-100 transition-colors"
          >
            <FilterX size={16} /> Reset
          </button>
        )}
      </div>

      {/* Table Container: Ensure overflow is visible in print so it doesn't cut off */}
      <div className="overflow-x-auto border rounded-lg shadow-sm bg-white print:border-none print:shadow-none print:overflow-visible">
        <table className="min-w-full border-collapse text-sm print:text-[9px] print:w-full">
          <thead>
            {/* Main Header Row */}
            <tr className="bg-gray-800 text-white print:bg-gray-200 print:text-black">
              <th className="border border-gray-600 px-2 py-3 w-10 sticky left-0 z-10 bg-gray-800 print:bg-gray-200 print:static print:border-gray-400 print:py-1 print:px-1">No.</th>
              <th className="border border-gray-600 px-3 py-3 w-64 text-left sticky left-10 z-10 bg-gray-800 print:bg-gray-200 print:static print:border-gray-400 print:py-1 print:px-1">Task / Element</th>
              <th className="border border-gray-600 px-2 py-3 w-16 text-center print:border-gray-400 print:py-1 print:px-1">Type</th>
              
              {partsList.map(part => (
                <th key={part} colSpan={3} className="border border-gray-600 px-2 py-3 text-center min-w-[280px] print:min-w-0 print:border-gray-400 print:py-1">
                  {isBuildingA ? `Part ${part}` : 'Single Part'}
                </th>
              ))}
              
              <th className="border border-gray-600 px-3 py-3 w-40 text-left print:border-gray-400 print:py-1">Gen. Remarks</th>
              <th className="border border-gray-600 px-2 py-3 w-20 text-center print:hidden">Actions</th>
            </tr>
            
            {/* Sub Header Row */}
            <tr className="bg-gray-100 text-gray-700 font-semibold print:bg-gray-100 print:text-[8px]">
              <th className="border border-gray-300 bg-gray-100 sticky left-0 z-10 print:static print:border-gray-400"></th>
              <th className="border border-gray-300 bg-gray-100 sticky left-10 z-10 print:static print:border-gray-400"></th>
              <th className="border border-gray-300 print:border-gray-400"></th>
              
              {partsList.map(part => (
                <React.Fragment key={`sub-${part}`}>
                  <th className="border border-gray-300 px-2 py-1 text-xs uppercase tracking-wide w-24 print:border-gray-400 print:text-[8px] print:w-auto print:px-1">Status</th>
                  <th className="border border-gray-300 px-2 py-1 text-xs uppercase tracking-wide w-28 print:border-gray-400 print:text-[8px] print:w-auto print:px-1">Dates</th>
                  <th className="border border-gray-300 px-2 py-1 text-xs uppercase tracking-wide print:border-gray-400 print:text-[8px] print:px-1">Notes</th>
                </React.Fragment>
              ))}
              
              <th className="border border-gray-300 print:border-gray-400"></th>
              <th className="border border-gray-300 print:hidden"></th>
            </tr>
          </thead>

          <tbody>
            {filteredTasks.map((task, index) => {
              return (
                <tr key={task.id} className="hover:bg-gray-50 transition-colors print:break-inside-avoid">
                  <td className="border border-gray-300 px-2 py-2 text-center text-gray-500 sticky left-0 bg-white print:static print:border-gray-400 print:py-1 print:px-1 z-10">
                    {index + 1}
                  </td>
                  <td className="border border-gray-300 px-1 py-1 font-medium text-gray-800 sticky left-10 bg-white print:static print:border-gray-400 print:py-0 print:px-1 z-10 break-words">
                    <input 
                      type="text" 
                      className="w-full h-full px-2 py-1 bg-transparent border border-transparent hover:border-gray-200 focus:border-blue-300 focus:outline-none rounded transition-all placeholder-gray-300 print:text-black print:px-0"
                      placeholder="Clear to delete"
                      value={task.elementName}
                      onChange={(e) => onUpdateTaskDetail(task.id, 'elementName', e.target.value)}
                    />
                  </td>
                  <td className="border border-gray-300 px-1 py-1 text-center font-bold text-xs text-gray-600 bg-gray-50 print:bg-white print:border-gray-400 print:py-0">
                    <select 
                      className="w-full h-full bg-transparent text-center focus:outline-none cursor-pointer appearance-none hover:bg-gray-200 rounded print:appearance-none print:bg-transparent"
                      style={{ textAlignLast: 'center' }}
                      value={task.type}
                      onChange={(e) => onUpdateTaskDetail(task.id, 'type', e.target.value)}
                    >
                      {Object.values(TaskType).map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </td>

                  {/* Dynamic Parts Columns */}
                  {partsList.map(partKey => {
                    const partData = task.parts[partKey];
                    const duration = getDuration(partData.startDate, partData.endDate);
                    
                    // Color Logic
                    const isStarted = partData.startDate && !partData.endDate;
                    const isCompleted = partData.startDate && partData.endDate;
                    
                    const startDateStyle = isCompleted 
                      ? "bg-green-100 border-green-300 text-green-800 print:bg-green-100"
                      : isStarted 
                        ? "bg-blue-50 border-blue-300 text-blue-800 print:bg-blue-50"
                        : "bg-transparent border-gray-200 hover:bg-gray-50 print:border-transparent";
                        
                    const endDateStyle = isCompleted 
                      ? "bg-green-100 border-green-300 text-green-800 print:bg-green-100"
                      : "bg-transparent border-gray-200 hover:bg-gray-50 print:border-transparent";

                    return (
                      <React.Fragment key={`${task.id}-${partKey}`}>
                        {/* Status Column */}
                        <td className={`border border-gray-300 px-1 py-1 text-center print:border-gray-400 print:py-0 print:px-0`}>
                          <select 
                            className={`w-full text-[11px] p-1 rounded border-2 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer ${STATUS_COLORS[partData.status]} print:border-none print:text-[8px] print:p-0 print:h-auto`}
                            value={partData.status}
                            onChange={(e) => onUpdateTask(task.id, partKey, 'status', e.target.value)}
                          >
                            {Object.values(Status).map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>

                        {/* Dates Column */}
                        <td className="border border-gray-300 px-1 py-1 align-middle print:border-gray-400 print:py-0 print:px-0">
                          <div className="flex flex-col gap-1 print:gap-0">
                            <div className="flex items-center gap-1 print:hidden">
                              <span className="text-[9px] text-gray-400 w-6 text-right">Start</span>
                              <input 
                                type="date" 
                                className={`text-[10px] border rounded px-1 w-full focus:bg-white transition-colors ${startDateStyle}`}
                                value={partData.startDate}
                                onChange={(e) => onUpdateTask(task.id, partKey, 'startDate', e.target.value)}
                              />
                            </div>
                             <div className="flex items-center gap-1 print:hidden">
                              <span className="text-[9px] text-gray-400 w-6 text-right">End</span>
                              <input 
                                type="date" 
                                className={`text-[10px] border rounded px-1 w-full focus:bg-white transition-colors ${endDateStyle}`}
                                value={partData.endDate}
                                onChange={(e) => onUpdateTask(task.id, partKey, 'endDate', e.target.value)}
                              />
                            </div>
                            
                            {/* Print Only Date Display (Compact) */}
                            <div className="hidden print:flex flex-col text-[8px] leading-tight text-center w-full">
                               {partData.startDate && <div className={`${isCompleted ? 'bg-green-100' : 'bg-blue-50'}`}>{partData.startDate}</div>}
                               {partData.endDate && <div className={`${isCompleted ? 'bg-green-100' : ''}`}>{partData.endDate}</div>}
                            </div>

                            {duration && (
                              <div className="text-[9px] text-right text-gray-500 font-medium pr-1 print:text-[8px] print:text-center print:pr-0">
                                {duration}
                              </div>
                            )}
                          </div>
                        </td>
                        
                        {/* Per-Part Remarks Column */}
                        <td className="border border-gray-300 px-1 py-1 print:border-gray-400 print:py-0">
                          <textarea 
                            className="w-full h-full text-[10px] p-1 border-none bg-transparent resize-y min-h-[50px] focus:ring-1 focus:ring-blue-200 rounded print:text-[8px] print:min-h-0 print:p-0 print:resize-none"
                            placeholder={`Notes...`}
                            value={partData.remarks || ""}
                            onChange={(e) => onUpdateTask(task.id, partKey, 'remarks', e.target.value)}
                          />
                        </td>
                      </React.Fragment>
                    );
                  })}

                  {/* Global Remarks Column */}
                  <td className="border border-gray-300 px-1 py-1 print:border-gray-400 print:py-0">
                    <textarea 
                      className="w-full h-full text-[10px] p-1 border-none bg-transparent resize-y min-h-[50px] focus:ring-1 focus:ring-blue-200 rounded print:text-[9px] print:resize-none"
                      placeholder="General..."
                      value={task.remarks}
                      onChange={(e) => onUpdateRemarks(task.id, e.target.value)}
                    />
                  </td>

                  {/* Actions Column (Hidden in Print) */}
                  <td className="border border-gray-300 px-1 py-1 text-center print:hidden">
                    <div className="flex items-center justify-center gap-1">
                       {!isFiltered && (
                         <div className="flex flex-col gap-1 mr-1">
                            <button 
                              onClick={() => onReorderTask(task.id, 'up')}
                              className="text-gray-400 hover:text-blue-600 p-0.5 rounded hover:bg-gray-100"
                              title="Move Up"
                              disabled={index === 0}
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button 
                              onClick={() => onReorderTask(task.id, 'down')}
                              className="text-gray-400 hover:text-blue-600 p-0.5 rounded hover:bg-gray-100"
                              title="Move Down"
                              disabled={index === filteredTasks.length - 1}
                            >
                              <ArrowDown size={12} />
                            </button>
                         </div>
                       )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {filteredTasks.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            {buildingTasks.length > 0 ? "No tasks match your filters." : `No tasks found for ${building}. Add tasks to begin tracking.`}
          </div>
        )}
      </div>
    </div>
  );
};