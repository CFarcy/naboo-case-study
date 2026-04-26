import {
  ActivityFragment,
  ReorderBookmarksMutation,
  ReorderBookmarksMutationVariables,
} from '@/graphql/generated/types';
import ReorderBookmarks from '@/graphql/mutations/bookmark/reorderBookmarks';
import { useAuth, useSnackbar } from '@/hooks';
import { useMutation } from '@apollo/client';
import {
  ActionIcon,
  Box,
  Button,
  Flex,
  Group,
  Stack,
  Text,
} from '@mantine/core';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  IconBookmarkOff,
  IconChevronDown,
  IconChevronUp,
  IconGripVertical,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BookmarkButton } from '../BookmarkButton';

interface BookmarkRowProps {
  activity: ActivityFragment;
  index: number;
  total: number;
  onMove: (from: number, to: number) => void;
}

function BookmarkRow({ activity, index, total, onMove }: BookmarkRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={(theme) => ({
        padding: theme.spacing.sm,
        borderRadius: theme.radius.md,
        border: `1px solid ${theme.colors.gray[3]}`,
        backgroundColor: theme.white,
      })}
    >
      <Flex align="center" gap="md">
        <ActionIcon
          {...attributes}
          {...listeners}
          variant="subtle"
          aria-label="Réordonner par glisser-déposer"
          sx={{ cursor: 'grab', touchAction: 'none' }}
        >
          <IconGripVertical size="1.125rem" />
        </ActionIcon>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Text weight={500}>{activity.name}</Text>
          <Text size="sm" color="dimmed">
            {activity.city} — {activity.price}€/j
          </Text>
        </Box>

        <Group spacing={4}>
          <ActionIcon
            variant="default"
            disabled={index === 0}
            onClick={() => onMove(index, index - 1)}
            aria-label="Monter"
          >
            <IconChevronUp size="1.125rem" />
          </ActionIcon>
          <ActionIcon
            variant="default"
            disabled={index === total - 1}
            onClick={() => onMove(index, index + 1)}
            aria-label="Descendre"
          >
            <IconChevronDown size="1.125rem" />
          </ActionIcon>
          <Link href={`/activities/${activity.id}`}>
            <Button variant="subtle" size="xs">
              Voir
            </Button>
          </Link>
          <BookmarkButton activityId={activity.id} />
        </Group>
      </Flex>
    </Box>
  );
}

export function BookmarksList() {
  const { user } = useAuth();
  const snackbar = useSnackbar();
  const [items, setItems] = useState<ActivityFragment[]>(
    user?.bookmarks ?? [],
  );

  const [reorderBookmarks] = useMutation<
    ReorderBookmarksMutation,
    ReorderBookmarksMutationVariables
  >(ReorderBookmarks);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    setItems(user?.bookmarks ?? []);
  }, [user?.bookmarks]);

  const persistOrder = async (next: ActivityFragment[]) => {
    const previous = items;
    setItems(next);
    try {
      await reorderBookmarks({
        variables: { orderedIds: next.map((b) => b.id) },
      });
    } catch {
      setItems(previous);
      snackbar.error('Une erreur est survenue');
    }
  };

  const handleMove = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    persistOrder(arrayMove(items, from, to));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = items.findIndex((b) => b.id === active.id);
    const to = items.findIndex((b) => b.id === over.id);
    if (from === -1 || to === -1) return;
    persistOrder(arrayMove(items, from, to));
  };

  if (items.length === 0) {
    return (
      <Flex direction="column" align="center" gap="sm" py="xl">
        <IconBookmarkOff size="2rem" />
        <Text color="dimmed">Vous n&apos;avez encore aucune activité en favori.</Text>
        <Link href="/discover">
          <Button variant="light">Découvrir des activités</Button>
        </Link>
      </Flex>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((b) => b.id)}
        strategy={verticalListSortingStrategy}
      >
        <Stack spacing="sm">
          {items.map((activity, index) => (
            <BookmarkRow
              key={activity.id}
              activity={activity}
              index={index}
              total={items.length}
              onMove={handleMove}
            />
          ))}
        </Stack>
      </SortableContext>
    </DndContext>
  );
}
