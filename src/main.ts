import { context } from "@actions/github";
import * as core from "@actions/core";

import isValidCommitMessage from "./isValidCommitMesage";
import extractCommits from "./extractCommits";

export async function run() {
    const allowMergeCommits = core.getBooleanInput("allow-merge-commits");
    const allowReapplyCommits = core.getBooleanInput("allow-reapply-commits");
    const allowRevertCommits = core.getBooleanInput("allow-revert-commits");
    const allowedCommitTypes = core.getInput("allowed-commit-types").split(",");
    const failureMessage = core.getInput("failure-message");
    const includeCommits = core.getBooleanInput("include-commits");
    const includePullRequestTitle = core.getBooleanInput("include-pull-request-title");

    let hasFailed = false;

  try {

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
        hasFailed = true;
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
          hasFailed = true;
        }
      }
    }

    if (hasFailed) {
      core.setFailed(failureMessage);
    }
  } catch (error) {
    core.error(error as Error);
    core.setFailed((error as Error).message);
  }
}

run();
