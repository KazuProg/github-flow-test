# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

- - -
## [v1.4.0](https://github.com/KazuProg/github-flow-test/compare/b35074427dd2c7491c83fc01cf9bdca835d56098..v1.4.0) - 2026-07-20
#### Documentation
- document branch protection rulesets and deploy key setup - ([b350744](https://github.com/KazuProg/github-flow-test/commit/b35074427dd2c7491c83fc01cf9bdca835d56098)) - KazuProg
#### Continuous Integration
- require admin approval for manual release dispatch - ([e7f651f](https://github.com/KazuProg/github-flow-test/commit/e7f651ff0bbf9bf7f5615f9ccb7566485375c2b4)) - KazuProg

- - -

## [v1.3.0](https://github.com/KazuProg/github-flow-test/compare/ca220a1a32d3f4413255acd27ec09ce1b5e7fb74..v1.3.0) - 2026-07-12
#### Documentation
- note CHANGELOG.md dates are UTC, not JST - ([cdf02e2](https://github.com/KazuProg/github-flow-test/commit/cdf02e220d42e45c3200cc7f33bccd75d747d1c6)) - KazuProg
#### Continuous Integration
- push release commits via deploy key to satisfy branch protection - ([7d837e8](https://github.com/KazuProg/github-flow-test/commit/7d837e8a72182a8ff6399b29fd3e940ee32f9c87)) - KazuProg
- add workflow_dispatch trigger to release workflow - ([bfc2f6a](https://github.com/KazuProg/github-flow-test/commit/bfc2f6a4be19e958f29e2989d6805ac7a2a104f7)) - KazuProg
- add bump-level-label workflow - ([471344b](https://github.com/KazuProg/github-flow-test/commit/471344b5ac37d5af681fbf05b2b84c6cec77d3b0)) - KazuProg
- bump ci commits as minor instead of patch - ([adfb4d1](https://github.com/KazuProg/github-flow-test/commit/adfb4d1393a071cdf6c4896581b04ae02ee6717e)) - KazuProg
- fail PRs containing fixup/squash commits - ([ca220a1](https://github.com/KazuProg/github-flow-test/commit/ca220a1a32d3f4413255acd27ec09ce1b5e7fb74)) - KazuProg
#### Chores
- add script to create bump-level and no-release labels - ([3369051](https://github.com/KazuProg/github-flow-test/commit/3369051781fd9f5ded257675fad4ef8e6d42abaf)) - KazuProg

- - -

## [v1.2.1](https://github.com/KazuProg/github-flow-test/compare/0db125ceefa31817e8fbcd498371309258ad6824..v1.2.1) - 2026-07-05
#### Documentation
- document ci as release-worthy in this repo - ([462c509](https://github.com/KazuProg/github-flow-test/commit/462c509655beec601e97d650c8e7d47b159ce9dc)) - KazuProg
- consolidate duplicated release-process explanations - ([7f150be](https://github.com/KazuProg/github-flow-test/commit/7f150bee5afd5c6286675aa439a9c1a84de0524b)) - KazuProg
- generalize merge-strategy guidance to include Merge commit - ([86c1a3a](https://github.com/KazuProg/github-flow-test/commit/86c1a3af4fe6a11c44644546ea601568665d21c3)) - KazuProg
- backfill CLAUDE.md context lost when removing dead links - ([b531bb0](https://github.com/KazuProg/github-flow-test/commit/b531bb0d1ce0683d388f58e1c131837d4afc8510)) - KazuProg
- remove dead links to untracked CLAUDE.md in adoption guide - ([d644fd2](https://github.com/KazuProg/github-flow-test/commit/d644fd2456657c49a97f6527515187dbf1206004)) - KazuProg
- add guide for adopting this release pipeline elsewhere - ([0db125c](https://github.com/KazuProg/github-flow-test/commit/0db125ceefa31817e8fbcd498371309258ad6824)) - KazuProg
#### Continuous Integration
- treat ci commits as patch-bump-eligible - ([24930c1](https://github.com/KazuProg/github-flow-test/commit/24930c115a3774648207305ebac0416b3e6395b5)) - KazuProg
- drop stale paths-ignore from release trigger - ([82d0c97](https://github.com/KazuProg/github-flow-test/commit/82d0c97e5d496d5eacfb5328001396c49ca8562e)) - KazuProg

- - -

## [v1.2.0](https://github.com/KazuProg/github-flow-test/compare/78d3509a32172617e7e4540db366c2e7fc2d3b2e..v1.2.0) - 2026-07-05
#### Features
- note CD trigger guidance for release-vs-merge commit split - ([0a140e4](https://github.com/KazuProg/github-flow-test/commit/0a140e439b8ddc4547d3b19f9a5a809d9edb41f1)) - KazuProg
#### Documentation
- document this repo's CI/release design goals in README - ([7e4b6fc](https://github.com/KazuProg/github-flow-test/commit/7e4b6fc1b39e1be0ad6c093e930bf7b50d766034)) - KazuProg
#### Continuous Integration
- trigger release on PR merge, skip via no-release label - ([dd9fb05](https://github.com/KazuProg/github-flow-test/commit/dd9fb0527c89587cd8d78192c9cfb3e147af0c5c)) - KazuProg
#### Chores
- skip release bump for non-product commit types - ([78d3509](https://github.com/KazuProg/github-flow-test/commit/78d3509a32172617e7e4540db366c2e7fc2d3b2e)) - KazuProg

- - -

## [v1.1.2](https://github.com/KazuProg/github-flow-test/compare/893a74ce7e0bf77a8bc1c1e3484939ab86fd59f7..v1.1.2) - 2026-07-05
#### Continuous Integration
- fetch commitlint via npx instead of package.json deps - ([893a74c](https://github.com/KazuProg/github-flow-test/commit/893a74ce7e0bf77a8bc1c1e3484939ab86fd59f7)) - KazuProg

- - -

## [v1.1.1](https://github.com/KazuProg/github-flow-test/compare/403cf55cb53f42e017fb6532d8fe113c9b256b6a..v1.1.1) - 2026-07-05
#### Chores
- inline commitlint config into lint-commits.yml - ([403cf55](https://github.com/KazuProg/github-flow-test/commit/403cf55cb53f42e017fb6532d8fe113c9b256b6a)) - KazuProg

- - -

## [v1.1.0](https://github.com/KazuProg/github-flow-test/compare/cf5f08d2862bc53d1ce0e87893c31a1311262192..v1.1.0) - 2026-07-05
#### Features
- mention cocogitto as the release automation tool in README - ([cf5f08d](https://github.com/KazuProg/github-flow-test/commit/cf5f08d2862bc53d1ce0e87893c31a1311262192)) - KazuProg

- - -


## [1.0.0] - 2026-07-05

### Chores

* replace semantic-release/python-semantic-release with cocogitto (unified Node/Python versioning, tag, and changelog)

## [0.4.1](https://github.com/KazuProg/github-flow-test/compare/v0.4.0...v0.4.1) (2026-07-04)

### Code Refactoring

* move Python example from python-example/ to repo root ([d593a76](https://github.com/KazuProg/github-flow-test/commit/d593a76413252b867af7aeb24ce55a6b40d6aeee))

### Chores

* **release:** python-v0.1.0 [skip ci] ([7782dc3](https://github.com/KazuProg/github-flow-test/commit/7782dc3a4fd99dff0bf498e06d71dfcaadd62d9e))

## [0.4.0](https://github.com/KazuProg/github-flow-test/compare/v0.3.3...v0.4.0) (2026-07-04)

### Features

* add Python release workflow alongside Node ([6c688b3](https://github.com/KazuProg/github-flow-test/commit/6c688b3c7197d8094d5557e271695d17268557f9))

## [0.3.3](https://github.com/KazuProg/github-flow-test/compare/v0.3.2...v0.3.3) (2026-07-04)

### Continuous Integration

* add commitlint check for PR commit messages ([02cebbe](https://github.com/KazuProg/github-flow-test/commit/02cebbe270d31e9e08bf4620ae9713bfaaf97771))

## [0.3.2](https://github.com/KazuProg/github-flow-test/compare/v0.3.1...v0.3.2) (2026-07-04)

### Continuous Integration

* skip release workflow for CI-only file changes ([09037d9](https://github.com/KazuProg/github-flow-test/commit/09037d9f544233b3b13621cc86e03f0c7aaeeca1))

### Chores

* pin CHANGELOG preamble as part of changelogTitle ([4727ab3](https://github.com/KazuProg/github-flow-test/commit/4727ab3f7e22949f63e7396f1fc0eb17b64e17d5))

## [0.3.1](https://github.com/KazuProg/github-flow-test/compare/v0.3.0...v0.3.1) (2026-07-04)

### Chores

* ignore log files ([3140f48](https://github.com/KazuProg/github-flow-test/commit/3140f48ab714503d6c6763a5af4c38c293c70830))

## [0.3.0](https://github.com/KazuProg/github-flow-test/compare/v0.2.2...v0.3.0) (2026-07-04)

### Features

* add release workflow status badge to README ([9e40d8f](https://github.com/KazuProg/github-flow-test/commit/9e40d8f38aa5f8643fadd21b93213e6afddfeafe))

## [0.2.2](https://github.com/KazuProg/github-flow-test/compare/v0.2.1...v0.2.2) (2026-07-04)

### Bug Fixes

* pin conventional-changelog-conventionalcommits to 9.3.1 ([baa6ea7](https://github.com/KazuProg/github-flow-test/commit/baa6ea780fd680650a8642dc6627f9ed30b036a1))

## [0.2.1](https://github.com/KazuProg/github-flow-test/compare/v0.2.0...v0.2.1) (2026-07-04)

## [0.2.0] - 2026-07-04

### Features

- add project description to README (#1)

### Documentation

- link CONTRIBUTING.md from README (#1)
