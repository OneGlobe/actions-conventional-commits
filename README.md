# Conventional Commits GitHub Action

Validate that your commit messages and pull request titles are following the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0-beta.2/) specification.

```yml
name: Conventional Commits

on:
  pull_request:
    types:
      - edited
      - opened
      - reopened
      - synchronize

jobs:
  build:
    name: Conventional Commits
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: doomspork/action-conventional-commits@v1.4
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }} # Optional, for private repositories.
          allowed-commit-types: "feat,fix" # Optional, set if you want a subset of commit types to be allowed.
          include-pull-request-title: true # Optional, set if you want to validate the pull request title.
          include-commits: false # Optional, set to false if you want to ignore commit messages (e.g. when squashing commits and only interested in the final commit message).
```

## Options

- `allowed-commit-types`: A comma separated list of allowed commit types. Defaults to `feat,fix,docs,style,refactor,test,build,perf,ci,chore,revert,merge,wip`.
- `include-pull-request-title`: Set to `true` if you want to validate the pull request title. Defaults to `false`.
- `include-commits`: Set to `true` if you want to validate the commit messages. Defaults to `true`.

If you're using commit squashing and you're only interested in the final commit message, you can set `include-commits` to `false` and `include-pull-request-title` to `true`.