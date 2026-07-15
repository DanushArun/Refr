import { request } from './http';
import { opportunitiesApi } from './opportunities';

jest.mock('./http', () => ({
  request: jest.fn(),
}));

const requestMock = request as jest.MockedFunction<typeof request>;
type DetailApi = { get?: (id: string) => Promise<unknown> };

beforeEach(() => {
  requestMock.mockReset();
});

test('test_get_when_id_requires_encoding_expected_detail_endpoint', async () => {
  requestMock.mockResolvedValue({ data: {} });
  const get = (opportunitiesApi as DetailApi).get;

  if (get) await get('job/77');

  expect(requestMock).toHaveBeenCalledWith('/api/v1/opportunities/job%2F77/');
});

test('test_get_when_request_succeeds_expected_opportunity_payload', async () => {
  const payload = { id: 'opportunity-1' };
  requestMock.mockResolvedValue({ data: payload });
  const get = (opportunitiesApi as DetailApi).get;

  const result = get ? await get(payload.id) : undefined;

  expect(result).toBe(payload);
});
