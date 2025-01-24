const isException = (
  message: string,
  allowMergeCommits: boolean,
  allowRevertCommits: boolean,
  allowReapplyCommits: boolean,
): boolean => {
  if (allowMergeCommits && message.startsWith("Merge ")) {
    return true;
  }
  if (allowRevertCommits && message.startsWith("Revert ")) {
    return true;
  }
  if (allowReapplyCommits && message.startsWith("Reapply ")) {
    return true;
  }

  return false;
};

const isValidCommitMessage = (
  message: string,
  availableTypes: string[] = [],
  allowMergeCommits: boolean,
  allowRevertCommits: boolean,
  allowReapplyCommits: boolean,
): boolean => {
  if (isException(message, allowMergeCommits, allowRevertCommits, allowReapplyCommits)) {
    return true;
  }

  let availableTypesString = availableTypes.join("|");
  let pattern = new RegExp(
    `^(?:${availableTypesString})` + // type
      `(?:\\([a-z0-9-]+\\))?` + // optional scope
      `(?:!)?` + // optional breaking change indicator
      `: ` + // required colon and space
      `.+` + // required subject (at least one character)
      `(?:\n\n[\\s\\S]*)?$`, // optional body/footer (any content after double newline)
  );

  let match = message.match(pattern);

  return !!match;
};

export default isValidCommitMessage;
