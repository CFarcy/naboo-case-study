import { PayloadDto } from './jwtPayload.dto';
import { GraphQLLoaders } from 'src/graphql/loaders';

export interface ContextWithJWTPayload {
  jwtPayload: PayloadDto;
  loaders: GraphQLLoaders;
  // Add other properties you expect in the context here
}
