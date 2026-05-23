import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
} from 'amazon-cognito-identity-js'

const userPool = new CognitoUserPool({
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
})

export function signIn(
  email: string,
  password: string
): Promise<{ session?: CognitoUserSession; mfaRequired?: boolean; cognitoUser?: CognitoUser }> {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: userPool })
    const authDetails = new AuthenticationDetails({ Username: email, Password: password })
    user.authenticateUser(authDetails, {
      onSuccess: (session) => resolve({ session }),
      onFailure: (err) => reject(err),
      mfaRequired: () => resolve({ mfaRequired: true, cognitoUser: user }),
      mfaSetup: () => resolve({ mfaRequired: true, cognitoUser: user }),
    })
  })
}

export function confirmMfa(cognitoUser: CognitoUser, code: string): Promise<CognitoUserSession> {
  return new Promise((resolve, reject) => {
    cognitoUser.sendMFACode(code, {
      onSuccess: (session) => resolve(session),
      onFailure: (err) => reject(err),
    })
  })
}

export function signOut(): void {
  const user = userPool.getCurrentUser()
  if (user) user.signOut()
}

export function getValidToken(): Promise<string | null> {
  return new Promise((resolve) => {
    const user = userPool.getCurrentUser()
    if (!user) {
      resolve(null)
      return
    }
    user.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session?.isValid()) {
        resolve(null)
        return
      }
      resolve(session.getAccessToken().getJwtToken())
    })
  })
}

export function isAuthenticated(): Promise<boolean> {
  return getValidToken().then((token) => token !== null)
}
