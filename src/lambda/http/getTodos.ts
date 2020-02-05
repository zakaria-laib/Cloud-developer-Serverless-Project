import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { getTodos } from '../../Logic/todos-controller';
import { createLogger } from '../../utils/logger';

const logger = createLogger('get-Todos-Handler');

const allHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, ): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user

  logger.info('Get todos', event);

  const authorization = event.headers.Authorization;
  const split = authorization.split(' ');
  const jwtToken = split[1];

  const items = await getTodos(jwtToken);

  return {
    statusCode: 200,
    body: JSON.stringify({
      items,
    }),
  };
}
export const handler = middy(allHandler).use(cors({ credentials: true }));
