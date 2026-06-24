import { api } from './client.js';

export const chatApi = {
    getMessages: (teamId) => api.get(`/chat/${teamId}`),
    sendMessage: (teamId, message) => api.post(`/chat/${teamId}`, { message }),
    deleteMessage: (messageId) => api.delete(`/chat/${messageId}`),
};
