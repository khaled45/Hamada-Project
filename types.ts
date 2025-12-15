export enum Status {
  NOT_SUBMITTED = "Not Submitted",
  SUBMITTED = "Submitted / Under Review",
  CODE_A = "Code A",
  CODE_B = "Code B",
  CODE_C = "Code C",
  CODE_D = "Code D"
}

export enum TaskType {
  CDM = "CDM",
  RFT = "RFT"
}

export enum Building {
  A = "Building A",
  B = "Building B"
}

export interface PartData {
  status: Status;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  remarks: string;   // New field for per-part remarks
}

export interface Task {
  id: string;
  elementName: string;
  type: TaskType;
  building: Building;
  // Dynamic keys for parts. Building A uses "A", "B", "C". Building B uses "Single"
  parts: Record<string, PartData>;
  remarks: string; // Global task remarks
}

export const STATUS_COLORS: Record<Status, string> = {
  [Status.NOT_SUBMITTED]: "bg-gray-200 text-gray-700 border-gray-300",
  [Status.SUBMITTED]: "bg-blue-100 text-blue-800 border-blue-300",
  [Status.CODE_A]: "bg-green-100 text-green-800 border-green-300",
  [Status.CODE_B]: "bg-yellow-100 text-yellow-800 border-yellow-300",
  [Status.CODE_C]: "bg-red-100 text-red-800 border-red-300",
  [Status.CODE_D]: "bg-red-600 text-white border-red-700 animate-pulse" // Critical
};

export const STATUS_HEX: Record<Status, string> = {
  [Status.NOT_SUBMITTED]: "#E5E7EB",
  [Status.SUBMITTED]: "#DBEAFE",
  [Status.CODE_A]: "#DCFCE7",
  [Status.CODE_B]: "#FEF9C3",
  [Status.CODE_C]: "#FEE2E2",
  [Status.CODE_D]: "#DC2626"
};
