import { ActivityMetadata, PageTitle } from '@/components';
import { graphqlClient } from '@/graphql/apollo';
import { useAuth } from '@/hooks';
import {
  GetActivityQuery,
  GetActivityQueryVariables,
} from '@/graphql/generated/types';
import GetActivity from '@/graphql/queries/activity/getActivity';
import { safeSSR } from '@/utils';
import { Badge, Flex, Grid, Group, Image, Text } from '@mantine/core';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

interface ActivityDetailsProps {
  activity: GetActivityQuery['getActivity'];
}

export const getServerSideProps: GetServerSideProps<ActivityDetailsProps> =
  safeSSR<ActivityDetailsProps>(async ({ params, req }) => {
    if (!params?.id || Array.isArray(params.id)) return { notFound: true };
    const response = await graphqlClient.query<
      GetActivityQuery,
      GetActivityQueryVariables
    >({
      query: GetActivity,
      variables: { id: params.id },
      context: { headers: { Cookie: req.headers.cookie } },
    });
    return { props: { activity: response.data.getActivity } };
  });

export default function ActivityDetails({ activity }: ActivityDetailsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const showMetadata =
    user?.role === 'admin' && user?.debugModeEnabled && !!activity.createdAt;

  return (
    <>
      <Head>
        <title>{activity.name} | CDTR</title>
      </Head>
      <PageTitle title={activity.name} prevPath={router.back} />
      <Grid>
        <Grid.Col span={7}>
          <Image
            src="https://dummyimage.com/640x4:3"
            radius="md"
            alt="random image of city"
            width="100%"
            height="400"
          />
        </Grid.Col>
        <Grid.Col span={5}>
          <Flex direction="column" gap="md">
            <Group mt="md" mb="xs">
              <Badge color="pink" variant="light">
                {activity.city}
              </Badge>
              <Badge color="yellow" variant="light">
                {`${activity.price}€/j`}
              </Badge>
            </Group>
            <Text size="sm">{activity.description}</Text>
            {showMetadata && (
              <ActivityMetadata
                createdAt={activity.createdAt}
                owner={activity.owner}
              />
            )}
          </Flex>
        </Grid.Col>
      </Grid>
    </>
  );
}
