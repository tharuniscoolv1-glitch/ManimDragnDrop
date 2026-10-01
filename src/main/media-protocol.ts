import { protocol, net } from 'electron';
import { pathToFileURL } from 'url';
import * as fs from 'fs';

export function registerMediaScheme(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'app',
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        stream: true,
        corsEnabled: true,
        bypassCSP: true
      }
    }
  ]);
}

export function setupMediaProtocol(): void {
  protocol.handle('app', (request) => {
    try {
      const parsedUrl = new URL(request.url);
      let targetPath = parsedUrl.searchParams.get('path');

      if (!targetPath) {
        // e.g. app://media/C:/Users/...
        const cleaned = decodeURIComponent(parsedUrl.pathname);
        targetPath = cleaned.replace(/^\/media\/?/, '');
        // On Windows if leading slash before drive letter like /C:/
        if (process.platform === 'win32' && /^\/[a-zA-Z]:/.test(targetPath)) {
          targetPath = targetPath.slice(1);
        }
      }

      if (!targetPath || !fs.existsSync(targetPath)) {
        return new Response('File not found', { status: 404 });
      }

      const fileUrl = pathToFileURL(targetPath).toString();
      return net.fetch(fileUrl, { bypassCustomProtocolHandlers: true });
    } catch (err: any) {
      console.error('Error handling app:// media request:', err);
      return new Response(`Error: ${err?.message || 'unknown'}`, { status: 500 });
    }
  });
}

export function getMediaUrl(localFilePath: string): string {
  return `app://media?path=${encodeURIComponent(localFilePath)}`;
}
