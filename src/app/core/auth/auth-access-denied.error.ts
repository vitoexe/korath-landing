export class AuthAccessDeniedError extends Error {
  override readonly name = 'AuthAccessDeniedError';

  constructor(message = 'To konto nie ma dostępu. Logowanie tylko dla zaproszonych użytkowników.') {
    super(message);
  }
}
