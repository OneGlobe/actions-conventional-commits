import { jest } from "@jest/globals";

// Mock the GitHub Actions modules
jest.mock("@actions/github", () => ({
  context: {
    payload: {
      pull_request: {
        title: "feat: test pull request",
      },
    },
  },
}));

jest.mock("@actions/core");
jest.mock("../isValidCommitMesage");
jest.mock("../extractCommits");

import isValidCommitMessage from "../isValidCommitMesage";
import extractCommits from "../extractCommits";

const mockCore = {
  getInput: jest.fn(),
  getBooleanInput: jest.fn(),
  setFailed: jest.fn(),
  info: jest.fn(),
};

// Set up the core mock implementation
jest.mock("@actions/core", () => ({
  getInput: mockCore.getInput,
  getBooleanInput: mockCore.getBooleanInput,
  setFailed: mockCore.setFailed,
  info: mockCore.info,
}));

describe("main", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCore.getInput.mockReturnValue("feat,fix,chore");
    // Reset mocked functions to their default state
    (isValidCommitMessage as jest.Mock).mockReset();
    (extractCommits as jest.Mock).mockReset();
  });

  describe("pull request title validation", () => {
    beforeEach(() => {
      mockCore.getBooleanInput.mockImplementation(
        (input) => input === "include-pull-request-title"
      );
    });

    test("should pass when PR title is valid", async () => {
      (isValidCommitMessage as jest.Mock).mockReturnValue(true);

      // Need to use require here since we're testing the default export
      await require("../main").run();

      expect(mockCore.info).toHaveBeenCalledWith("✅ feat: test pull request");
      expect(mockCore.setFailed).not.toHaveBeenCalled();
    });

    test("should fail when PR title is invalid", async () => {
      (isValidCommitMessage as jest.Mock).mockReturnValue(false);

      await require("../main").run();

      expect(mockCore.setFailed).toHaveBeenCalledWith(
        "❌ feat: test pull request cannot be parsed as a valid conventional commit message."
      );
    });
  });

  describe("commit message validation", () => {
    beforeEach(() => {
      mockCore.getBooleanInput.mockImplementation((input) => input === "include-commits");
    });

    test("should pass when all commits are valid", async () => {
      const mockCommits = [{ message: "feat: first feature" }, { message: "fix: bug fix" }];
      (extractCommits as jest.Mock).mockResolvedValue(mockCommits);
      (isValidCommitMessage as jest.Mock).mockReturnValue(true);

      await require("../main").run();

      expect(mockCore.info).toHaveBeenCalledWith("✅ feat: first feature");
      expect(mockCore.info).toHaveBeenCalledWith("✅ fix: bug fix");
      expect(mockCore.setFailed).not.toHaveBeenCalled();
    });

    test("should fail when any commit is invalid", async () => {
      const mockCommits = [
        { message: "feat: valid commit" },
        { message: "invalid commit message" },
      ];
      (extractCommits as jest.Mock).mockResolvedValue(mockCommits);
      (isValidCommitMessage as jest.Mock).mockImplementation(
        (message) => message === "feat: valid commit"
      );

      await require("../main").run();

      expect(mockCore.info).toHaveBeenCalledWith("✅ feat: valid commit");
      expect(mockCore.setFailed).toHaveBeenCalledWith(
        "❌ invalid commit message cannot be parsed as a valid conventional commit message."
      );
    });

    test("should handle empty commit list", async () => {
      (extractCommits as jest.Mock).mockResolvedValue([]);

      await require("../main").run();

      expect(mockCore.setFailed).not.toHaveBeenCalled();
    });
  });

  describe("configuration", () => {
    test("should parse allowed commit types correctly", async () => {
      mockCore.getInput.mockReturnValue("type1,type2,type3");
      mockCore.getBooleanInput.mockReturnValue(false);

      await require("../main").run();

      expect(mockCore.getInput).toHaveBeenCalledWith("allowed-commit-types");
      expect(mockCore.getBooleanInput).toHaveBeenCalledWith("include-commits");
      expect(mockCore.getBooleanInput).toHaveBeenCalledWith("include-pull-request-title");
    });

    test("should handle when both PR title and commits are enabled", async () => {
      mockCore.getBooleanInput.mockReturnValue(true);
      (isValidCommitMessage as jest.Mock).mockReturnValue(true);
      (extractCommits as jest.Mock).mockResolvedValue([{ message: "feat: test commit" }]);

      await require("../main").run();

      expect(mockCore.info).toHaveBeenCalledWith("✅ feat: test pull request");
      expect(mockCore.info).toHaveBeenCalledWith("✅ feat: test commit");
    });
  });

  describe("error handling", () => {
    test("should handle errors from extractCommits gracefully", async () => {
      mockCore.getBooleanInput.mockImplementation((input) => input === "include-commits");
      (extractCommits as jest.Mock).mockRejectedValue(new Error("API Error"));

      await require("../main").run();

      expect(mockCore.setFailed).toHaveBeenCalled();
    });
  });
});
