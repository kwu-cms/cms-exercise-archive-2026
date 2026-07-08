import { describe, expect, it } from 'vitest';
import { formatKonanWuSnippet, roundMapViewState } from '../src/lib/art-archive/map-view-debug';

describe('map view debug', () => {
  it('formats copy-paste snippet for map-config.ts', () => {
    const snippet = formatKonanWuSnippet({
      lng: 135.2875634123,
      lat: 34.7345298123,
      zoom: 17.51234,
      pitch: 0.04,
      bearing: -27.18,
    });

    expect(snippet).toContain('lng: 135.287563');
    expect(snippet).toContain('lat: 34.73453');
    expect(snippet).toContain('zoom: 17.51');
    expect(snippet).toContain('bearing: -27.2');
    expect(snippet).toContain('export const KONAN_WU');
  });

  it('rounds map view values', () => {
    expect(
      roundMapViewState({
        lng: 1.23456789,
        lat: 2.34567891,
        zoom: 18.999,
        pitch: 0,
        bearing: 359.96,
      }),
    ).toEqual({
      lng: 1.234568,
      lat: 2.345679,
      zoom: 19,
      pitch: 0,
      bearing: 360,
    });
  });
});
