import { Task, Building } from "../types";

export const downloadCSV = (tasks: Task[], filename: string) => {
  const headers = [
    "Task ID",
    "Building",
    "Element Name",
    "Type",
    "Part A Status", "Part A Start", "Part A End", "Part A Notes",
    "Part B Status", "Part B Start", "Part B End", "Part B Notes",
    "Part C Status", "Part C Start", "Part C End", "Part C Notes",
    "Single Status", "Single Start", "Single End", "Single Notes",
    "General Remarks"
  ];

  const rows = tasks.map(task => {
    const pA = task.parts['A'] || { status: '', startDate: '', endDate: '', remarks: '' };
    const pB = task.parts['B'] || { status: '', startDate: '', endDate: '', remarks: '' };
    const pC = task.parts['C'] || { status: '', startDate: '', endDate: '', remarks: '' };
    const pS = task.parts['Single'] || { status: '', startDate: '', endDate: '', remarks: '' };

    return [
      task.id,
      task.building,
      `"${task.elementName}"`, // Escape quotes
      task.type,
      `"${pA.status}"`, pA.startDate, pA.endDate, `"${(pA.remarks || '').replace(/"/g, '""')}"`,
      `"${pB.status}"`, pB.startDate, pB.endDate, `"${(pB.remarks || '').replace(/"/g, '""')}"`,
      `"${pC.status}"`, pC.startDate, pC.endDate, `"${(pC.remarks || '').replace(/"/g, '""')}"`,
      `"${pS.status}"`, pS.startDate, pS.endDate, `"${(pS.remarks || '').replace(/"/g, '""')}"`,
      `"${task.remarks.replace(/"/g, '""')}"` // Escape quotes in remarks
    ].join(",");
  });

  const csvContent = "data:text/csv;charset=utf-8," 
    + headers.join(",") + "\n" 
    + rows.join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
