import { doFetch } from './client';

export const teamApi = {
    getMembers: () => doFetch('/team'),
    getMemberActivity: (id) => doFetch(`/team/${id}/activity`),
};
