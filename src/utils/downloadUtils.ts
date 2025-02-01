import { format } from 'date-fns';

export const downloadWorkoutJson = (jsonString: string) => {
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const fileName = `workout-routine-${format(new Date(), 'yyyy-MM-dd')}.json`;
  
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
