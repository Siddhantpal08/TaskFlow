import { api } from './client.js';

// Friends are College-Project exclusive — uses /api/college/v1/ prefix
export const friendsApi = {
    getFriends:    ()             => api.get('/college/v1/friends'),
    sendRequest:   (email)        => api.post('/college/v1/friends/request', { email }),
    acceptRequest: (requestId)    => api.post('/college/v1/friends/accept', { requestId }),
    removeFriend:  (friendshipId) => api.delete(`/college/v1/friends/${friendshipId}`),
};
