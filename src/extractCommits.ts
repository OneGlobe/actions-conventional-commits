import get from "dash-get";
import ky from "ky";
import { Context } from "@actions/github/lib/context";
import * as core from "@actions/core";

type Commit = {
  message: string;
};

const extractCommits = async (context: Context): Promise<Commit[]> => {
  // For "push" events, commits can be found in the "context.payload.commits".
  const pushCommits = Array.isArray(get(context, "payload.commits"));
  if (pushCommits) {
    return context.payload.commits;
  }

  // For PRs, we need to get a list of commits via the GH API:
  const prCommitsUrl = get(context, "payload.pull_request.commits_url");
  if (prCommitsUrl) {
    try {
      const requestHeaders = {
        accept: "application/vnd.github+json",
      };

      const response = await ky
        .get(prCommitsUrl, {
          headers: requestHeaders,
        })
        .json();

      if (Array.isArray(response)) {
        return response.map((item) => item.commit);
      }
      return [];
    } catch {
      return [];
    }
  }

  return [];
};

export default extractCommits;
