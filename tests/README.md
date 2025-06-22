# DevLogr Tests

Tests are organized by feature area for better maintainability.

## Test Structure

- **`core/`** - Basic logger functionality and environment handling
- **`format/`** - Message formatting and timestamps
- **`spinner/`** - Spinner functionality and task management
- **`utils/`** - Utility functions and string handling
- **`config/`** - Configuration and themes

## Running Tests

```bash
# All tests
npm test

# Specific area
npm test tests/core/
npm test tests/spinner/

# Individual file
npm test tests/spinner/spinner.test.ts

# With coverage
npm run test:coverage
```

## What We Test

- All logging methods work correctly
- Spinners start, update, and complete properly
- Environment variables control behavior
- Output formatting is consistent
- JSON mode works as expected
- Error handling doesn't crash
- Memory cleanup happens correctly

## Adding Tests

When adding new tests:

1. Put them in the right folder based on feature
2. Use clear test descriptions
3. Test both success and error cases
4. Clean up resources after tests
5. Follow existing patterns
