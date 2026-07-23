# Testing Guide

This document describes the testing setup and available test commands for the portfolio project.

---

## Overview

The project uses **Vitest** as the test runner with **React Testing Library** for component testing. Tests verify both Motion animation integration and Sanity CMS connectivity.

---

## Test Commands

```bash
# Run all tests once
npm run test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with UI interface
npm run test:ui
```

---

## Test Suites

### 1. Motion Integration Tests (`src/test/motion.test.jsx`)

Verifies that the Motion animation library is properly configured and working.

**What it tests:**

- ✅ **MotionConfig & LazyMotion** — Verifies global Motion configuration with `reducedMotion="user"` and `LazyMotion` with `domMax` features
- ✅ **Basic animations** — Tests that `m` components render and animate without errors
- ✅ **Drag support** — Confirms `domMax` feature bundle includes drag gestures (required for case study swipe navigation)
- ✅ **Motion primitives** — Tests `FadeIn`, `Stagger`, `StaggerItem` components
- ✅ **usePresenceDirection hook** — Verifies direction state management for AnimatePresence transitions
- ✅ **Motion tokens** — Validates duration, easing, spring, and distance constants

**Run only Motion tests:**
```bash
npm run test -- motion.test
```

### 2. Sanity CMS Tests (`src/test/sanity.test.js`)

Verifies connectivity to the Sanity CMS backend and data structure integrity.

**What it tests:**

- ✅ **Client configuration** — Confirms Sanity client is configured with correct project ID, dataset, and API version
- ✅ **Connection** — Tests ability to connect to Sanity and fetch data (requires internet connection)
- ✅ **Case study queries** — Validates `getAllCaseStudies()` and `getCaseStudyBySlug()` functions
- ✅ **Data ordering** — Ensures case studies are returned in correct order
- ✅ **Block structure** — Verifies case study body blocks have required `_type` and `_key` fields
- ✅ **Image URL builder** — Tests `urlFor()` helper generates valid Sanity CDN URLs
- ✅ **Cache functions** — Tests `getCachedCaseStudy()`, `setCachedCaseStudy()`, and `prefetchCaseStudy()`

**Run only Sanity tests:**
```bash
npm run test -- sanity.test
```

---

## Test Configuration

**Location:** `vite.config.js`

```js
test: {
  globals: true,           // Provides global test functions (describe, test, expect)
  environment: 'jsdom',    // Simulates browser environment for React components
  setupFiles: './src/test/setup.js',  // Runs before tests
  css: true,               // Processes CSS imports
}
```

**Setup file:** `src/test/setup.js`
- Extends Vitest's `expect` with jest-dom matchers (e.g., `toBeInTheDocument()`)
- Cleans up after each test to prevent memory leaks

---

## What the Tests Verify

### Motion Health Check

The Motion tests ensure:
1. **Global configuration is active** — MotionConfig and LazyMotion wrap the app correctly
2. **Reduced motion support works** — `reducedMotion="user"` respects system preferences
3. **Drag gestures function** — `domMax` bundle includes drag support (not `domAnimation`)
4. **Primitives are usable** — FadeIn, Stagger components render without errors
5. **Tokens are accessible** — Duration, easing, spring, and distance constants are importable

**Why this matters:** If Motion is misconfigured, animations will break or perform poorly. These tests catch configuration errors before production.

### Sanity CMS Health Check

The Sanity tests ensure:
1. **Connection works** — Can reach Sanity API and authenticate
2. **Data structure is valid** — Case studies have expected fields (`_id`, `title`, `slug`, `body`)
3. **Queries return data** — getAllCaseStudies and getCaseStudyBySlug work correctly
4. **Images are accessible** — urlFor generates valid CDN URLs
5. **Cache prevents redundant fetches** — Prefetch system works as expected

**Why this matters:** If Sanity connectivity breaks, the entire portfolio shows no content. These tests catch CMS issues immediately.

---

## Interpreting Test Results

### All Tests Pass ✅

```
Test Files  2 passed (2)
     Tests  24 passed (24)
```

**Meaning:** Both Motion and Sanity are connected and working correctly.

### Motion Tests Fail ❌

**Common causes:**
- `MotionConfig` or `LazyMotion` not configured in `main.jsx`
- Wrong import (`motion` vs `m`)
- Missing `domMax` feature bundle
- Token file missing or malformed

**Fix:** Check `main.jsx` and `src/motion/` directory match `MOTION.md` spec.

### Sanity Tests Fail ❌

**Common causes:**
- No internet connection (tests require network access)
- Sanity credentials changed (check `src/lib/sanity.js`)
- Sanity project ID or dataset incorrect
- CMS content missing or schema changed

**Fix:**
1. Check internet connection
2. Verify `projectId` and `dataset` in `src/lib/sanity.js`
3. Confirm Sanity CMS has published content

---

## Test Coverage

### What is Tested

- ✅ Motion configuration (MotionConfig, LazyMotion)
- ✅ Motion primitives (FadeIn, Stagger, usePresenceDirection)
- ✅ Motion tokens (durations, easings, springs, distances)
- ✅ Sanity client configuration
- ✅ Sanity connection and data fetching
- ✅ Image URL generation
- ✅ Case study cache functions

### What is NOT Tested

- ❌ **Visual regression** — Tests don't check if animations look correct, only that they run
- ❌ **E2E user flows** — No browser automation testing (Playwright/Cypress)
- ❌ **Individual block components** — `src/components/blocks/*` are not unit tested
- ❌ **Routing** — React Router navigation is not tested
- ❌ **Accessibility** — ARIA attributes and keyboard navigation not tested

**Why:** This is a **smoke test suite** to verify critical integrations work. Full coverage would require additional tooling (Playwright, Axe, Chromatic).

---

## Adding New Tests

### Testing a New Motion Primitive

```jsx
// src/test/motion.test.jsx
test('MyNewPrimitive renders correctly', () => {
  render(
    <TestWrapper>
      <MyNewPrimitive data-testid="new-primitive">
        Content
      </MyNewPrimitive>
    </TestWrapper>
  )

  expect(screen.getByTestId('new-primitive')).toBeInTheDocument()
  expect(screen.getByText('Content')).toBeVisible()
})
```

### Testing a New Sanity Query

```js
// src/test/sanity.test.js
test('getNewData fetches correctly', async () => {
  const result = await getNewData()

  expect(result).toBeDefined()
  expect(Array.isArray(result)).toBe(true)
}, 10000) // 10s timeout for network request
```

**Note:** Sanity tests that make API calls need a `10000ms` timeout (default is 5000ms).

---

## Troubleshooting

### Tests hang or timeout

**Cause:** Sanity API request taking too long or network issue.

**Fix:**
```bash
# Check if Sanity is reachable
curl https://6vslo6fw.api.sanity.io/v2024-01-01/data/query/production?query=*[_type=="caseStudy"][0]

# If timeout persists, skip Sanity tests
npm run test -- motion.test
```

### "Module not found" errors

**Cause:** Dependencies not installed.

**Fix:**
```bash
npm install
```

### "Cannot find module '@testing-library/jest-dom/matchers'"

**Cause:** Outdated `@testing-library/jest-dom` version.

**Fix:**
```bash
npm install -D @testing-library/jest-dom@latest
```

---

## CI/CD Integration

To run tests in CI/CD pipelines:

```yaml
# Example: GitHub Actions
- name: Run tests
  run: npm run test
```

**Note:** Sanity tests require internet access. Ensure CI environment allows outbound HTTPS to `*.sanity.io`.

---

## Summary

- **Motion tests** verify the animation layer is configured correctly
- **Sanity tests** verify CMS connectivity and data structure
- Run `npm run test` before committing to catch integration issues early
- Tests are **smoke tests**, not full coverage — they verify critical connections work

For questions about specific test failures, consult `MOTION.md` (for Motion issues) or `src/lib/sanity.js` (for Sanity issues).
