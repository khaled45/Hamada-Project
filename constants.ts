import { Building, Status, Task, TaskType } from './types';

const createPart = (): any => ({
  status: Status.NOT_SUBMITTED,
  startDate: "",
  endDate: "",
  remarks: "" // Initialize empty remarks
});

export const INITIAL_TASKS: Task[] = [
  // Building A Tasks (Parts A, B, C)
  {
    id: "1",
    building: Building.A,
    elementName: "Raft Foundation",
    type: TaskType.CDM,
    parts: { A: createPart(), B: createPart(), C: createPart() },
    remarks: ""
  },
  {
    id: "2",
    building: Building.A,
    elementName: "Raft Foundation",
    type: TaskType.RFT,
    parts: { A: createPart(), B: createPart(), C: createPart() },
    remarks: ""
  },
  {
    id: "3",
    building: Building.A,
    elementName: "Vertical Elements (B1)",
    type: TaskType.CDM,
    parts: { A: createPart(), B: createPart(), C: createPart() },
    remarks: ""
  },
  {
    id: "4",
    building: Building.A,
    elementName: "Vertical Elements (B1)",
    type: TaskType.RFT,
    parts: { A: createPart(), B: createPart(), C: createPart() },
    remarks: ""
  },
  {
    id: "5",
    building: Building.A,
    elementName: "Slab on Grade",
    type: TaskType.CDM,
    parts: { A: createPart(), B: createPart(), C: createPart() },
    remarks: "Coordination required with MEP"
  },
  // Building B Tasks (Single Part)
  {
    id: "101",
    building: Building.B,
    elementName: "Isolated Footings",
    type: TaskType.CDM,
    parts: { Single: createPart() },
    remarks: ""
  },
  {
    id: "102",
    building: Building.B,
    elementName: "Isolated Footings",
    type: TaskType.RFT,
    parts: { Single: createPart() },
    remarks: ""
  },
  {
    id: "103",
    building: Building.B,
    elementName: "Ground Beams",
    type: TaskType.CDM,
    parts: { Single: createPart() },
    remarks: ""
  },
  {
    id: "104",
    building: Building.B,
    elementName: "Ground Beams",
    type: TaskType.RFT,
    parts: { Single: createPart() },
    remarks: ""
  }
];
