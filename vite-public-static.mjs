import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MIME_TYPES = {
  '.json': 'application/json; charset=utf-8',
  '.spz': 'application/octet-stream',
  '.mp4': 'video/mp4',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

/**
 * Astro dev / preview で public（および preview 時の dist）静的ファイルを確実に配信する。
 * Dropbox 上のパス正規化などで Vite の public 配信が効かない場合のフォールバック。
 */
export function publicStaticPlugin(options = {}) {
  const rootDir = options.rootDir ?? fileURLToPath(new URL('.', import.meta.url));
  const publicDir = path.resolve(rootDir, options.publicDir ?? 'public');
  const previewDir = path.resolve(rootDir, options.previewDir ?? 'dist');

  function createMiddleware(staticRoot) {
    return function serveStatic(req, res, next) {
      if (!req.url || (req.method !== 'GET' && req.method !== 'HEAD')) return next();

      let pathname;
      try {
        pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      } catch {
        return next();
      }

      if (!pathname.startsWith('/')) return next();

      const filePath = path.normalize(path.join(staticRoot, pathname));
      if (!filePath.startsWith(staticRoot)) return next();
      if (!fs.existsSync(filePath)) return next();

      const stat = fs.statSync(filePath);
      if (!stat.isFile()) return next();

      const ext = path.extname(filePath).toLowerCase();
      const type = MIME_TYPES[ext];
      if (type) res.setHeader('Content-Type', type);

      res.statusCode = 200;
      if (req.method === 'HEAD') {
        res.end();
        return;
      }

      fs.createReadStream(filePath).pipe(res);
    };
  }

  return {
    name: 'serve-public-assets',
    configureServer(server) {
      server.middlewares.use(createMiddleware(publicDir));
    },
    configurePreviewServer(server) {
      server.middlewares.use(createMiddleware(previewDir));
    },
  };
}
