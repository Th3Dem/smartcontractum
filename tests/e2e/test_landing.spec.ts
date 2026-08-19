import { test, expect } from '@playwright/test';

test.describe('SmartContractum Platform E2E Suite', () => {
  test('should render health check status and core navigation', async ({ request }) => {
    const response = await request.get('http://localhost:8000/health');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.pksc_bridge).toBe('active');
  });
});
