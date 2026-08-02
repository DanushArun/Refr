import { opportunityTabs, recommendedEndorser } from './opportunityModel';

describe('opportunity detail', () => {
  it('keeps the source tabs in overview, role, company, endorser order', () => {
    expect(opportunityTabs).toEqual(['overview', 'role', 'company', 'endorsers']);
  });

  it('carries the selected endorser into the request journey', () => {
    expect(recommendedEndorser.id).toBe('arjun-menon');
  });
});
