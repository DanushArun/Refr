import createClient from 'openapi-fetch';
import { BASE_URL } from '../baseUrl';
import type { paths } from './generated/endorsly';

export const apiClient = createClient<paths>({ baseUrl: BASE_URL });
