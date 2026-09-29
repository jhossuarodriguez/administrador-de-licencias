import { test, expect } from '@playwright/test'

const ADMIN_USERNAME = process.env.E2E_USERNAME ?? 'admin'
const ADMIN_PASSWORD = process.env.E2E_PASSWORD ?? 'Admin2024!'

test.describe('Auth + CRUD E2E', () => {
    test('login falla con credenciales inválidas', async ({ page }) => {
        await page.goto('/')

        await page.getByPlaceholder('Usuario o Email').fill('usuario_inexistente')
        await page.getByPlaceholder('Contraseña').fill('password_incorrecto')
        await page.getByRole('button', { name: 'Iniciar Sesión' }).click()

        await expect(page.getByText(/credenciales inválidas/i)).toBeVisible({ timeout: 10_000 })
        await expect(page).toHaveURL('/')
    })

    test('login exitoso → crear licencia → verla → editarla → borrarla', async ({ page }) => {
        const suffix = Date.now().toString()
        const providerName = `E2E-Provider-${suffix}`
        const editedProvider = `E2E-Edited-${suffix}`

        await test.step('login', async () => {
            await page.goto('/')

            await page.getByPlaceholder('Usuario o Email').fill(ADMIN_USERNAME)
            await page.getByPlaceholder('Contraseña').fill(ADMIN_PASSWORD)
            await page.getByRole('button', { name: 'Iniciar Sesión' }).click()

            await page.waitForURL('**/dashboard', { timeout: 15_000 })
            const cookies = page.context().cookies()
            expect((await cookies).some(c => c.name.endsWith('better-auth.session_token'))).toBeTruthy()
        })

        await test.step('navegar a licencias', async () => {
            await page.goto('/dashboard/licenses')
            await expect(page.getByText('Total de Licencias', { exact: true })).toBeVisible({ timeout: 15_000 })
        })

        await test.step('crear licencia', async () => {
            await page.getByRole('button', { name: 'Agregar licencia' }).click()

            await page.locator('#provider').fill(providerName)
            await page.locator('#startDate').fill('2026-01-01')
            await page.locator('#expiration').fill('2026-12-31')
            await page.locator('#model').fill('E2E-Model')
            await page.locator('#plan').fill('E2E-Plan')
            await page.locator('#unitCost').fill('100')
            await page.locator('#installmentCost').fill('50')
            await page.locator('#totalLicense').fill('10')
            await page.locator('#billingCycle').selectOption('MONTHLY')

            await page.getByRole('button', { name: 'Agregar', exact: true }).click()

            await expect(page.getByText(providerName).first()).toBeVisible({ timeout: 10_000 })
        })

        await test.step('editar licencia', async () => {
            const dialog = page.getByRole('dialog')
            
            const row = page.getByRole('row').filter({ hasText: providerName })
            await row.getByRole('button', { name: 'Editar' }).click()

            await expect(dialog.getByRole('heading', {name: 'Editar Licencia'})).toBeVisible({ timeout: 10_000 })

            const providerInput = page.locator('#editProvider')
            await providerInput.clear()
            await providerInput.fill(editedProvider)

            await page.getByRole('button', { name: 'Guardar Cambios' }).click()

            await expect(page.getByText(editedProvider).first()).toBeVisible({ timeout: 10_000 })
        })

        await test.step('borrar licencia', async () => {
            const row = page.getByRole('row').filter({ hasText: editedProvider })
            await row.getByRole('button', { name: 'Eliminar' }).click()

            await expect(page.getByText('Eliminar licencia')).toBeVisible({ timeout: 5_000 })

            await page.getByRole('button', { name: 'Eliminar', exact: true }).click()

            await expect(page.getByText(editedProvider)).toHaveCount(0, { timeout: 10_000 })
        })
    })
})
