import ActivityFragment from '@/graphql/fragments/activity';
import gql from 'graphql-tag';

const ReorderBookmarks = gql`
  mutation ReorderBookmarks($orderedIds: [ID!]!) {
    reorderBookmarks(orderedIds: $orderedIds) {
      id
      bookmarks {
        ...Activity
      }
    }
  }
  ${ActivityFragment}
`;

export default ReorderBookmarks;
