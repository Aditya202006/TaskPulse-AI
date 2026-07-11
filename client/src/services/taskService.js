import api from './api';

/**
 * Fetch all tasks for the current user
 * @returns {Promise<Array>} List of user tasks
 */
export const fetchTasks = async () => {
  const response = await api.get('/tasks');
  return response.data;
};

/**
 * Create a new task manually
 * @param {Object} taskData - Task attributes
 * @returns {Promise<Object>} Created task object
 */
export const createTaskManual = async (taskData) => {
  const response = await api.post('/tasks', taskData);
  return response.data;
};

/**
 * Update an existing task
 * @param {string} id - Task ID
 * @param {Object} updates - Updated task fields
 * @returns {Promise<Object>} Updated task object
 */
export const updateTaskApi = async (id, updates) => {
  const response = await api.put(`/tasks/${id}`, updates);
  return response.data;
};

/**
 * Delete a task
 * @param {string} id - Task ID
 * @returns {Promise<Object>} Success message and deleted ID
 */
export const deleteTaskApi = async (id) => {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
};

/**
 * Upload document and extract tasks using OCR and Gemini
 * @param {File} file - PDF, TXT, or Image file
 * @returns {Promise<Object>} Array of extracted tasks and details
 */
export const extractTasksFromFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/extract', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

/**
 * Trigger Gmail sync and extract new tasks from matching emails
 * @returns {Promise<Object>} Object containing status message and list of newly created tasks
 */
export const syncGmailTasksApi = async () => {
  const response = await api.post('/gmail/sync');
  return response.data;
};
