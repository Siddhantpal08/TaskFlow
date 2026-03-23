import { api } from './client.js';

export const teamApi = {
    getMembers: () => api.get('/team/members'),
    createTeam: (name) => api.post('/team', { name }),
    joinTeam: (code) => api.post('/team/join', { code }),
    getMyTeams: () => api.get('/team'),
    getTeamMembers: (teamId) => api.get(`/team/${teamId}/members`),
    leaveTeam: (teamId) => api.delete(`/team/${teamId}/leave`),
    getLeaveRequests: (teamId) => api.get(`/team/${teamId}/leave-requests`),
    approveLeaveRequest: (requestId) => api.post(`/team/leave-requests/${requestId}/approve`),
    rejectLeaveRequest: (requestId) => api.post(`/team/leave-requests/${requestId}/reject`),
};
