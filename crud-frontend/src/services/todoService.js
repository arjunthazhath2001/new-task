import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Add auth token to requests
const authAxios = axios.create();
authAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Get all todos
export const getTodos = async () => {
  try {
    const response = await authAxios.get(`${API_URL}/todos`);
    return response.data;
  } catch (error) {
    console.error('Error fetching todos:', error);
    throw error;
  }
};

// Add a new todo
export const addTodo = async (title) => {
  try {
    const response = await authAxios.post(`${API_URL}/todos`, { title });
    return response.data;
  } catch (error) {
    console.error('Error adding todo:', error);
    throw error;
  }
};

// Update a todo
export const updateTodo = async (id, title) => {
  try {
    const response = await authAxios.put(`${API_URL}/todos/${id}`, { title });
    return response.data;
  } catch (error) {
    console.error('Error updating todo:', error);
    throw error;
  }
};

// Delete a todo
export const deleteTodo = async (id) => {
  try {
    await authAxios.delete(`${API_URL}/todos/${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }
};