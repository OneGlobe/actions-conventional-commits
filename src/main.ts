import { context } from "@actions/github";
import * as core from "@actions/core";

import isValidCommitMessage from "./isValidCommitMesage";
import extractCommits from "./extractCommits";

async function run() {
  const allowedCommitTypes = core.getInput("allowed-commit-types").split(",");
  const includePullRequestTitle = core.getBooleanInput("include-pull-request-title");

  let hasErrors = false;

  if (includePullRequestTitle) {
    core.info(
      "ℹ️ Checking pull request title is following the Conventional Commits specification...",
    );

    const pullRequest = context.payload.pull_request;
    if (!pullRequest) {
      core.info("No pull request found, skipping title check...");
      return;
    }

    if (isValidCommitMessage(pullRequest.title, allowedCommitTypes)) {
      core.info(`✅ ${pullRequest.title}`);
    } else {
      core.info(`🚩 ${pullRequest.title}`);
      hasErrors = true;
    }
  }

  core.info(
    "ℹ️ Checking if commit messages are following the Conventional Commits specification...",
  );

  const extractedCommits = await extractCommits(context);
  if (extractedCommits.length === 0) {
    core.info("No commits to check, skipping...");
    return;
  }

  core.startGroup("Commit messages:");

  for (let i = 0; i < extractedCommits.length; i++) {
    let commit = extractedCommits[i];
    if (isValidCommitMessage(commit.message, allowedCommitTypes)) {
      core.info(`✅ ${commit.message}`);
    } else {
      core.info(`🚩 ${commit.message}`);
      hasErrors = true;
    }
  }
  core.endGroup();

  if (hasErrors) {
    core.setFailed(
      "🚫 According to the conventional-commits specification, some of the commit messages are not valid.",
    );
  } else {
    core.info("🎉 All commit messages are following the Conventional Commits specification.");
  }
}

run();
