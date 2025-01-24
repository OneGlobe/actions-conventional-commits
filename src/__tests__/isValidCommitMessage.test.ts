import isValidCommitMessage from "../isValidCommitMesage";

test("should be able to correctly validate the commit message", () => {
  expect(isValidCommitMessage("chore(nice-one): doing this right")).toBe(true);
  expect(isValidCommitMessage("feat!: change all the things")).toBe(true);
  expect(isValidCommitMessage("fix(user)!: a fix with some breaking changes")).toBe(true);
  expect(isValidCommitMessage("fix: menu must open on shortcut press")).toBe(true);
  expect(isValidCommitMessage("something: should not work")).toBe(false);
  expect(isValidCommitMessage("fixes something")).toBe(false);
  expect(isValidCommitMessage("🚧 fix: menu must open on shortcut press")).toBe(true);
  expect(isValidCommitMessage("fix(menus): menu must open on shortcut press")).toBe(true);
  expect(isValidCommitMessage("🚧 fix(menus): menu must open on shortcut press")).toBe(true);
  expect(isValidCommitMessage("🚧 fixing something")).toBe(false);
  expect(isValidCommitMessage("🚧 something: should not work")).toBe(false);
  expect(isValidCommitMessage("chorz: 123")).toBe(false);
});

describe("isValidCommitMessage", () => {
  it("should handle custom commit types", () => {
    const customTypes = ["custom", "special"];
    expect(isValidCommitMessage("custom: new feature", customTypes)).toBe(true);
    expect(isValidCommitMessage("special: something", customTypes)).toBe(true);
    expect(isValidCommitMessage("feat: new feature", customTypes)).toBe(false);
  });

  it("should handle merge commits", () => {
    expect(isValidCommitMessage("Merge pull request #123 from branch")).toBe(true);
    expect(isValidCommitMessage("Merge branch 'main' into feature")).toBe(true);
  });

  it("should handle revert commits", () => {
    expect(isValidCommitMessage('Revert "feat: previous feature"')).toBe(true);
    expect(isValidCommitMessage("Revert abc123: previous commit")).toBe(true);
  });

  it("should handle edge cases", () => {
    expect(isValidCommitMessage("")).toBe(false);
    expect(isValidCommitMessage(" ")).toBe(false);
    expect(isValidCommitMessage("feat:")).toBe(true);
    expect(isValidCommitMessage("feat: ")).toBe(true);
    expect(isValidCommitMessage("feat()!: breaking change")).toBe(true);
  });

  it("should handle multiple scopes", () => {
    expect(isValidCommitMessage("feat(scope1,scope2): multiple scopes")).toBe(true);
    expect(isValidCommitMessage("fix(ui,api): multiple fixes")).toBe(true);
  });
});
