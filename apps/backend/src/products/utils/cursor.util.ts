import { BadRequestException } from '@nestjs/common';
import { SORT_OPTIONS, SortOption } from '../types/sort-options.type';

export interface ProductCursor {
  sort: SortOption;
  sortValue: string;
  id: string;
}

export function encodeCursor(cursor: ProductCursor): string {
  const json = JSON.stringify(cursor);
  return Buffer.from(json, 'utf-8').toString('base64url');
}

export function decodeCursor(token: string): ProductCursor {
  try {
    const json = Buffer.from(token, 'base64url').toString('utf-8');
    const parsed: ProductCursor = JSON.parse(json);

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof parsed.sortValue !== 'string' ||
      typeof parsed.id !== 'string' ||
      !SORT_OPTIONS.includes(parsed.sort)
    ) {
      throw new Error('Malformed cursor shape');
    }

    return parsed;
  } catch {
    throw new BadRequestException('Invalid cursor');
  }
}
