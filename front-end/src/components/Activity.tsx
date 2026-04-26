import { ActivityFragment } from '@/graphql/generated/types';
import { useAuth } from '@/hooks';
import { useGlobalStyles } from '@/utils';
import { Badge, Button, Card, Grid, Group, Image, Text } from '@mantine/core';
import Link from 'next/link';
import { ActivityMetadata } from './ActivityMetadata';
import { BookmarkButton } from './BookmarkButton';

interface ActivityProps {
  activity: ActivityFragment;
}

export function Activity({ activity }: ActivityProps) {
  const { classes } = useGlobalStyles();
  const { user } = useAuth();
  const showMetadata =
    user?.role === 'admin' && user?.debugModeEnabled && !!activity.createdAt;

  return (
    <Grid.Col span={4}>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section>
          <Image
            src="https://dummyimage.com/480x4:3"
            height={160}
            alt="random image of city"
          />
        </Card.Section>

        <Group position="apart" mt="md" mb="xs" noWrap>
          <Text weight={500} className={classes.ellipsis}>
            {activity.name}
          </Text>
          <BookmarkButton activityId={activity.id} />
        </Group>

        <Group mt="md" mb="xs">
          <Badge color="pink" variant="light">
            {activity.city}
          </Badge>
          <Badge color="yellow" variant="light">
            {`${activity.price}€/j`}
          </Badge>
        </Group>

        <Text size="sm" color="dimmed" className={classes.ellipsis}>
          {activity.description}
        </Text>

        {showMetadata && (
          <ActivityMetadata
            createdAt={activity.createdAt}
            owner={activity.owner}
          />
        )}

        <Link href={`/activities/${activity.id}`} className={classes.link}>
          <Button variant="light" color="blue" fullWidth mt="md" radius="md">
            Voir plus
          </Button>
        </Link>
      </Card>
    </Grid.Col>
  );
}
