import { api } from './client.js';

// Rich notes are College-Project exclusive — uses /api/college/v1/ prefix
export const notesApi = {
    // Pages
    getPages:      ()              => api.get('/college/v1/notes/pages'),
    createPage:    (data)          => api.post('/college/v1/notes/pages', data),
    getPage:       (id)            => api.get(`/college/v1/notes/pages/${id}`),
    updatePage:    (id, data)      => api.put(`/college/v1/notes/pages/${id}`, data),
    deletePage:    (id)            => api.delete(`/college/v1/notes/pages/${id}`),
    duplicatePage: (id)            => api.post(`/college/v1/notes/pages/${id}/duplicate`, {}),
    reorderPages:  (id, orderedIds)=> api.patch(`/college/v1/notes/pages/${id}/reorder`, { orderedIds }),
    setWritingMode:(pageId, mode)  => api.patch(`/college/v1/notes/pages/${pageId}/mode`, { mode }),
    shareNote:     (pageId)        => api.post(`/college/v1/notes/pages/${pageId}/share`),
    acceptShare:   (token)         => api.post(`/college/v1/notes/accept-share/${token}`),
    // Blocks
    createBlock:   (pageId, data)  => api.post(`/college/v1/notes/pages/${pageId}/blocks`, data),
    updateBlock:   (blockId, data) => api.put(`/college/v1/notes/blocks/${blockId}`, data),
    deleteBlock:   (blockId)       => api.delete(`/college/v1/notes/blocks/${blockId}`),
};
