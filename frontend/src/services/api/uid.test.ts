describe('uid', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('test_uid_when_module_reloads_same_millisecond_expected_unique_ids', () => {
    jest.spyOn(Date, 'now').mockReturnValue(1783513925489);
    let first = '';
    let second = '';

    jest.isolateModules(() => {
      first = require('./uid').uid('msg-demo');
    });
    jest.isolateModules(() => {
      second = require('./uid').uid('msg-demo');
    });

    expect(first).not.toBe(second);
  });
});
