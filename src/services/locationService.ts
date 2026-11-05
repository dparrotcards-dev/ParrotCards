import { api } from './api';
import { ILocationResult } from '../types';

export const locationService = {
  async search(query: string): Promise<ILocationResult[]> {
    if (!query || query.trim().length < 2) return [];
    const res = await api.get('/locations/search', {
      params: { q: query },
    });
    return res.data.results || [];
  },
};
