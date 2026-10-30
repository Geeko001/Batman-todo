import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

// Windows treats `#` in an absolute path as a URL fragment. Resolve relative
// source imports to their on-disk path before Rollup generates module URLs.
function resolveRelativeFilesPlugin() {
  return {
    name: 'resolve-relative-files',
    resolveId(source: string, importer: string | undefined) {
      if (!importer || !source.startsWith('.')) return null;
      const directory = path.dirname(importer);
      const candidates = [
        path.resolve(directory, source),
        path.resolve(directory, `${source}.ts`),
        path.resolve(directory, `${source}.tsx`),
        path.resolve(directory, `${source}.js`),
        path.resolve(directory, `${source}/index.ts`),
        path.resolve(directory, `${source}/index.tsx`),
      ];

      return candidates.find(candidate => fs.existsSync(candidate) && !fs.statSync(candidate).isDirectory()) ?? null;
    }
  };
}

export default defineConfig({
  plugins: [resolveRelativeFilesPlugin(), react()],
  server: {
    port: 3000,
    host: true
  }
});
