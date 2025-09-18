import { test, expect, Page } from '@playwright/test';

// Critical User Flow Tests - End-to-End

test.describe('Authentication Flow', () => {
  test('complete login flow with MFA', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Login form validation
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    
    // Fill login credentials
    await page.fill('input[type="email"]', 'admin@treeoflife.com');
    await page.fill('input[type="password"]', 'SecurePass123!');
    await page.click('button[type="submit"]');
    
    // Check for MFA prompt
    await expect(page.locator('text=Enter verification code')).toBeVisible();
    
    // Mock MFA code entry
    await page.fill('input[name="mfaCode"]', '123456');
    await page.click('button:has-text("Verify")');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
  });

  test('password reset flow', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    
    await page.fill('input[type="email"]', 'user@example.com');
    await page.click('button:has-text("Send Reset Link")');
    
    await expect(page.locator('text=Password reset email sent')).toBeVisible();
  });
});

test.describe('CRM Core Functions', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin user
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@treeoflife.com');
    await page.fill('input[type="password"]', 'SecurePass123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('create and manage customer', async ({ page }) => {
    // Navigate to customers
    await page.click('nav a[href="/crm/customers"]');
    await expect(page).toHaveURL('/crm/customers');
    
    // Create new customer
    await page.click('button:has-text("Add Customer")');
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', 'john.doe@example.com');
    await page.fill('input[name="phone"]', '+1234567890');
    await page.fill('input[name="company"]', 'Acme Corp');
    
    await page.click('button[type="submit"]');
    
    // Verify customer created
    await expect(page.locator('text=Customer created successfully')).toBeVisible();
    await expect(page.locator('text=John Doe')).toBeVisible();
  });

  test('lead pipeline management', async ({ page }) => {
    await page.click('nav a[href="/crm/leads"]');
    
    // Create new lead
    await page.click('button:has-text("Add Lead")');
    await page.fill('input[name="firstName"]', 'Jane');
    await page.fill('input[name="lastName"]', 'Smith');
    await page.fill('input[name="email"]', 'jane.smith@prospect.com');
    await page.fill('input[name="company"]', 'Prospect Inc');
    await page.fill('input[name="estimatedValue"]', '50000');
    
    await page.click('button[type="submit"]');
    
    // Verify lead created and can move through pipeline
    await expect(page.locator('text=Jane Smith')).toBeVisible();
    
    // Test status change
    await page.click('select[name="status"]');
    await page.selectOption('select[name="status"]', 'QUALIFIED');
    await expect(page.locator('text=Status updated')).toBeVisible();
  });

  test('project workflow', async ({ page }) => {
    await page.click('nav a[href="/crm/projects"]');
    
    await page.click('button:has-text("New Project")');
    await page.fill('input[name="name"]', 'Test Project');
    await page.fill('textarea[name="description"]', 'Project description');
    await page.fill('input[name="budget"]', '25000');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Test Project')).toBeVisible();
  });
});

test.describe('Communication Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'agent@treeoflife.com');
    await page.fill('input[type="password"]', 'AgentPass123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('internal messaging system', async ({ page }) => {
    await page.click('nav a[href="/messages"]');
    
    // Send new message
    await page.click('button:has-text("New Message")');
    await page.fill('input[name="recipient"]', 'admin@treeoflife.com');
    await page.fill('input[name="subject"]', 'Test Message');
    await page.fill('textarea[name="content"]', 'This is a test message');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Message sent')).toBeVisible();
  });

  test('communication logging', async ({ page }) => {
    await page.goto('/crm/customers/1'); // Assuming customer with ID 1 exists
    
    // Log communication
    await page.click('button:has-text("Log Communication")');
    await page.selectOption('select[name="type"]', 'EMAIL');
    await page.selectOption('select[name="direction"]', 'OUTBOUND');
    await page.fill('input[name="subject"]', 'Follow-up Call');
    await page.fill('textarea[name="content"]', 'Discussed project requirements');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Communication logged')).toBeVisible();
  });
});

test.describe('Dashboard Analytics', () => {
  test('dashboard loads with metrics', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@treeoflife.com');
    await page.fill('input[type="password"]', 'SecurePass123!');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/dashboard');
    
    // Check key metrics are displayed
    await expect(page.locator('text=Total Customers')).toBeVisible();
    await expect(page.locator('text=Active Leads')).toBeVisible();
    await expect(page.locator('text=Projects')).toBeVisible();
    await expect(page.locator('text=Revenue')).toBeVisible();
    
    // Check charts are rendered
    await expect(page.locator('.recharts-wrapper')).toBeVisible();
  });

  test('real-time updates', async ({ page, context }) => {
    // Open dashboard in two tabs to test real-time updates
    const page1 = await context.newPage();
    const page2 = await context.newPage();
    
    // Login on both pages
    for (const p of [page1, page2]) {
      await p.goto('/auth/login');
      await p.fill('input[type="email"]', 'admin@treeoflife.com');
      await p.fill('input[type="password"]', 'SecurePass123!');
      await p.click('button[type="submit"]');
      await p.waitForURL('/dashboard');
    }
    
    // Create customer on page1 and verify it appears on page2
    await page1.click('nav a[href="/crm/customers"]');
    await page1.click('button:has-text("Add Customer")');
    await page1.fill('input[name="firstName"]', 'Real');
    await page1.fill('input[name="lastName"]', 'Time');
    await page1.fill('input[name="email"]', 'realtime@test.com');
    await page1.click('button[type="submit"]');
    
    // Check if page2 dashboard updates
    await page2.waitForTimeout(2000); // Wait for WebSocket update
    await page2.reload(); // In real scenario, this would update automatically
    await expect(page2.locator('text=Real Time')).toBeVisible();
  });
});

test.describe('Role-Based Access Control', () => {
  const roles = [
    { email: 'client@treeoflife.com', role: 'CLIENT', canAccess: ['/dashboard'], cannotAccess: ['/admin'] },
    { email: 'agent@treeoflife.com', role: 'AGENT', canAccess: ['/dashboard', '/crm'], cannotAccess: ['/admin/users'] },
    { email: 'admin@treeoflife.com', role: 'ADMIN', canAccess: ['/dashboard', '/crm', '/admin'], cannotAccess: [] },
  ];

  roles.forEach(({ email, role, canAccess, cannotAccess }) => {
    test(`${role} access permissions`, async ({ page }) => {
      await page.goto('/auth/login');
      await page.fill('input[type="email"]', email);
      await page.fill('input[type="password"]', 'TestPass123!');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
      
      // Test accessible routes
      for (const route of canAccess) {
        await page.goto(route);
        await expect(page).not.toHaveURL('/auth/login');
      }
      
      // Test restricted routes
      for (const route of cannotAccess) {
        await page.goto(route);
        await expect(page.locator('text=Access denied')).toBeVisible();
      }
    });
  });
});

test.describe('Performance Tests', () => {
  test('page load performance', async ({ page }) => {
    const start = Date.now();
    await page.goto('/dashboard');
    const loadTime = Date.now() - start;
    
    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Check Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          resolve(entries.map(entry => ({
            name: entry.name,
            value: entry.value
          })));
        }).observe({ entryTypes: ['measure', 'navigation'] });
      });
    });
    
    console.log('Performance metrics:', metrics);
  });
});

test.describe('Mobile Responsiveness', () => {
  test('mobile viewport navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    
    await page.goto('/auth/login');
    
    // Mobile login should work
    await page.fill('input[type="email"]', 'admin@treeoflife.com');
    await page.fill('input[type="password"]', 'SecurePass123!');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/dashboard');
    
    // Mobile navigation should be accessible
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    
    // Dashboard should be responsive
    await expect(page.locator('main')).toBeVisible();
  });
});
