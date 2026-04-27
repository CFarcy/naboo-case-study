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

  it('returns notFound and logs structured context when the handler throws', async () => {
    const error = new Error('backend down');
    const handler = safeSSR(async () => {
      throw error;
    });

    const result = await handler(
      ctx({
        resolvedUrl: '/explorer/Paris?activity=hike',
        params: { city: 'Paris' },
        query: { activity: 'hike' },
      }),
    );

    expect(result).toEqual({ notFound: true });
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('/explorer/Paris'),
      {
        params: { city: 'Paris' },
        query: { activity: 'hike' },
        error,
      },
    );
  });

  it('passes through redirects and notFound results from the handler', async () => {
    const handler = safeSSR(async () => ({ notFound: true }));

    const result = await handler(ctx());

    expect(result).toEqual({ notFound: true });
  });
});
