---
description: "All code, comments, documentation, and user-facing text must be in English"
alwaysApply: true
---

# English Only Policy

## Critical Rule

**ALL code, comments, documentation, and user-facing text MUST be in English.**

This includes:
- ✅ Code comments
- ✅ Variable names (use English words)
- ✅ Function names
- ✅ Type definitions
- ✅ Documentation (README, inline docs)
- ✅ UI text and labels
- ✅ Error messages
- ✅ Console logs and warnings
- ✅ Git commit messages

## Exceptions

The following are allowed to contain non-English content:
- ❌ **NOT** regex patterns with language-specific characters (e.g., `[а-яё]` for Russian text processing)
- ❌ **NOT** stop-word lists for text analysis (e.g., Russian stop words in `text-analysis.ts`)
- ❌ **NOT** test data or sample content
- ❌ **NOT** user-generated content

## Examples

### ✅ Correct:
```typescript
// Get user settings
const getUserSettings = () => {
  // Load from storage
  return storage.get('settings');
};
```

### ❌ Incorrect:
```typescript
// Получить настройки пользователя
const получитьНастройки = () => {
  // Загрузить из хранилища
  return storage.get('settings');
};
```

## Enforcement

- All new code must be in English
- When refactoring, translate any non-English text
- Code reviews should check for English compliance
- Documentation must be in English

