import { describe, expect, it } from 'vitest';
import { getAuthErrorMessage, getOAuthErrorMessage } from './authErrors';

describe('getAuthErrorMessage', () => {
    it('traduce los códigos de Better Auth', () => {
        expect(getAuthErrorMessage({ code: 'INVALID_USERNAME_OR_PASSWORD', status: 401 })).toBe('Credenciales inválidas');
        expect(getAuthErrorMessage({ code: 'USERNAME_IS_ALREADY_TAKEN', status: 400 })).toBe('El nombre de usuario ya está en uso');
    });

    it('avisa del límite de intentos antes que cualquier otro error', () => {
        expect(getAuthErrorMessage({ code: 'INVALID_EMAIL_OR_PASSWORD', status: 429 })).toBe('Demasiados intentos. Intenta más tarde.');
    });

    it('usa el mensaje del servidor cuando el código no está traducido', () => {
        expect(getAuthErrorMessage({ code: 'LA_CONTRASEA_DEBE', message: 'La contraseña debe contener al menos un número', status: 400 }))
            .toBe('La contraseña debe contener al menos un número');
    });
});

describe('getOAuthErrorMessage', () => {
    it('explica los errores conocidos y usa un mensaje genérico para el resto', () => {
        expect(getOAuthErrorMessage('access_denied')).toBe('Cancelaste el inicio de sesión con el proveedor.');
        expect(getOAuthErrorMessage('state_mismatch')).toBe('No se pudo iniciar sesión con el proveedor. Intenta de nuevo.');
    });
});
