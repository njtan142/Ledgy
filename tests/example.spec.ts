import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  // We assume the vite dev server runs on port 1420
  await page.goto('http://localhost:1420/');

  // Expect a title to be present in our app
  await expect(page).toHaveTitle(/Tauri \+ React \+ Typescript/);
});

test('can interact with tauri greet form', async ({ page }) => {
  await page.goto('http://localhost:1420/');

  // Verify the h1 exists
  await expect(page.getByRole('heading', { name: /Welcome to Tauri \+ React/i })).toBeVisible();

  // Test the input
  const input = page.locator('input#greet-input');
  await input.fill('Ledgy Tester');

  // Note: we can't fully end-to-end test the Tauri invoke natively inside playwright 
  // without a mocked backend or a Tauri driver, but we verify the form exists and functions
  const submitButton = page.getByRole('button', { name: 'Greet' });
  await expect(submitButton).toBeVisible();
});
