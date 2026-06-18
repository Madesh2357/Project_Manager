export const PROJECT_STATUS_LABELS = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

export const TASK_STATUS_LABELS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

export const TASK_PRIORITY_LABELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getErrorMessage(error) {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.errors?.length) {
    return error.response.data.errors.map((e) => e.message).join(', ');
  }
  return 'An unexpected error occurred';
}

export function statusBadgeClass(status) {
  const map = {
    NOT_STARTED: 'badge-gray',
    IN_PROGRESS: 'badge-blue',
    COMPLETED: 'badge-green',
    PENDING: 'badge-yellow',
    LOW: 'badge-gray',
    MEDIUM: 'badge-blue',
    HIGH: 'badge-red',
  };
  return `badge ${map[status] || 'badge-gray'}`;
}
