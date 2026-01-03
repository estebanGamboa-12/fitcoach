import { addDays, formatDate } from './date';
import { Plan } from './types';

const today = new Date();

const workouts = [
  {
    id: 'workout-push',
    title: 'Push',
    notes: 'Enfocado en pecho, hombro y tríceps.',
    items: [
      { id: 'push-1', name: 'Press banca', sets: 4, reps: '6-8', restSeconds: 120 },
      { id: 'push-2', name: 'Press inclinado mancuerna', sets: 3, reps: '8-10', restSeconds: 90 },
      { id: 'push-3', name: 'Press militar', sets: 3, reps: '8-10', restSeconds: 90 },
      { id: 'push-4', name: 'Elevaciones laterales', sets: 3, reps: '12-15', restSeconds: 60 },
    ],
  },
  {
    id: 'workout-pull',
    title: 'Pull',
    notes: 'Espalda y bíceps. Controla la técnica.',
    items: [
      { id: 'pull-1', name: 'Remo con barra', sets: 4, reps: '6-8', restSeconds: 120 },
      { id: 'pull-2', name: 'Dominadas asistidas', sets: 3, reps: '8-10', restSeconds: 90 },
      { id: 'pull-3', name: 'Pulldown agarre neutro', sets: 3, reps: '10-12', restSeconds: 75 },
      { id: 'pull-4', name: 'Curl bíceps', sets: 3, reps: '12-15', restSeconds: 60 },
    ],
  },
  {
    id: 'workout-legs',
    title: 'Legs',
    notes: 'Prioridad en fuerza de piernas.',
    items: [
      { id: 'legs-1', name: 'Sentadilla', sets: 4, reps: '5-6', restSeconds: 150 },
      { id: 'legs-2', name: 'Peso muerto rumano', sets: 3, reps: '8-10', restSeconds: 120 },
      { id: 'legs-3', name: 'Prensa', sets: 3, reps: '10-12', restSeconds: 90 },
      { id: 'legs-4', name: 'Elevación de gemelos', sets: 3, reps: '12-15', restSeconds: 60 },
      { id: 'legs-5', name: 'Plancha', sets: 3, reps: '30s', restSeconds: 45 },
    ],
  },
];

const assignments = Array.from({ length: 7 }, (_, index) => {
  const date = addDays(today, index);
  return {
    id: `assignment-${index + 1}`,
    scheduledDate: formatDate(date),
    workoutId: workouts[index % workouts.length].id,
  };
});

export const mockPlan: Plan = {
  app: 'fitcoach',
  version: 1,
  client: { id: 'client-demo', name: 'Cliente Demo' },
  workouts,
  assignments,
};
