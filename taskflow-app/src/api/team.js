import { api } from './client.js';

export const teamApi = {
    // Get all team members (users who share tasks with current user)
    getMembers: () => api.get('/team'),
};
