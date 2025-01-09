import extractCommits from "../extractCommits";
import got from "got";

// Mock got package
jest.mock("got");
const mockedGot = got as jest.Mocked<typeof got>;

describe("extractCommits", () => {
  // Mock core object that GitHub Actions provides
  const mockCore = {
    getInput: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should extract commits from push event", async () => {
    const mockContext = {
      payload: {
        commits: [{ message: "feat: first commit" }, { message: "fix: second commit" }],
      },
    };

    const commits = await extractCommits(mockContext, mockCore);

    expect(commits).toEqual([{ message: "feat: first commit" }, { message: "fix: second commit" }]);
    // Verify got was not called since we're using push event
    expect(mockedGot.get).not.toHaveBeenCalled();
  });

  test("should extract commits from PR event", async () => {
    const mockContext = {
      payload: {
        pull_request: {
          commits_url: "https://api.github.com/repos/owner/repo/pulls/1/commits",
        },
      },
    };

    // Mock the API response
    mockedGot.get.mockResolvedValueOnce({
      body: [
        { commit: { message: "feat: first commit" } },
        { commit: { message: "fix: second commit" } },
      ],
    } as any);

    const commits = await extractCommits(mockContext, mockCore);

    expect(commits).toEqual([{ message: "feat: first commit" }, { message: "fix: second commit" }]);
    expect(mockedGot.get).toHaveBeenCalledTimes(1);
    expect(mockedGot.get).toHaveBeenCalledWith(
      "https://api.github.com/repos/owner/repo/pulls/1/commits",
      expect.any(Object)
    );
  });

  test("should use auth token when provided", async () => {
    const mockContext = {
      payload: {
        pull_request: {
          commits_url: "https://api.github.com/repos/owner/repo/pulls/1/commits",
        },
      },
    };

    mockCore.getInput.mockReturnValue("test-token");
    mockedGot.get.mockResolvedValueOnce({
      body: [{ commit: { message: "feat: commit" } }],
    } as any);

    await extractCommits(mockContext, mockCore);

    expect(mockedGot.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "token test-token",
        }),
      })
    );
  });

  test("should handle API errors gracefully", async () => {
    const mockContext = {
      payload: {
        pull_request: {
          commits_url: "https://api.github.com/repos/owner/repo/pulls/1/commits",
        },
      },
    };

    mockedGot.get.mockRejectedValueOnce(new Error("API Error"));

    const commits = await extractCommits(mockContext, mockCore);

    expect(commits).toEqual([]);
  });

  test("should return empty array for unknown event types", async () => {
    const mockContext = {
      payload: {},
    };

    const commits = await extractCommits(mockContext, mockCore);

    expect(commits).toEqual([]);
    expect(mockedGot.get).not.toHaveBeenCalled();
  });
});
