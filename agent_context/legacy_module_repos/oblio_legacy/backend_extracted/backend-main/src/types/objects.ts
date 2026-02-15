interface ObjectQuery {
  object: string;
}

interface Contact {
  id: string;
  department: string;
  experience: string;
  team: string;
  fullName: string;
  userPerformance: Performance;
}

interface Performance {
  MQL: string;
  SQL: string;
  CUS: string;
  RET: string;
}

interface Activity {
  id: string;
  activityAction: string;
  activityType: string;
  assignedToContact: boolean;
  assignedToCreative: boolean;
  createdBy: string;
  ownedBy: string;
  updatedBy: string;
}
