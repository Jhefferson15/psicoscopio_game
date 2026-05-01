export class LoginWithGoogleUseCase {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  async execute() {
    return await this.authRepository.loginWithGoogle();
  }
}

export class LogoutUseCase {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  async execute() {
    return await this.authRepository.logout();
  }
}

export class GetCurrentUserUseCase {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  async execute() {
    return await this.authRepository.getCurrentUser();
  }
}
