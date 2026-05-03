import { api } from './client.js';

// Simple flat notes for the College Project basic submission
export const notesApi = {
    getFlatNotes: ()           => api.get('/notes'),
    createNote:   (data)       => api.post('/notes', data),
    getNote:      (id)         => api.get(`/notes/${id}`),
    updateNote:   (id, data)   => api.put(`/notes/${id}`, data),
    deleteNote:   (id)         => api.delete(`/notes/${id}`),
};
