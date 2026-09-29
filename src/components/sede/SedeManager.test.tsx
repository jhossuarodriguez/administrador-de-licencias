import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SedeManager } from './SedeManager';
import type { Sede } from '@/types/sede';

const mocks = vi.hoisted(() => ({
    createSede: vi.fn(),
    updateSede: vi.fn(),
    deleteSede: vi.fn(),
}));

vi.mock('@/hooks/useSedes', () => ({
    useSedes: () => ({
        sedes: [mockSede],
        isLoading: false,
        isError: null,
        createSede: mocks.createSede,
        updateSede: mocks.updateSede,
        deleteSede: mocks.deleteSede,
    }),
}));

vi.mock('sonner', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

const mockSede: Sede = {
    id: 1,
    name: 'Sede Central',
    description: 'Oficina principal',
    active: true,
    createdAt: '2026-07-16T00:00:00.000Z',
    updatedAt: '2026-07-16T00:00:00.000Z',
    _count: { licenses: 2 },
};

describe('SedeManager', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.createSede.mockResolvedValue({ ok: true, data: mockSede });
        mocks.updateSede.mockResolvedValue({ ok: true, data: mockSede });
    });

    it('agrega una sede con el nombre y la descripcion ingresados', async () => {
        const user = userEvent.setup();
        render(<SedeManager initialData={[mockSede]} isAdmin />);

        await user.click(screen.getByRole('button', { name: /agregar sede/i }));
        await user.type(screen.getByLabelText(/nombre/i), 'Sede Norte');
        await user.type(screen.getByLabelText(/descripción/i), 'Sede regional');
        await user.click(screen.getByRole('button', { name: /guardar sede/i }));

        await waitFor(() => {
            expect(mocks.createSede).toHaveBeenCalledWith({
                name: 'Sede Norte',
                description: 'Sede regional',
            });
        });
    });

    it('precarga y actualiza la sede seleccionada', async () => {
        const user = userEvent.setup();
        render(<SedeManager initialData={[mockSede]} isAdmin />);

        await user.click(screen.getByRole('button', { name: /editar/i }));
        const nameInput = screen.getByLabelText(/nombre/i);
        expect(nameInput).toHaveValue('Sede Central');

        await user.clear(nameInput);
        await user.type(nameInput, 'Sede Principal');
        await user.click(screen.getByRole('button', { name: /guardar sede/i }));

        await waitFor(() => {
            expect(mocks.updateSede).toHaveBeenCalledWith(1, {
                name: 'Sede Principal',
                description: 'Oficina principal',
            });
        });
    });
});
