import { api } from './client.js';

export const teamApi = {
    getMembers: () => api.get('/team/members'),
    createTeam: (name) => api.post('/team', { name }),
    joinTeam: (code) => api.post('/team/join', { code }),
    getMyTeams: () => api.get('/team'),
};
