import { GetServerSidePropsContext } from 'next';
import { vi, beforeEach, afterEach } from 'vitest';
import { safeSSR } from './safeSSR';

const ctx = (overrides: Partial<GetServerSidePropsContext> = {}) =>
  ({
    resolvedUrl: '/test',
    ...overrides,
  } as GetServerSidePropsContext);

describe('safeSSR', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('passes through the handler result on success', async () => {
    const handler = safeSSR<{ value: number }>(async () => ({
      props: { value: 42 },
    }));

    const result = await handler(ctx());

    expect(result).toEqual({ props: { value: 42 } });
  });

  it('returns notFound and logs when the handler throws', async () => {
    const handler = safeSSR(async () => {
      throw new Error('backend down');
    });

    const result = await handler(ctx({ resolvedUrl: '/my-activities' }));

    expect(result).toEqual({ notFound: true });
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('/my-activities'),
      expect.any(Error),
    );
  });

  it('passes through redirects and notFound results from the handler', async () => {
    const handler = safeSSR(async () => ({ notFound: true }));

    const result = await handler(ctx());

    expect(result).toEqual({ notFound: true });
  });
});
