import { api } from './client.js';

export const notesApi = {
    getPages: () => api.get('/notes/pages'),
    createPage: (data) => api.post('/notes/pages', data),
    getPage: (id) => api.get(`/notes/pages/${id}`),
    updatePage: (id, data) => api.put(`/notes/pages/${id}`, data),
    deletePage: (id) => api.delete(`/notes/pages/${id}`),
    duplicatePage: (id) => api.post(`/notes/pages/${id}/duplicate`, {}),
    reorderPages: (id, orderedIds) => api.patch(`/notes/pages/${id}/reorder`, { orderedIds }),
    createBlock: (pageId, data) => api.post(`/notes/pages/${pageId}/blocks`, data),
    updateBlock: (blockId, data) => api.put(`/notes/blocks/${blockId}`, data),
    deleteBlock: (blockId) => api.delete(`/notes/blocks/${blockId}`),
};
