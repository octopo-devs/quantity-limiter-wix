import { DefaultPaginationResponse } from 'src/docs/default/default-response.swagger';
import { Collection } from '../entities/collection/collection.entity';

export class GetCollectionsResponse extends DefaultPaginationResponse {
  data: Collection[];
}
