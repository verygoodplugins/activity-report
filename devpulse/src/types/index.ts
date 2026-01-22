export interface FileChange {
  file: string;
  added: number;
  deleted: number;
}

export interface Commit {
  type: string;
  hash: string;
  shortHash: string;
  date: string;
  headline: string;
  body: string;
  repo: string;
  owner: string;
  repoSlug: string;
  remoteUrl: string;
  stats: {
    added: number;
    deleted: number;
    files: number;
  };
  files: FileChange[];
}

export interface PullRequest {
  type: string;
  number: number;
  title: string;
  state: string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
  mergedAt?: string;
  headBranch: string;
  baseBranch: string;
  repo: string;
  repoFull?: string;
  owner?: string;
  repoSlug?: string;
  remoteUrl?: string;
  url: string;
  additions?: number;
  deletions?: number;
  changedFiles?: number;
  stats?: {
    added: number;
    deleted: number;
    files: number;
  };
  body?: string;
}

export interface ActivityData {
  generatedAt: string;
  periodStart: string;
  commits: Commit[];
  prs?: PullRequest[];
}

export interface DayActivity {
  date: Date;
  dayName: string;
  dayNum: number;
  month: string;
  commits: Commit[];
  added: number;
  deleted: number;
  repos: Set<string>;
  isToday: boolean;
}

export interface RepoStats {
  name: string;
  commits: number;
  added: number;
  deleted: number;
  url: string;
  owner: string;
  description?: string;
  stars?: number;
  language?: string;
  topics?: string[];
  forks?: number;
}

export type Theme = 'dark' | 'light';
