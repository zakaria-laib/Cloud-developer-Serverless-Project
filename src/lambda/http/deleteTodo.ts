import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { deleteTodo } from '../../Logic/todos-controller';
import { createLogger } from '../../utils/logger';

const logger = createLogger('delete-Todo-Handler');

const deleteHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, ): Promise<APIGatewayProxyResult> => {
  // TODO: Remove a TODO item by id

  logger.info('Delete todo id', event);

  const todoId = event.pathParameters.todoId;
  const authorization = event.headers.Authorization;
  const split = authorization.split(' ');
  const jwtToken = split[1];

  await deleteTodo(todoId, jwtToken);
  return {
    statusCode: 204,
    body: 'Item deleted',
  };
};

export const handler = middy(deleteHandler).use(cors({ credentials: true }),);

