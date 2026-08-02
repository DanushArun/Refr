import { requestSteps } from './requestModel';

describe('request journey', () => {
  it('keeps the endorser, question, intro and sent states in order', () => {
    expect(requestSteps).toEqual(['endorser', 'question', 'intro', 'sent']);
  });
});
