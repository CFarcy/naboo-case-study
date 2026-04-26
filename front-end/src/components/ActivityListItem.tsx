import { ActivityFragment } from '@/graphql/generated/types';
import { useAuth } from '@/hooks';
import { useGlobalStyles } from '@/utils';
import { Box, Button, Flex, Group, Image, Text } from '@mantine/core';
import Link from 'next/link';
import { ActivityMetadata } from './ActivityMetadata';
import { BookmarkButton } from './BookmarkButton';

interface ActivityListItemProps {
  activity: ActivityFragment;
}

export function ActivityListItem({ activity }: ActivityListItemProps) {
  const { classes } = useGlobalStyles();
  const { user } = useAuth();
  const showMetadata =
    user?.role === 'admin' && user?.debugModeEnabled && !!activity.createdAt;

  return (
    <Flex align="center" justify="space-between">
      <Flex gap="md" align="center">
        <Image
          src="https://dummyimage.com/125"
          radius="md"
          alt="random image of city"
          height="125"
          width="125"
        />
        <Box sx={{ maxWidth: '300px' }}>
          <Text className={classes.ellipsis}>{activity.city}</Text>
          <Text className={classes.ellipsis}>{activity.name}</Text>
          <Text className={classes.ellipsis}>{activity.description}</Text>
          <Text
            weight="bold"
            className={classes.ellipsis}
          >{`${activity.price}€/j`}</Text>
          {showMetadata && (
            <ActivityMetadata
              createdAt={activity.createdAt}
              owner={activity.owner}
            />
          )}
        </Box>
      </Flex>
      <Group spacing="xs">
        <BookmarkButton activityId={activity.id} />
        <Link href={`/activities/${activity.id}`} className={classes.link}>
          <Button variant="outline" color="dark">
            Voir plus
          </Button>
        </Link>
      </Group>
    </Flex>
  );
}
