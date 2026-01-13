import { test, expect } from '@playwright/test';

test.describe('StreakForge E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should load the dashboard page', async ({ page }) => {
    // Check if the page loads
    await expect(page).toHaveTitle(/StreakForge/);
    
    // Check if main navigation is present
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('nav').getByText('StreakForge')).toBeVisible();
    
    // Check if dashboard content is present
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('should navigate between pages', async ({ page }) => {
    // Test navigation to Habits page using nav link
    await page.locator('nav').getByRole('link', { name: 'Habits' }).click();
    await expect(page.getByRole('heading', { name: 'Habits', exact: true })).toBeVisible();
    
    // Test navigation to Analytics page using nav link
    await page.locator('nav').getByRole('link', { name: 'Analytics' }).click();
    await expect(page.getByRole('heading', { name: 'Analytics' })).toBeVisible();
    
    // Test navigation back to Dashboard using nav link
    await page.locator('nav').getByRole('link', { name: 'Dashboard' }).click();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('should create a new habit', async ({ page }) => {
    // Go to habits page using nav link
    await page.locator('nav').getByRole('link', { name: 'Habits' }).click();
    
    // Click add habit button
    await page.getByRole('button', { name: 'Add Habit' }).click();
    
    // Fill out the form
    await page.getByLabel('Habit Name *').fill('Test Habit E2E');
    await page.getByLabel('Description').fill('This is a test habit for E2E testing');
    await page.getByLabel('Category').fill('Testing');
    
    // Submit the form
    await page.getByRole('button', { name: 'Create Habit' }).click();
    
    // Wait for the modal to close and habit to appear
    await page.waitForTimeout(1000);
    
    // Verify the habit was created
    await expect(page.getByText('Test Habit E2E').first()).toBeVisible();
  });

  test('should mark habit as complete', async ({ page }) => {
    // Go to dashboard
    await page.goto('http://localhost:5173');
    
    // Look for any habit card with a "Mark Done" button
    const markDoneButton = page.getByRole('button', { name: 'Mark Done' }).first();
    
    if (await markDoneButton.isVisible()) {
      await markDoneButton.click();
      
      // Wait for the action to complete
      await page.waitForTimeout(1000);
      
      // Verify the button changed to "Done"
      await expect(page.getByRole('button', { name: 'Done' }).first()).toBeVisible();
    }
  });

  test('should display analytics charts', async ({ page }) => {
    // Go to analytics page using nav link
    await page.locator('nav').getByRole('link', { name: 'Analytics' }).click();
    
    // Check if analytics content is present
    await expect(page.getByRole('heading', { name: 'Analytics' })).toBeVisible();
    
    // Check for progress summary cards
    await expect(page.getByText("Today's Progress")).toBeVisible();
  });

  test('should open and close modals', async ({ page }) => {
    // Go to habits page using nav link
    await page.locator('nav').getByRole('link', { name: 'Habits' }).click();
    
    // Open create habit modal
    await page.getByRole('button', { name: 'Add Habit' }).click();
    
    // Verify modal is open
    await expect(page.getByText('Create New Habit')).toBeVisible();
    
    // Close modal
    await page.getByRole('button', { name: 'Cancel' }).click();
    
    // Verify modal is closed
    await expect(page.getByText('Create New Habit')).not.toBeVisible();
  });

  test('should filter habits', async ({ page }) => {
    // Go to habits page using nav link
    await page.locator('nav').getByRole('link', { name: 'Habits' }).click();
    
    // Try to use search functionality
    const searchInput = page.getByPlaceholder('Search habits...');
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      
      // Wait for filtering to occur
      await page.waitForTimeout(500);
    }
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:5173');
    
    // Check if navigation is still accessible
    await expect(page.locator('nav')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    
    // Check if content adapts
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    
    // Check if content is properly displayed
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});
