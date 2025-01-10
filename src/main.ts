import { context } from "@actions/github";
import * as core from "@actions/core";

import isValidCommitMessage from "./isValidCommitMesage";
import extractCommits from "./extractCommits";

export async function run() {
  try {
    const allowMergeCommits = core.getBooleanInput("allow-merge-commits");
    const allowReapplyCommits = core.getBooleanInput("allow-reapply-commits");
    const allowRevertCommits = core.getBooleanInput("allow-revert-commits");
    const allowedCommitTypes = core.getInput("allowed-commit-types").split(",");
    const includeCommits = core.getBooleanInput("include-commits");
    const includePullRequestTitle = core.getBooleanInput("include-pull-request-title");

    if (includePullRequestTitle) {
      core.info("🔎 Analyzing pull request title:");
      const pullRequest = context.payload.pull_request;
      if (!pullRequest) {
        core.setFailed("No pull request found");
        return;
      }
      if (
        isValidCommitMessage(
          pullRequest.title,
          allowedCommitTypes,
          allowMergeCommits,
          allowRevertCommits,
          allowReapplyCommits
        )
      ) {
        core.info(`✅ ${pullRequest.title}`);
      } else {
        core.setFailed(
          `❌ ${pullRequest.title} cannot be parsed as a valid conventional commit message.`
        );
      }
    }

    if (includeCommits) {
      const extractedCommits = await extractCommits(context);
      core.info(`🔎 Analyzing ${extractedCommits.length} commits:`);
      for (let i = 0; i < extractedCommits.length; i++) {
        let commit = extractedCommits[i];
        if (isValidCommitMessage(commit.message, allowedCommitTypes, true, false, false)) {
          core.info(`✅ ${commit.message}`);
        } else {
          core.setFailed(
            `❌ ${commit.message} cannot be parsed as a valid conventional commit message.`
          );
        }
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('An unknown error occurred');
    }
  }
}

run();
