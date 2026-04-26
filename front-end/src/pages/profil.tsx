import { BookmarksList, PageTitle } from '@/components';
import { withAuth } from '@/hocs';
import { useAuth } from '@/hooks';
import { Avatar, Flex, Stack, Text, Title } from '@mantine/core';
import Head from 'next/head';

const Profile = () => {
  const { user } = useAuth();

  return (
    <>
      <Head>
        <title>Mon profil | CDTR</title>
      </Head>
      <PageTitle title="Mon profil" />
      <Stack spacing="xl">
        <Flex align="center" gap="md">
          <Avatar color="cyan" radius="xl" size="lg">
            {user?.firstName[0]}
            {user?.lastName[0]}
          </Avatar>
          <Flex direction="column">
            <Text>{user?.email}</Text>
            <Text>{user?.firstName}</Text>
            <Text>{user?.lastName}</Text>
          </Flex>
        </Flex>

        <Stack spacing="md">
          <Title order={3}>Mes favoris</Title>
          <BookmarksList />
        </Stack>
      </Stack>
    </>
  );
};

export default withAuth(Profile);
