# Playwright Testing Guide

This directory contains end-to-end tests for YideShare using Playwright.

## Setup

### Prerequisites

Make sure you have Node.js installed, have run `npm install` from the project root and have installed playwright locally.

## Running Tests

_Make sure you are running server from parent dir before running tests._

Ex:

```bash
npm run dev
```

Then navigate to playwright-tests directory.

```bash
cd playwright-tests
```

### Basic Commands

Run all tests:

```bash
npx playwright test
```

Run tests in UI mode (recommended for development):

```bash
npx playwright test --ui
```

Run tests in a specific browser:

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

Run a specific test file:

```bash
npx playwright test tests/bookmark.spec.ts
```

Run tests with specific number of workers (recommended not to due to db conflicts):

```bash
npx playwright test --workers=2
```

### Writing Tests

```bash
npx playwright codegen
```

To bypass CAS (for non Production env only), use path:
http://localhost:3000/api/auth/test-login

### Debugging

Run tests in headed mode (see browser):

```bash
npx playwright test --headed
```

Debug a specific test:

```bash
npx playwright test --debug tests/bookmark.spec.ts
```

Mainly for Lena, but if Playwright can't find any tests, try deleting the test-results folder.

### Reports

View the last test report:

```bash
npx playwright show-report
```

## Test Structure

- `tests/` - Test files (\*.spec.ts)
- `helpers/` - Utility functions and page objects
  See `.github/workflows/playwright.yml` for the complete configuration.
