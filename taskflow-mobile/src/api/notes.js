import { doFetch } from './client';

export const notesApi = {
    listPages: () => doFetch('/notes'),
    getPage: (id) => doFetch(`/notes/${id}`),
    createPage: (data) => doFetch('/notes', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updatePage: (id, data) => doFetch(`/notes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    deletePage: (id) => doFetch(`/notes/${id}`, { method: 'DELETE' }),
};
