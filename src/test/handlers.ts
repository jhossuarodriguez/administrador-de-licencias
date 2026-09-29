import { http, HttpResponse } from 'msw'

export const handlers = [
    http.get('/api/departments', () => {
        return HttpResponse.json([
            { id: 1, name: 'TI', description: 'Tecnología', active: true },
            { id: 2, name: 'Admin', description: 'Administración', active: true },
            { id: 3, name: 'Finanzas', description: 'Finanzas', active: true },
        ])
    }),

    http.get('/api/licenses', () => {
        return HttpResponse.json([])
    }),
]
