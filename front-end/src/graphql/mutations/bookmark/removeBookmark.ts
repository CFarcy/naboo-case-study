import ActivityFragment from '@/graphql/fragments/activity';
import gql from 'graphql-tag';

const RemoveBookmark = gql`
  mutation RemoveBookmark($activityId: ID!) {
    removeBookmark(activityId: $activityId) {
      id
      bookmarks {
        ...Activity
      }
    }
  }
  ${ActivityFragment}
`;

export default RemoveBookmark;
