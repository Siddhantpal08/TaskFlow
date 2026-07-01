import { api } from './client.js';

// ─── Rich Notes API (pages + blocks + sharing) ────────────────────────────────
// All routes under /api/college/v1/notes (or /api/v1/notes for full product)

export const notesApi = {
    // ── Pages ─────────────────────────────────────────────────────────────────
    /** GET /notes/pages — returns nested tree */
    getPages: ()                       => api.get('/notes/pages'),

    /** POST /notes/pages */
    createPage: (data)                 => api.post('/notes/pages', data),

    /** GET /notes/pages/:id — includes blocks array */
    getPage: (id)                      => api.get(`/notes/pages/${id}`),

    /** PUT /notes/pages/:id — update title / emoji */
    updatePage: (id, data)             => api.put(`/notes/pages/${id}`, data),

    /** DELETE /notes/pages/:id */
    deletePage: (id)                   => api.delete(`/notes/pages/${id}`),

    /** POST /notes/pages/:id/duplicate */
    duplicatePage: (id)                => api.post(`/notes/pages/${id}/duplicate`),

    /** PATCH /notes/pages/:id/reorder — { orderedIds: string[] } */
    reorderPages: (parentId, orderedIds) => api.patch(`/notes/pages/${parentId}/reorder`, { orderedIds }),

    /** PATCH /notes/pages/:id/mode — { mode: 'script'|'lyrics'|null } */
    setWritingMode: (id, mode)         => api.patch(`/notes/pages/${id}/mode`, { mode }),

    /** POST /notes/pages/:id/share — generate a shareable link */
    shareNote: (id)                    => api.post(`/notes/pages/${id}/share`),

    /** POST /notes/accept-share/:token — copy or collab shared note */
    acceptShare: (token, mode)         => api.post(`/notes/accept-share/${token}`, { mode }),

    // ── Blocks ────────────────────────────────────────────────────────────────
    /** POST /notes/pages/:pageId/blocks */
    createBlock: (pageId, data)        => api.post(`/notes/pages/${pageId}/blocks`, data),

    /** PUT /notes/blocks/:blockId */
    updateBlock: (blockId, data)       => api.put(`/notes/blocks/${blockId}`, data),

    /** DELETE /notes/blocks/:blockId */
    deleteBlock: (blockId)             => api.delete(`/notes/blocks/${blockId}`),
};
