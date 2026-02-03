import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://todo-app-nu-woad.vercel.app';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  signup: async (email: string, password: string, name: string) => {
    const response = await apiClient.post('/api/auth/signup', { email, password, name });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await apiClient.post('/api/auth/login', { email, password });
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },
};

// Task API
export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  completed?: boolean;
}

export const taskAPI = {
  getTasks: async (filter?: string, sortBy?: string, search?: string): Promise<Task[]> => {
    const params: Record<string, string> = {};
    if (filter) params.filter = filter;
    if (sortBy) params.sort_by = sortBy;
    if (search) params.search = search;

    const response = await apiClient.get('/api/tasks', { params });
    return response.data;
  },

  getTask: async (taskId: string): Promise<Task> => {
    const response = await apiClient.get(`/api/tasks/${taskId}`);
    return response.data;
  },

  createTask: async (task: TaskCreate): Promise<Task> => {
    const response = await apiClient.post('/api/tasks', task);
    return response.data;
  },

  updateTask: async (taskId: string, task: TaskUpdate): Promise<Task> => {
    const response = await apiClient.put(`/api/tasks/${taskId}`, task);
    return response.data;
  },

  toggleComplete: async (taskId: string): Promise<Task> => {
    const response = await apiClient.patch(`/api/tasks/${taskId}/complete`);
    return response.data;
  },

  deleteTask: async (taskId: string): Promise<void> => {
    await apiClient.delete(`/api/tasks/${taskId}`);
  },
};

// Chat API
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const chatAPI = {
  sendMessage: async (message: string): Promise<ChatMessage> => {
    const response = await apiClient.post('/api/chat', null, { params: { message } });
    return response.data;
  },

  getHistory: async (limit: number = 20): Promise<ChatMessage[]> => {
    const response = await apiClient.get('/api/chat/history', { params: { limit } });
    return response.data;
  },
};

export default apiClient;
