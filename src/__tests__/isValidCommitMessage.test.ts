import isValidCommitMessage from "../isValidCommitMesage";

describe("isValidCommitMessage", () => {
  const types = ["feat", "fix", "chore", "docs", "style", "refactor", "test", "build"];
  // Default options for most tests
  const defaultOptions = {
    allowMergeCommits: false,
    allowRevertCommits: false,
    allowReapplyCommits: false,
  };

  describe("basic format validation", () => {
    test("should validate basic commit messages", () => {
      expect(isValidCommitMessage("feat: add new feature", types, false, false, false)).toBe(true);
      expect(isValidCommitMessage("fix: resolve bug", types, false, false, false)).toBe(true);
      expect(isValidCommitMessage("invalid: wrong type", types, false, false, false)).toBe(false);
    });

    test("should reject messages without type", () => {
      expect(isValidCommitMessage(": missing type", types, false, false, false)).toBe(false);
      expect(isValidCommitMessage("just some text", types, false, false, false)).toBe(false);
    });

    test("should reject messages without description", () => {
      expect(isValidCommitMessage("feat:", types, false, false, false)).toBe(false);
      expect(isValidCommitMessage("fix: ", types, false, false, false)).toBe(false);
    });
  });

  describe("scope handling", () => {
    test("should validate messages with scope", () => {
      expect(isValidCommitMessage("feat(ui): add button", types, false, false, false)).toBe(true);
      expect(isValidCommitMessage("fix(api): fix endpoint", types, false, false, false)).toBe(true);
      expect(
        isValidCommitMessage("chore(deps): update dependencies", types, false, false, false)
      ).toBe(true);
    });

    test("should validate scopes with numbers and hyphens", () => {
      expect(isValidCommitMessage("feat(ui-123): new feature", types, false, false, false)).toBe(
        true
      );
      expect(isValidCommitMessage("fix(api-v2): fix endpoint", types, false, false, false)).toBe(
        true
      );
    });

    test("should reject invalid scope formats", () => {
      expect(isValidCommitMessage("feat(UI): invalid caps", types, false, false, false)).toBe(
        false
      );
      expect(
        isValidCommitMessage("fix(api_test): invalid underscore", types, false, false, false)
      ).toBe(false);
      expect(
        isValidCommitMessage("feat((double)): double parentheses", types, false, false, false)
      ).toBe(false);
    });
  });

  describe("breaking changes", () => {
    test("should validate breaking change indicator", () => {
      expect(isValidCommitMessage("feat!: breaking change", types, false, false, false)).toBe(true);
      expect(isValidCommitMessage("fix(api)!: breaking fix", types, false, false, false)).toBe(
        true
      );
    });

    test("should validate breaking change with body", () => {
      expect(
        isValidCommitMessage(
          "feat!: breaking change\n\nBREAKING CHANGE: This will break things",
          types,
          false,
          false,
          false
        )
      ).toBe(true);
    });
  });

  describe("body and footer", () => {
    test("should validate messages with body", () => {
      expect(
        isValidCommitMessage(
          "feat: new feature\n\nThis is a detailed description of the feature.",
          types,
          false,
          false,
          false
        )
      ).toBe(true);
    });

    test("should validate messages with body and footer", () => {
      expect(
        isValidCommitMessage(
          "fix: bug fix\n\nFixes the issue with login.\n\nCloses #123",
          types,
          false,
          false,
          false
        )
      ).toBe(true);
    });
  });

  describe("edge cases", () => {
    test("should handle empty input", () => {
      expect(isValidCommitMessage("", types, false, false, false)).toBe(false);
    });

    test("should handle messages with no allowed types", () => {
      expect(isValidCommitMessage("feat: something", [], false, false, false)).toBe(false);
    });

    test("should reject messages with emojis", () => {
      expect(isValidCommitMessage("✨ feat: sparkles", types, false, false, false)).toBe(false);
      expect(isValidCommitMessage("feat: add sparkles ✨", types, false, false, false)).toBe(true);
    });

    test("should reject malformed type-scope combinations", () => {
      expect(isValidCommitMessage("feat(: invalid scope", types, false, false, false)).toBe(false);
      expect(isValidCommitMessage("feat): invalid scope", types, false, false, false)).toBe(false);
      expect(
        isValidCommitMessage("feat(scope: missing parenthesis", types, false, false, false)
      ).toBe(false);
    });
  });

  // Add new test suite for exception commits
  describe("exception commits", () => {
    test("should handle merge commits", () => {
      expect(isValidCommitMessage("Merge pull request #123", types, true, false, false)).toBe(true);
      expect(isValidCommitMessage("Merge pull request #123", types, false, false, false)).toBe(
        false
      );
    });

    test("should handle revert commits", () => {
      expect(
        isValidCommitMessage('Revert "feat: previous feature"', types, false, true, false)
      ).toBe(true);
      expect(
        isValidCommitMessage('Revert "feat: previous feature"', types, false, false, false)
      ).toBe(false);
    });

    test("should handle reapply commits", () => {
      expect(
        isValidCommitMessage('Reapply "feat: previous feature"', types, false, false, true)
      ).toBe(true);
      expect(
        isValidCommitMessage('Reapply "feat: previous feature"', types, false, false, false)
      ).toBe(false);
    });
  });
});
