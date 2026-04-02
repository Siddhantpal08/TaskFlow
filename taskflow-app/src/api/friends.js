import { api } from './client.js';

export const friendsApi = {
    getFriends: () => api.get('/friends'),
    sendRequest: (email) => api.post('/friends/request', { email }),
    acceptRequest: (requestId) => api.post('/friends/accept', { requestId }),
    removeFriend: (friendshipId) => api.delete(`/friends/${friendshipId}`)
};
