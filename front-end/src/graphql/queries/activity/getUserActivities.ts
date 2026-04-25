import ActivityFragment from '@/graphql/fragments/activity';
import gql from 'graphql-tag';

const GetUserActivities = gql`
  query GetUserActivities {
    getActivitiesByUser {
      ...Activity
    }
  }
  ${ActivityFragment}
`;

export default GetUserActivities;
