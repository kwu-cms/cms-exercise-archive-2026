export function isPlyUrl(url: string): boolean {
  try {
    return new URL(url, window.location.origin).pathname.toLowerCase().endsWith('.ply');
  } catch {
    return url.toLowerCase().includes('.ply');
  }
}

export function isSpzUrl(url: string): boolean {
  try {
    return new URL(url, window.location.origin).pathname.toLowerCase().endsWith('.spz');
  } catch {
    return url.toLowerCase().includes('.spz');
  }
}

/** Gaussian Splatting PLY か Scaniverse 等の点群 PLY かをヘッダーで判別 */
export async function detectPlyKind(url: string): Promise<'gaussian' | 'pointcloud'> {
  try {
    const res = await fetch(url, { headers: { Range: 'bytes=0-4095' } });
    const text = res.ok ? await res.text() : await (await fetch(url)).text().then((t) => t.slice(0, 4096));
    return text.includes('scale_0') ? 'gaussian' : 'pointcloud';
  } catch {
    return 'pointcloud';
  }
}
