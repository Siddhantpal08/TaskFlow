import { api } from './client.js';

export const teamApi = {
    getMyTeams:          ()         => api.get('/team'),
    createTeam:          (name)     => api.post('/team', { name }),
    joinTeam:            (code)     => api.post('/team/join', { code }),
    getTeamMembers:      (teamId)   => api.get(`/team/${teamId}/members`),
    leaveTeam:           (teamId)   => api.delete(`/team/${teamId}/leave`),
    getLeaveRequests:    (teamId)   => api.get(`/team/${teamId}/leave-requests`),
    approveLeaveRequest: (reqId)    => api.post(`/team/leave-requests/${reqId}/approve`),
    rejectLeaveRequest:  (reqId)    => api.post(`/team/leave-requests/${reqId}/reject`),
    getMemberActivity:   (memberId) => api.get(`/team/members/${memberId}/activity`),
    getMembers:          ()         => api.get('/team/members'),
};
