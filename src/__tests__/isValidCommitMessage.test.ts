import isValidCommitMessage from "../isValidCommitMesage";

describe("isValidCommitMessage", () => {
  const types = ["feat", "fix", "chore", "docs", "style", "refactor", "test", "build"];

  describe("basic format validation", () => {
    test("should validate basic commit messages", () => {
      expect(isValidCommitMessage("feat: add new feature", types)).toBe(true);
      expect(isValidCommitMessage("fix: resolve bug", types)).toBe(true);
      expect(isValidCommitMessage("invalid: wrong type", types)).toBe(false);
    });

    test("should reject messages without type", () => {
      expect(isValidCommitMessage(": missing type", types)).toBe(false);
      expect(isValidCommitMessage("just some text", types)).toBe(false);
    });

    test("should reject messages without description", () => {
      expect(isValidCommitMessage("feat:", types)).toBe(false);
      expect(isValidCommitMessage("fix: ", types)).toBe(false);
    });
  });

  describe("scope handling", () => {
    test("should validate messages with scope", () => {
      expect(isValidCommitMessage("feat(ui): add button", types)).toBe(true);
      expect(isValidCommitMessage("fix(api): fix endpoint", types)).toBe(true);
      expect(isValidCommitMessage("chore(deps): update dependencies", types)).toBe(true);
    });

    test("should validate scopes with numbers and hyphens", () => {
      expect(isValidCommitMessage("feat(ui-123): new feature", types)).toBe(true);
      expect(isValidCommitMessage("fix(api-v2): fix endpoint", types)).toBe(true);
    });

    test("should reject invalid scope formats", () => {
      expect(isValidCommitMessage("feat(UI): invalid caps", types)).toBe(false);
      expect(isValidCommitMessage("fix(api_test): invalid underscore", types)).toBe(false);
      expect(isValidCommitMessage("feat((double)): double parentheses", types)).toBe(false);
    });
  });

  describe("breaking changes", () => {
    test("should validate breaking change indicator", () => {
      expect(isValidCommitMessage("feat!: breaking change", types)).toBe(true);
      expect(isValidCommitMessage("fix(api)!: breaking fix", types)).toBe(true);
    });

    test("should validate breaking change with body", () => {
      expect(
        isValidCommitMessage(
          "feat!: breaking change\n\nBREAKING CHANGE: This will break things",
          types
        )
      ).toBe(true);
    });
  });

  describe("body and footer", () => {
    test("should validate messages with body", () => {
      expect(
        isValidCommitMessage(
          "feat: new feature\n\nThis is a detailed description of the feature.",
          types
        )
      ).toBe(true);
    });

    test("should validate messages with body and footer", () => {
      expect(
        isValidCommitMessage("fix: bug fix\n\nFixes the issue with login.\n\nCloses #123", types)
      ).toBe(true);
    });
  });

  describe("edge cases", () => {
    test("should handle empty input", () => {
      expect(isValidCommitMessage("", types)).toBe(false);
    });

    test("should handle messages with no allowed types", () => {
      expect(isValidCommitMessage("feat: something", [])).toBe(false);
    });

    test("should reject messages with emojis", () => {
      expect(isValidCommitMessage("✨ feat: sparkles", types)).toBe(false);
      expect(isValidCommitMessage("feat: add sparkles ✨", types)).toBe(true);
    });

    test("should reject malformed type-scope combinations", () => {
      expect(isValidCommitMessage("feat(: invalid scope", types)).toBe(false);
      expect(isValidCommitMessage("feat): invalid scope", types)).toBe(false);
      expect(isValidCommitMessage("feat(scope: missing parenthesis", types)).toBe(false);
    });
  });
});
