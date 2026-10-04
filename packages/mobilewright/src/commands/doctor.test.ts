import { test, expect } from '@playwright/test';
import { isSupportedNodeVersion, formatDeviceLine } from './doctor.js';

test('accepts node 22.12 and newer', () => {
  expect(isSupportedNodeVersion('v22.12.0')).toBe(true);
  expect(isSupportedNodeVersion('v22.23.2')).toBe(true);
  expect(isSupportedNodeVersion('v24.21.0')).toBe(true);
});

test('rejects node older than 22.12', () => {
  expect(isSupportedNodeVersion('v22.11.0')).toBe(false);
  expect(isSupportedNodeVersion('v20.19.0')).toBe(false);
  expect(isSupportedNodeVersion('')).toBe(false);
});

// Android devices do not use an agent (`mobilecli agent status` answers "no
// agent needed for android devices"), so the per-device line must not show
// "agent: not installed" for them — and must not even ask mobilecli.
test.describe('device lines in the mobilecli devices check', () => {
  const lookupThatMustNotBeCalled = (id: string): string => { throw new Error(`agent status looked up for ${id}`); };

  test('an Android device says the agent is not needed', () => {
    const line = formatDeviceLine({ id: 'emulator-5554', name: 'Pixel 9 Pro', platform: 'android' }, lookupThatMustNotBeCalled);
    expect(line).toBe('Pixel 9 Pro (emulator-5554) — agent: not needed on Android');
  });

  test('an iOS device shows the looked-up agent status', () => {
    const line = formatDeviceLine({ id: 'UDID-1', name: 'iPhone 17 Pro', platform: 'ios' }, () => 'agent: com.example.runner v0.0.33');
    expect(line).toBe('iPhone 17 Pro (UDID-1) — agent: com.example.runner v0.0.33');
  });
});
