import { describe, expect, it } from 'vitest';
import {
  ARTWORK_URL_PARAM,
  buildArtworkShareUrl,
  findArtworkByWorkId,
  getWorkIdFromSearch,
} from '../src/lib/art-archive/artwork-url-params';

describe('artwork url params', () => {
  it('reads work id from search string', () => {
    expect(getWorkIdFromSearch('?work=a225003')).toBe('a225003');
    expect(getWorkIdFromSearch('?foo=1')).toBeNull();
  });

  it('builds share url with work param', () => {
    expect(buildArtworkShareUrl('a225017', 'https://example.com/yao/')).toBe(
      'https://example.com/yao/?work=a225017',
    );
  });

  it('finds artwork by id', () => {
    const list = [{ id: 'a225003' }, { id: 'a225004' }];
    expect(findArtworkByWorkId(list, 'a225004')?.id).toBe('a225004');
    expect(findArtworkByWorkId(list, 'missing')).toBeNull();
  });

  it('uses work as param name', () => {
    expect(ARTWORK_URL_PARAM).toBe('work');
  });
});
