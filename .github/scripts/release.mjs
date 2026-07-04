#!/usr/bin/env node

import { readFileSync, writeFileSync, appendFileSync, existsSync } from 'node:fs';

const COMMIT_PATTERN =
  /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(([^)]+)\))?(!)?:\s(.+)$/;

const TYPE_HEADINGS = [
  ['feat', 'Features'],
  ['fix', 'Bug Fixes'],
  ['perf', 'Performance Improvements'],
  ['revert', 'Reverts'],
  ['refactor', 'Code Refactoring'],
  ['docs', 'Documentation'],
  ['style', 'Styles'],
  ['test', 'Tests'],
  ['build', 'Build System'],
  ['ci', 'Continuous Integration'],
  ['chore', 'Chores'],
  ['other', 'Other Changes'],
];

const VERSION_FILE = 'VERSION';
const CHANGELOG_FILE = 'CHANGELOG.md';
const FRAGMENT_FILE = `${process.env.RUNNER_TEMP ?? '.'}/changelog-fragment.md`;

async function fetchPullRequestCommits(repo, prNumber, token) {
  const commits = [];
  let page = 1;

  for (;;) {
    const res = await fetch(
      `https://api.github.com/repos/${repo}/pulls/${prNumber}/commits?per_page=100&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
        },
      },
    );

    if (!res.ok) {
      throw new Error(`GitHub API request failed: ${res.status} ${res.statusText}`);
    }

    const batch = await res.json();
    commits.push(...batch);

    if (batch.length < 100) {
      break;
    }
    page += 1;
  }

  return commits;
}

function parseCommit(rawCommit) {
  const subjectLine = rawCommit.commit.message.split('\n')[0];
  const match = subjectLine.match(COMMIT_PATTERN);

  if (!match) {
    return { type: 'other', text: subjectLine };
  }

  const [, type, , , , subject] = match;
  const known = TYPE_HEADINGS.some(([knownType]) => knownType === type);
  return known ? { type, text: subject } : { type: 'other', text: subjectLine };
}

function decideBump(parsedCommits) {
  return parsedCommits.some((c) => c.type === 'feat') ? 'minor' : 'patch';
}

function readCurrentVersion() {
  if (!existsSync(VERSION_FILE)) {
    return '0.0.0';
  }
  return readFileSync(VERSION_FILE, 'utf8').trim();
}

function bumpVersion(current, bump) {
  const [major, minor, patch] = current.split('.').map(Number);
  if (bump === 'minor') {
    return `${major}.${minor + 1}.0`;
  }
  return `${major}.${minor}.${patch + 1}`;
}

function buildChangelogFragment(parsedCommits, prNumber) {
  const byType = new Map();
  for (const commit of parsedCommits) {
    if (!byType.has(commit.type)) {
      byType.set(commit.type, []);
    }
    byType.get(commit.type).push(commit.text);
  }

  const sections = [];
  for (const [type, heading] of TYPE_HEADINGS) {
    const items = byType.get(type);
    if (!items || items.length === 0) {
      continue;
    }
    const lines = items.map((text) => `- ${text} (#${prNumber})`).join('\n');
    sections.push(`### ${heading}\n\n${lines}`);
  }

  return sections.join('\n\n');
}

async function runPlan() {
  const repo = process.env.REPO;
  const prNumber = process.env.PR_NUMBER;
  const token = process.env.GH_TOKEN;
  const expectedCount = Number(process.env.PR_EXPECTED_COMMITS);

  const rawCommits = await fetchPullRequestCommits(repo, prNumber, token);

  if (rawCommits.length !== expectedCount) {
    console.log(
      `::warning::Fetched ${rawCommits.length} commits but PR reports ${expectedCount}; some commits may be missing from the changelog.`,
    );
  }

  const nonMergeCommits = rawCommits.filter((c) => c.parents.length < 2);
  const parsedCommits = nonMergeCommits.map(parseCommit);

  const bump = decideBump(parsedCommits);
  const currentVersion = readCurrentVersion();
  const nextVersion = bumpVersion(currentVersion, bump);
  const fragment = buildChangelogFragment(parsedCommits, prNumber);

  writeFileSync(FRAGMENT_FILE, fragment);

  const githubOutput = process.env.GITHUB_OUTPUT;
  if (githubOutput) {
    appendFileSync(githubOutput, `next_version=${nextVersion}\n`);
  } else {
    console.log(`next_version=${nextVersion}`);
  }
}

function runWrite() {
  const nextVersion = process.env.NEXT_VERSION;
  const fragment = readFileSync(FRAGMENT_FILE, 'utf8');
  const today = new Date().toISOString().slice(0, 10);

  writeFileSync(VERSION_FILE, `${nextVersion}\n`);

  const changelog = readFileSync(CHANGELOG_FILE, 'utf8');
  const entry = `## [${nextVersion}] - ${today}\n\n${fragment}\n\n`;

  const firstEntryIndex = changelog.indexOf('\n## ');
  const updated =
    firstEntryIndex === -1
      ? `${changelog.trimEnd()}\n\n${entry}`
      : `${changelog.slice(0, firstEntryIndex + 1)}\n${entry}${changelog.slice(firstEntryIndex + 1)}`;

  writeFileSync(CHANGELOG_FILE, updated);
}

const command = process.argv[2];

if (command === 'plan') {
  await runPlan();
} else if (command === 'write') {
  runWrite();
} else {
  throw new Error(`Unknown command: ${command}. Expected "plan" or "write".`);
}
