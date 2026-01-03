export type Plan = {
  app: 'fitcoach';
  version: 1;
  client: { id: string; name: string };
  workouts: Workout[];
  assignments: Assignment[];
};

export type Workout = {
  id: string;
  title: string;
  notes?: string;
  items: WorkoutItem[];
};

export type WorkoutItem = {
  id: string;
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes?: string;
};

export type Assignment = {
  id: string;
  scheduledDate: string;
  workoutId: string;
};

export type WorkoutLog = {
  assignmentId: string;
  completedAt?: string;
  sets: Record<
    string,
    Record<
      number,
      {
        weight?: number | null;
        reps?: number | null;
        rpe?: number | null;
      }
    >
  >;
};

export type LocalState = {
  plan: Plan;
  logs: Record<string, WorkoutLog>;
};
