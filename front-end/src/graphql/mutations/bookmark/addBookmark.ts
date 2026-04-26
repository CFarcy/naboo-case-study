import ActivityFragment from '@/graphql/fragments/activity';
import gql from 'graphql-tag';

const AddBookmark = gql`
  mutation AddBookmark($activityId: ID!) {
    addBookmark(activityId: $activityId) {
      id
      bookmarks {
        ...Activity
      }
    }
  }
  ${ActivityFragment}
`;

export default AddBookmark;
