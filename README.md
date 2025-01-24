# Conventional Commits GitHub Action

A simple GitHub action that makes sure all commit messages are following the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0//) specification.

Note that, typically, you would make this check on a pre-commit hook (for example, using something like [Commitlint](https://commitlint.js.org/)), but those can easily be skipped, hence this GitHub action.

### Usage
Latest version: `v1.4.0`

```yml
name: Conventional Commits

on:
  pull_request:

jobs:
  build:
    name: Conventional Commits
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: doomspork/actions-conventional-commits@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }} # Optional, for private repositories.
          allowed-commit-types: "feat,fix" # Optional, set if you want a subset of commit types to be allowed.
```
