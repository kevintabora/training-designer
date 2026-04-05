import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LearningActivity, AppState } from "@/types";

interface AppStore extends AppState {
  setActivities: (activities: LearningActivity[]) => void;
  addActivity: (activity: LearningActivity) => void;
  updateActivity: (index: number, activity: LearningActivity) => void;
  deleteActivity: (index: number) => void;
  reorderActivities: (activities: LearningActivity[]) => void;
  pushUndo: (activities: LearningActivity[]) => void;
  undo: () => void;
  setDefaultStartTime: (time: string) => void;
  setTimeColumnsHidden: (hidden: boolean) => void;
  setPlannerColumnsHidden: (hidden: boolean) => void;
  setProductName: (name: string) => void;
  setProgramName: (name: string) => void;
  setHiddenDay: (day: number, hidden: boolean) => void;
  setEditIndex: (index: number | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState: AppState = {
  activities: [],
  defaultStartTime: "09:00",
  areTimeColumnsHidden: true,
  arePlannerColumnsHidden: true,
  currentProductName: "",
  currentProgramName: "",
  hiddenDays: {},
  undoStack: [],
  editIndex: null,
  isLoading: true,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setActivities: (activities) => set({ activities }),

      addActivity: (activity) =>
        set((s) => ({ activities: [...s.activities, activity] })),

      updateActivity: (index, activity) =>
        set((s) => {
          const updated = [...s.activities];
          updated[index] = activity;
          return { activities: updated };
        }),

      deleteActivity: (index) =>
        set((s) => ({
          activities: s.activities.filter((_, i) => i !== index),
        })),

      reorderActivities: (activities) => set({ activities }),

      pushUndo: (activities) =>
        set((s) => ({
          undoStack: [...s.undoStack.slice(-49), activities],
        })),

      undo: () =>
        set((s) => {
          if (s.undoStack.length === 0) return s;
          const previous = s.undoStack[s.undoStack.length - 1];
          return {
            activities: previous,
            undoStack: s.undoStack.slice(0, -1),
          };
        }),

      setDefaultStartTime: (time) => set({ defaultStartTime: time }),
      setTimeColumnsHidden: (hidden) => set({ areTimeColumnsHidden: hidden }),
      setPlannerColumnsHidden: (hidden) => set({ arePlannerColumnsHidden: hidden }),
      setProductName: (name) => set({ currentProductName: name }),
      setProgramName: (name) => set({ currentProgramName: name }),
      setHiddenDay: (day, hidden) =>
        set((s) => ({ hiddenDays: { ...s.hiddenDays, [day]: hidden } })),
      setEditIndex: (index) => set({ editIndex: index }),
      setLoading: (loading) => set({ isLoading: loading }),

      reset: () => set(initialState),
    }),
    {
      name: "training-designer-storage",
      partialize: (s) => ({
        activities: s.activities,
        defaultStartTime: s.defaultStartTime,
        currentProductName: s.currentProductName,
        currentProgramName: s.currentProgramName,
        hiddenDays: s.hiddenDays,
        areTimeColumnsHidden: s.areTimeColumnsHidden,
        arePlannerColumnsHidden: s.arePlannerColumnsHidden,
      }),
    }
  )
);
