export interface LearningActivity {
  day: number;
  chapter: string;
  moduleTitle: string;
  objective: string;
  cognitiveTask: string;
  learnerActivity: string;
  deliveryMethod: string;
  media: string;
  contentType: string;
  duration: number;
  link?: string;
  plan?: string;
  notes?: string;
  isBreak?: boolean;
  breakLabel?: string;
  transferLevel?: string;
  instructionalMode?: string;
  dayOrder?: number;
}

export interface AppState {
  activities: LearningActivity[];
  defaultStartTime: string;
  areTimeColumnsHidden: boolean;
  arePlannerColumnsHidden: boolean;
  areBreaksHidden: boolean;
  isFormOpen: boolean;
  currentProductName: string;
  currentProgramName: string;
  hiddenDays: Record<number, boolean>;
  undoStack: LearningActivity[][];
  editIndex: number | null;
  isLoading: boolean;
}
