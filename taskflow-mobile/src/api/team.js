import { doFetch } from './client';

export const teamApi = {
    createTeam: (name) => doFetch('/team', { method: 'POST', body: JSON.stringify({ name }) }),
    joinTeam: (code) => doFetch('/team/join', { method: 'POST', body: JSON.stringify({ code }) }),
    getMyTeams: () => doFetch('/team'),
    getTeamMembers: (teamId) => doFetch(`/team/${teamId}/members`),
    leaveTeam: (teamId) => doFetch(`/team/${teamId}/leave`, { method: 'DELETE' }),
    removeMember: (teamId, memberId) => doFetch(`/team/${teamId}/members/${memberId}`, { method: 'DELETE' }),
    deleteTeam: (teamId) => doFetch(`/team/${teamId}`, { method: 'DELETE' }),
    getMembers: () => doFetch('/team/members'),
    getMemberActivity: (id) => doFetch(`/team/members/${id}/activity`),
};
