# Conventional Commits GitHub Action

Validate that your commit messages and pull request titles are following the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0) specification.

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

      - uses: doomspork/actions-conventional-commits@v1.4
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }} # Optional, for private repositories.
          allowed-commit-types: "feat,fix" # Optional, set if you want a subset of commit types to be allowed.
          include-pull-request-title: true # Optional, set if you want to validate the pull request title.
          include-commits: false # Optional, set to false if you want to ignore commit messages.
          allow-merge-commits: true # Optional, set to true to allow "Merge" commits.
          allow-revert-commits: false # Optional, set to true to allow "Revert" commits.
          allow-reapply-commits: false # Optional, set to true to allow "Reapply" commits.
```

## Options

- `allowed-commit-types`: A comma separated list of allowed commit types. Defaults to `feat,fix,docs,style,refactor,test,build,perf,ci,chore,revert,merge,wip`.
- `include-pull-request-title`: Set to `true` if you want to validate the pull request title. Defaults to `false`.
- `include-commits`: Set to `true` if you want to validate the commit messages. Defaults to `true`.
- `allow-merge-commits`: Set to `true` to allow commits starting with "Merge". Defaults to `false`.
- `allow-revert-commits`: Set to `true` to allow commits starting with "Revert". Defaults to `false`.
- `allow-reapply-commits`: Set to `true` to allow commits starting with "Reapply". Defaults to `false`.

If you're using commit squashing and you're only interested in the final commit message, you can set `include-commits` to `false` and `include-pull-request-title` to `true`.

⚠️ **Important:** this fork includes breaking changes in how merge and revert commits are handled:

- `allow-merge-commits` now defaults to `false` (previously merge commits were always allowed)
- `allow-revert-commits` now defaults to `false` (previously revert commits were always allowed)
- Added new option `allow-reapply-commits` which defaults to `false`

If you're upgrading and want to maintain the same behavior add these options to your workflow:

```yml
with:
  allow-merge-commits: true
  allow-revert-commits: true
```