import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockPlan } from './mockPlan';
import { LocalState, Plan, WorkoutLog } from './types';

const STORAGE_KEY = 'fitcoach_state_v1';

const defaultState: LocalState = {
  plan: mockPlan,
  logs: {},
};

function isValidState(state: unknown): state is LocalState {
  if (!state || typeof state !== 'object') return false;
  const typed = state as LocalState;
  return typed.plan?.app === 'fitcoach' && typed.plan?.version === 1;
}

export async function getState(): Promise<LocalState> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultState;
  try {
    const parsed = JSON.parse(raw) as LocalState;
    if (!isValidState(parsed)) {
      return defaultState;
    }
    return parsed;
  } catch {
    return defaultState;
  }
}

export async function setState(next: LocalState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export async function resetState(): Promise<LocalState> {
  await setState(defaultState);
  return defaultState;
}

export async function updatePlan(updater: (plan: Plan) => Plan): Promise<LocalState> {
  const current = await getState();
  const nextPlan = updater(current.plan);
  const nextState: LocalState = { ...current, plan: nextPlan };
  await setState(nextState);
  return nextState;
}

export async function upsertLog(log: WorkoutLog): Promise<LocalState> {
  const current = await getState();
  const nextState: LocalState = {
    ...current,
    logs: {
      ...current.logs,
      [log.assignmentId]: log,
    },
  };
  await setState(nextState);
  return nextState;
}

export async function getLog(assignmentId: string): Promise<WorkoutLog | undefined> {
  const current = await getState();
  return current.logs[assignmentId];
}
