import axios from 'axios';

const API_URL = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');

export type TaskCategory = {
  id: string;
  name: string;
  slug: string;
  colorKey: string;
  iconKey: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type Task = {
  id: string;
  assignedTo: string;
  seriesId: string | null;
  originalOccurrenceDate: string | null;
  title: string;
  description: string | null;
  categoryId: string;
  kind: string;
  modality: string;
  status: string;
  taskDate: string;
  timeMode: string;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  isException: boolean;
  metadata: Record<string, unknown>;
  completedAt: string | null;
  canceledAt: string | null;
};

export type TaskSeries = {
  id: string;
  assignedTo: string;
  title: string;
  description: string | null;
  categoryId: string;
  kind: string;
  modality: string;
  location: string | null;
  timeMode: string;
  startTime: string | null;
  endTime: string | null;
  startsOn: string;
  endsOn: string | null;
  recurrenceRule: string;
  status: string;
  generatedThrough: string | null;
  metadata: Record<string, unknown>;
};

export type CreateTaskRequest = {
  assignedTo: string;
  title: string;
  description?: string;
  categoryId: string;
  kind: string;
  modality: string;
  taskDate: string;
  timeMode: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  metadata?: Record<string, unknown>;
};

export type CreateSeriesRequest = {
  assignedTo: string;
  title: string;
  description?: string;
  categoryId: string;
  kind: string;
  modality: string;
  location?: string;
  timeMode: string;
  startTime?: string;
  endTime?: string;
  startsOn: string;
  endsOn?: string;
  recurrenceRule: string;
  metadata?: Record<string, unknown>;
};

export const fetchCategories = async (): Promise<TaskCategory[]> => {
  const response = await axios.get(`${API_URL}/api/tasks/categories`);
  return response.data;
};

export const fetchTasks = async (
  from: string,
  to: string,
  status?: string,
  assignedTo?: string,
): Promise<Task[]> => {
  const params = new URLSearchParams({ from, to });
  if (status) params.set('status', status);
  if (assignedTo) params.set('assignedTo', assignedTo);
  const response = await axios.get(`${API_URL}/api/tasks?${params.toString()}`);
  return response.data;
};

export const createTask = async (data: CreateTaskRequest): Promise<Task> => {
  const response = await axios.post(`${API_URL}/api/tasks`, data);
  return response.data;
};

export const updateTask = async (
  id: string,
  data: Partial<Task>,
): Promise<Task> => {
  const response = await axios.patch(`${API_URL}/api/tasks/${id}`, data);
  return response.data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/api/tasks/${id}`);
};

export const createSeries = async (
  data: CreateSeriesRequest,
): Promise<{ series: TaskSeries; tasks: Task[] }> => {
  const response = await axios.post(`${API_URL}/api/tasks/series`, data);
  return response.data;
};
