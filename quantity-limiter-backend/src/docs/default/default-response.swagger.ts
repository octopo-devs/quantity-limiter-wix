export class BadRequestResponse {
  //@example 400
  statusCode: number;

  message?: string;

  //@example "Bad Request"
  error?: string;
}

export class NotFoundResponse {
  //@example 404
  statusCode: number;

  message?: string;

  //@example "Not Found"
  error?: string;
}

export class UnauthorizedResponse {
  //@example 401
  status: number;

  //@example Unauthorize
  message: string;
}

export class InternalServerErrorResponse {
  //@example 500
  statusCode: number;

  message?: string;

  //@example "Internal Server Error"
  error?: string;
}

export class UnprocessableEntityResponse {
  //@example 422
  statusCode: number;

  message?: string;

  //@example "Unprocessable Entity"
  error?: string;
}

export class DefaultResponse {
  //Response code
  code: number;

  //Response status message
  status?: string;

  //Optional message
  message?: string;
}

export class DefaultMetaResponse {
  pagination: {
    count: number;
    currentPage: number;
    links?: any;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export class DefaultPaginationResponse extends DefaultResponse {
  meta: DefaultMetaResponse;
}
