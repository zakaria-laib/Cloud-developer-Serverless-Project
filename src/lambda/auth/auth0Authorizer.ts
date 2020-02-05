import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'
import * as middy from 'middy';

const logger = createLogger('auth')

const cert = `-----BEGIN CERTIFICATE-----
MIIDBzCCAe+gAwIBAgIJcp5G4xiJYcrFMA0GCSqGSIb3DQEBCwUAMCExHzAdBgNV
BAMTFmRldi1lZ214YXhrYS5hdXRoMC5jb20wHhcNMjAwMjAyMjIyNjQxWhcNMzMx
MDExMjIyNjQxWjAhMR8wHQYDVQQDExZkZXYtZWdteGF4a2EuYXV0aDAuY29tMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA9jr5mRy2EcNknnHTYeAmE7kV
dVolziqhxtrV3+oOj7VkjvbRD8hlEvNNZlej3MEoHEUfbybLxcuAOT0Hqu/eKyo2
Oj+O7UFUukpy8raCY7qqbQ+FkNzJR92sUhzY29X8VAsrgTg7NGUkFp6jnibepFS0
ahJko4yrb+HJWabVAhCtagufvMpbZK/hQb0dDcsjF5lT4m/1KtmiQJWfhocW46A7
+2OotCeIm5ZitkdWoqhVqlkz9OQXIUEGkKCi3Tc+T1MZwfhEmhTGxyu0cq24K6FA
gwyw1FD4E81QTAUJGjQM6OZwOJ6FExas/zINBSlMf8AEUHhgXoAUAw//kGucxQID
AQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSeTPz+q8nvHRkD3plN
AY4h3mQgJTAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAPTfGFCY
pBGkVlseERzeNX7f+a8NHdv0wiKR7Qm5h+LJKQJFK3TK6G7x/aDJhORbweQZSRrk
T+jLazYo0kauxdnnzD/SFodYq6e+RfjhmiDWsFR2UjBWU/TJpxm4Bmwzevk5PX1S
fMO+mB9w2fylX6aeqrzwl5na9TDe3WXwV9maKYkv3t2HIdgwNdkkENu/G+38o0II
SAvW2LZ/imkRATDFbF8Pe4gVBjd4NUkngJ3ZHHlm3DY+BLL7mkEtXfUkEQDymsoB
jhOWcilFr0B+D7qOSzeOodcaqDhi29b9kOKvQ4PFjvjALC3dPe8jTHKPjj9FSEcS
Zjg76nxGhDmE8LE=
-----END CERTIFICATE-----
`

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl = '...'

export const handler = middy(async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
})


async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return verify(token,cert, {algorithms: ['RS256']}) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
