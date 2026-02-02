import { Injectable, NotFoundException } from '@nestjs/common';
import { readdir, readFile, stat } from 'fs/promises';
import { join, resolve, relative } from 'path';

const DOCS_BASE_PATH = resolve(process.cwd(), 'docs');
const README_FILE = 'README.md';

export interface DocChild {
  name: string;
  type: 'directory' | 'file';
  path: string;
}

export interface DocDirectoryResponse {
  type: 'directory';
  name: string;
  path: string;
  content: string;
  children: DocChild[];
}

export interface DocFileResponse {
  type: 'file';
  name: string;
  path: string;
  content: string;
}

export type DocResponse = DocDirectoryResponse | DocFileResponse;

export interface DocSearchResult {
  path: string;
  name: string;
  line: number;
  snippet: string;
}

export interface DocSearchResponse {
  results: DocSearchResult[];
}

@Injectable()
export class DocsService {
  private resolveDocsPath(requestPath: string): string {
    const normalizedPath = requestPath
      .replace(/^\//, '')
      .replace(/\/+/g, '/')
      .trim();
    const fullPath = resolve(DOCS_BASE_PATH, normalizedPath);
    const relativePath = relative(DOCS_BASE_PATH, fullPath);
    if (relativePath.startsWith('..') || relativePath.includes('..')) {
      throw new NotFoundException('Path not found');
    }
    return fullPath;
  }

  private capitalizeName(name: string): string {
    return name
      .split(/[_-]+/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }

  private getPathForResponse(relativePath: string, itemName: string): string {
    const base = relativePath ? `/${relativePath}` : '';
    return `${base}/${itemName}`;
  }

  async getDocs(requestPath: string): Promise<DocResponse> {
    const normalizedRequest = (requestPath || '').replace(/^\//, '').trim();
    const fullPath = this.resolveDocsPath(normalizedRequest);
    const stats = await stat(fullPath).catch(() => null);

    if (!stats) {
      const filePath = `${fullPath}.md`;
      const fileStats = await stat(filePath).catch(() => null);
      if (fileStats?.isFile()) {
        const content = await readFile(filePath, 'utf-8');
        const pathForResponse = normalizedRequest
          ? `/${normalizedRequest}`
          : '';
        const nameFromPath = normalizedRequest.split('/').pop() || '';
        return {
          type: 'file',
          name: this.capitalizeName(nameFromPath),
          path: pathForResponse,
          content,
        };
      }
      throw new NotFoundException('Path not found');
    }

    if (stats.isFile()) {
      const content = await readFile(fullPath, 'utf-8');
      const pathForResponse = normalizedRequest
        ? `/${normalizedRequest}`.replace(/\.md$/, '')
        : '';
      const nameFromPath =
        normalizedRequest.split('/').pop()?.replace(/\.md$/, '') || '';
      return {
        type: 'file',
        name: this.capitalizeName(nameFromPath),
        path: pathForResponse,
        content,
      };
    }

    if (stats.isDirectory()) {
      const entries = await readdir(fullPath, { withFileTypes: true });
      const normalizedRequestPath = normalizedRequest;
      const readmePath = join(fullPath, README_FILE);
      let content = '';
      try {
        content = await readFile(readmePath, 'utf-8');
      } catch {
        content = '';
      }

      const children: DocChild[] = [];
      const dirs = entries.filter((e) => e.isDirectory()).sort();
      const files = entries
        .filter(
          (e) => e.isFile() && e.name.endsWith('.md') && e.name !== README_FILE,
        )
        .sort((a, b) => a.name.localeCompare(b.name));

      for (const dir of dirs) {
        children.push({
          name: this.capitalizeName(dir.name),
          type: 'directory',
          path: this.getPathForResponse(normalizedRequestPath, dir.name),
        });
      }

      for (const file of files) {
        const nameWithoutExt = file.name.replace(/\.md$/, '');
        children.push({
          name: this.capitalizeName(nameWithoutExt),
          type: 'file',
          path: this.getPathForResponse(normalizedRequestPath, nameWithoutExt),
        });
      }

      const pathForResponse = normalizedRequestPath
        ? `/${normalizedRequestPath}`
        : '/';
      const nameForResponse = normalizedRequestPath
        ? this.capitalizeName(normalizedRequestPath.split('/').pop() || '')
        : '';

      return {
        type: 'directory',
        name: nameForResponse,
        path: pathForResponse,
        content,
        children,
      };
    }

    throw new NotFoundException('Path not found');
  }

  async searchDocs(query: string): Promise<DocSearchResponse> {
    const normalizedQuery = (query || '').trim().toLowerCase();
    if (!normalizedQuery) {
      return { results: [] };
    }

    const results: DocSearchResult[] = [];
    await this.walkAndSearch(DOCS_BASE_PATH, '', results, normalizedQuery);
    return { results };
  }

  private async walkAndSearch(
    dirPath: string,
    relativePath: string,
    results: DocSearchResult[],
    query: string,
  ): Promise<void> {
    const entries = await readdir(dirPath, { withFileTypes: true }).catch(
      () => [],
    );

    for (const entry of entries) {
      const entryRelativePath = relativePath
        ? `${relativePath}/${entry.name}`
        : entry.name;

      if (entry.isDirectory()) {
        if (entry.name.toLowerCase().includes(query)) {
          const readmePath = join(dirPath, entry.name, README_FILE);
          let snippet = '';
          try {
            const content = await readFile(readmePath, 'utf-8');
            snippet = content.split('\n')[0] || '';
          } catch {
            snippet = '';
          }
          const pathForResponse = `/${entryRelativePath.replace(/\/README\.md$/, '')}`;
          results.push({
            path: pathForResponse,
            name: this.capitalizeName(entry.name),
            line: 1,
            snippet,
          });
        }
        await this.walkAndSearch(
          join(dirPath, entry.name),
          entryRelativePath,
          results,
          query,
        );
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const fullPath = join(dirPath, entry.name);
        const content = await readFile(fullPath, 'utf-8').catch(() => '');
        const pathForResponse = `/${entryRelativePath.replace(/\.md$/, '')}`;
        const nameWithoutExt = entry.name.replace(/\.md$/, '');
        const nameMatches = nameWithoutExt.toLowerCase().includes(query);
        const lines = content.split('\n');

        if (nameMatches) {
          const firstLine = lines[0] || '';
          results.push({
            path: pathForResponse,
            name: this.capitalizeName(nameWithoutExt),
            line: 1,
            snippet: firstLine,
          });
        }

        for (let i = 0; i < lines.length; i++) {
          if (
            lines[i].toLowerCase().includes(query) &&
            (!nameMatches || i > 0)
          ) {
            results.push({
              path: pathForResponse,
              name: this.capitalizeName(nameWithoutExt),
              line: i + 1,
              snippet: lines[i],
            });
          }
        }
      }
    }
  }
}
