import { GetServerSideProps } from 'next';

export function safeSSR<P extends { [key: string]: any }>(
  handler: GetServerSideProps<P>,
): GetServerSideProps<P> {
  return async (context) => {
    try {
      return await handler(context);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`[SSR] ${context.resolvedUrl} failed`, {
        params: context.params,
        query: context.query,
        error,
      });
      return { notFound: true };
    }
  };
}
