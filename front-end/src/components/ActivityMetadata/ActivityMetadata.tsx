import { Text } from '@mantine/core';

interface ActivityMetadataProps {
  createdAt: string;
  owner: { firstName: string; lastName: string };
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'long',
});

export function ActivityMetadata({ createdAt, owner }: ActivityMetadataProps) {
  const formattedDate = dateFormatter.format(new Date(createdAt));

  return (
    <Text size="xs" color="dimmed">
      {formattedDate} · par {owner.firstName} {owner.lastName}
    </Text>
  );
}
