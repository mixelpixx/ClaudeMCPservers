#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";
import {
  GitHubForkSchema,
  GitHubReferenceSchema,
  GitHubRepositorySchema,
  GitHubIssueSchema,
  GitHubPullRequestSchema,
  GitHubContentSchema,
  GitHubCreateUpdateFileResponseSchema,
  GitHubSearchResponseSchema,
  GitHubTreeSchema,
  GitHubCommitSchema,
  CreateRepositoryOptionsSchema,
  CreateCommentOptionsSchema,
  CreateIssueOptionsSchema,
  CreatePullRequestOptionsSchema,
  CreateBranchOptionsSchema,
  type GitHubFork,
  type GitHubReference,
  type GitHubRepository,
  type GitHubIssue,
  type GitHubPullRequest,
  type GitHubContent,
  type GitHubCreateUpdateFileResponse,
  type GitHubSearchResponse,
  type GitHubTree,
  type GitHubCommit,
  type FileOperation,
  CreateOrUpdateFileSchema,
  SearchRepositoriesSchema,
  CreateRepositorySchema,
  GetFileContentsSchema,
  PushFilesSchema,
  CreateIssueSchema,
  CreatePullRequestSchema,
  ForkRepositorySchema,
  CreateBranchSchema,
  GetRepositorySchema,
  ListBranchesSchema,
  SearchIssuesAndPullRequestsSchema
} from './schemas.js';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const server = new Server({
  name: "github-mcp-server",
  version: "0.1.0",
  rateLimit: { maxRequests: 5000, perSeconds: 3600 },
}, {
  capabilities: {
    tools: {}
  }
});

const GITHUB_PERSONAL_ACCESS_TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

if (!GITHUB_PERSONAL_ACCESS_TOKEN) {
  console.error("GITHUB_PERSONAL_ACCESS_TOKEN environment variable is not set");
  process.exit(1);
}

async function getRateLimit(): Promise<{ remaining: number, limit: number, reset: number }> {
  const response = await fetch('https://api.github.com/rate_limit', {
    headers: {
      "Authorization": `token ${GITHUB_PERSONAL_ACCESS_TOKEN}`,
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "github-mcp-server"
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    remaining: data.rate.remaining,
    limit: data.rate.limit,
    reset: data.rate.reset
  };
}

async function handleRateLimit() {
  const { remaining, limit, reset } = await getRateLimit();
  console.error(`Rate limit: ${remaining}/${limit} remaining. Resets at ${new Date(reset * 1000).toISOString()}`);
  return { remaining, limit, reset };
}

async function forkRepository(
  owner: string,
  repo: string,
  organization?: string
): Promise<GitHubFork> {
  const url = organization 
    ? `https://api.github.com/repos/${owner}/${repo}/forks?organization=${organization}`
    : `https://api.github.com/repos/${owner}/${repo}/forks`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `token ${GITHUB_PERSONAL_ACCESS_TOKEN}`,
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "github-mcp-server"
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  return GitHubForkSchema.parse(await response.json());
}

async function createBranch(
  owner: string,
  repo: string,
  options: z.infer<typeof CreateBranchOptionsSchema>
): Promise<GitHubReference> {
  const fullRef = `refs/heads/${options.ref}`;
  
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/refs`,
    {
      method: "POST",
      headers: {
        "Authorization": `token ${GITHUB_PERSONAL_ACCESS_TOKEN}`,
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "github-mcp-server",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ref: fullRef,
        sha: options.sha
      })
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  return GitHubReferenceSchema.parse(await response.json());
}

async function getDefaultBranchSHA(
  owner: string,
  repo: string
): Promise<string> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/main`,
    {
      headers: {
        "Authorization": `token ${GITHUB_PERSONAL_ACCESS_TOKEN}`,
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "github-mcp-server"
      }
    }
  );

  if (!response.ok) {
    const masterResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/master`,
      {
        headers: {
          "Authorization": `token ${GITHUB_PERSONAL_ACCESS_TOKEN}`,
          "Accept": "application/vnd.github.v3+json",
          "User-Agent": "github-mcp-server"
        }
      }
    );

    if (!masterResponse.ok) {
      throw new Error("Could not find default branch (tried 'main' and 'master')");
    }

    const data = GitHubReferenceSchema.parse(await masterResponse.json());
    return data.object.sha;
  }

  const data = GitHubReferenceSchema.parse(await response.json());
  return data.object.sha;
}

async function getFileContents(
  owner: string,
  repo: string,
  path: string,
  branch?: string
): Promise<GitHubContent> {
  let url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  if (branch) {
    url += `?ref=${branch}`;
  }

  const response = await fetch(url, {
    headers: {
      "Authorization": `token ${GITHUB_PERSONAL_ACCESS_TOKEN}`,
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "github-mcp-server"
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  const data = GitHubContentSchema.parse(await response.json());

  // If it's a file, decode the content
  if (!Array.isArray(data) && data.content) {
    data.content = Buffer.from(data.content, 'base64').toString('utf8');
  }

  return data;
}

async function createIssue(
  owner: string,
  repo: string,
  options: z.infer<typeof CreateIssueOptionsSchema>
): Promise<GitHubIssue> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues`,
    {
      method: "POST",
      headers: {
        "Authorization": `token ${GITHUB_PERSONAL_ACCESS_TOKEN}`,
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "github-mcp-server",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(options)
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  return GitHubIssueSchema.parse(await response.json());
}

async function createPullRequest(
  owner: string,
  repo: string,
  options: z.infer<typeof CreatePullRequestOptionsSchema>
): Promise<GitHubPullRequest> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls`,
    {
      method: "POST",
      headers: {
        "Authorization": `token ${GITHUB_PERSONAL_ACCESS_TOKEN}`,
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "github-mcp-server",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(options)
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  return GitHubPullRequestSchema.parse(await response.json());
}

async function createOrUpdateFile(
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  branch: string,
  sha?: string
): Promise<GitHubCreateUpdateFileResponse> {
  const encodedContent = Buffer.from(content).toString('base64');

  let currentSha = sha;
  if (!currentSha) {
    try {
      const existingFile = await getFileContents(owner, repo, path, branch);
      if (!Array.isArray(existingFile)) {
        currentSha = existingFile.sha;
      }
    } catch (error) {
      console.error('Note: File does not exist in branch, will create new file');
    }
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  
  const body = {
    message,
    content: encodedContent,
    branch,
    ...(currentSha ? { sha: currentSha } : {})
  };

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Authorization": `token ${GITHUB_PERSONAL_ACCESS_TOKEN}`,
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "github-mcp-server",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  return GitHubCreateUpdateFileResponseSchema.parse(await response.json());
}

async function createTree(
  owner: string,
  repo: string,
  files: FileOperation[],
  baseTree?: string
): Promise<GitHubTree> {
  const tree = files.map(file => ({
    path: file.path,
    mode: '100644' as const,
    type: 'blob' as const,
    content: file.content
  }));

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees`,
    {
      method: "POST",
      headers: {
        "Authorization": `token ${GITHUB_PERSONAL_ACCESS_TOKEN}`,
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "github-mcp-server",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        tree,
        base_tree: baseTree
      })
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  return GitHubTreeSchema.parse(await response.json());
}

async function createCommit(
  owner: string,
  repo: string,
  message: string,
  tree: string,
  parents: string[]
): Promise<GitHubCommit> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/commits`,
    {
      method: "POST",
      headers: {
        "Authorization": `token ${GITHUB_PERSONAL_ACCESS_TOKEN}`,
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "github-mcp-server",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message,
        tree,
        parents
      })
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  return GitHubCommitSchema.parse(await response.json());
}

async function updateReference(
  owner: string,
  repo: string,
  ref: string,
  sha: string
): Promise<GitHubReference> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/refs/${ref}`,
    {
      method: "PATCH",
      headers: {
        "Authorization": `token ${GITHUB_PERSONAL_ACCESS_TOKEN}`,
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "github-mcp-server",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sha,
        force: true
      })
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  return GitHubReferenceSchema.parse(await response.json());
}

async function pushFiles(
  owner: string,
  repo: string,
  branch: string,
  files: FileOperation[],
  message: string
): Promise<GitHubReference> {
  const refResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`,
    {
      headers: {
        "Authorization": `token ${GITHUB_PERSONAL_ACCESS_TOKEN}`,
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "github-mcp-server"
      }
    }
  );

  if (!refResponse.ok) {
    throw new Error(`GitHub API error: ${refResponse.statusText}`);
  }

  const ref = GitHubReferenceSchema.parse(await refResponse.json());
  const commitSha = ref.object.sha;

  const tree = await createTree(owner, repo, files, commitSha);
  const commit = await createCommit(owner, repo, message, tree.sha, [commitSha]);
  return await updateReference(owner, repo, `heads/${branch}`, commit.sha);
}

async function searchRepositories(
  query: string,
  page: number = 1,
  perPage: number = 30
): Promise<GitHubSearchResponse> {
  const url = new URL("https://api.github.com/search/repositories");
  url.searchParams.append("q", query);
  url.searchParams.append("page", page.toString());
  url.searchParams.append("per_page", perPage.toString());

  const response = await fetch(url.toString(), {
    headers: {
      "Authorization": `token ${GITHUB_PERSONAL_ACCESS_TOKEN}`,
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "github-mcp-server"
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`Continuing the src/github/index.ts file:
