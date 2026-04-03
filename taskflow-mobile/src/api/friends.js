import { doFetch } from './client';

export const friendsApi = {
    list: () => doFetch('/friends'),
    sendRequest: (email) => doFetch('/friends/request', {
        method: 'POST',
        body: JSON.stringify({ email }),
    }),
    acceptRequest: (requestId) => doFetch('/friends/accept', {
        method: 'POST',
        body: JSON.stringify({ requestId }),
    }),
    remove: (friendshipId) => doFetch(`/friends/${friendshipId}`, {
        method: 'DELETE',
    }),
};
