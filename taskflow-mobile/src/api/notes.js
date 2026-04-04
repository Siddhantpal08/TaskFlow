import { doFetch } from './client';

export const notesApi = {
    listPages: () => doFetch('/notes/pages'),
    getPage: (id) => doFetch(`/notes/pages/${id}`),
    createPage: (data) => doFetch('/notes/pages', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updatePage: (id, data) => doFetch(`/notes/pages/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    deletePage: (id) => doFetch(`/notes/pages/${id}`, { method: 'DELETE' }),

    // Block operations
    createBlock: (pageId, data) => doFetch(`/notes/pages/${pageId}/blocks`, {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateBlock: (blockId, data) => doFetch(`/notes/blocks/${blockId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    deleteBlock: (blockId) => doFetch(`/notes/blocks/${blockId}`, { method: 'DELETE' }),
};
