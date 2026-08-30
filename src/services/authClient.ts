import { AuthCredentials, AuthResponse, RegisterPayload, PasswordStrength } from '../types/auth';

/**
 * Валидатор надежности пароля
 */
export function calculatePasswordStrength(password: string): PasswordStrength {
  if (!password || password.length === 0) {
    return { score: 0, label: 'Слишком короткий', color: '#94A3B8', suggestions: ['Введите пароль'] };
  }

  let score = 0;
  const suggestions: string[] = [];

  if (password.length >= 8) score += 1;
  else suggestions.push('Минимум 8 символов');

  if (/[A-ZА-Я]/.test(password)) score += 1;
  else suggestions.push('Добавьте заглавную букву');

  if (/[0-9]/.test(password)) score += 1;
  else suggestions.push('Добавьте цифру');

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
  else suggestions.push('Добавьте спецсимвол (!@#$)');

  switch (score) {
    case 0:
    case 1:
      return { score, label: 'Слабый', color: '#EF4444', suggestions };
    case 2:
      return { score, label: 'Средний', color: '#F59E0B', suggestions };
    case 3:
      return { score, label: 'Надежный', color: '#10B981', suggestions };
    case 4:
    default:
      return { score: 4, label: 'Отличный', color: '#059669', suggestions: [] };
  }
}

/**
 * Валидатор ИНН юридического лица (10 цифр) или ИП (12 цифр)
 */
export function validateINN(inn: string): { isValid: boolean; error?: string } {
  const cleanInn = inn.trim();
  if (!/^\d+$/.test(cleanInn)) {
    return { isValid: false, error: 'ИНН должен содержать только цифры' };
  }
  if (cleanInn.length !== 10 && cleanInn.length !== 12) {
    return { isValid: false, error: 'ИНН организации должен содержать 10 цифр (для ИП — 12 цифр)' };
  }
  return { isValid: true };
}

/**
 * Валидатор Email
 */
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Клиент аутентификации (с поддержкой автономного mock-режима)
 */
export class AuthClient {
  private static mockDelay = 400;

  static async login(credentials: AuthCredentials): Promise<AuthResponse> {
    await new Promise(r => setTimeout(r, this.mockDelay));

    if (!validateEmail(credentials.email)) {
      return {
        success: false,
        error: { code: 'AUTH_INVALID_EMAIL', message: 'Введите корректный email адрес' }
      };
    }

    if (!credentials.password || credentials.password.length < 6) {
      return {
        success: false,
        error: { code: 'AUTH_INVALID_CREDENTIALS', message: 'Неверный email или пароль' }
      };
    }

    return {
      success: true,
      token: 'jwt_mock_token_' + Date.now(),
      user: {
        id: 'usr_mock_001',
        email: credentials.email,
        accountType: 'individual',
        fullName: 'Александр Смирнов',
        isVerified: true,
        reputationScore: 120,
        roles: ['smart_contract_developer']
      }
    };
  }

  static async register(payload: RegisterPayload): Promise<AuthResponse> {
    await new Promise(r => setTimeout(r, this.mockDelay));

    if (!validateEmail(payload.email)) {
      return {
        success: false,
        error: { code: 'AUTH_INVALID_EMAIL', message: 'Некорректный формат email' }
      };
    }

    if (!payload.agreement) {
      return {
        success: false,
        error: { code: 'AUTH_AGREEMENT_REQUIRED', message: 'Необходимо подтвердить согласие с условиями' }
      };
    }

    if (payload.userType === 'organization') {
      const innCheck = validateINN(payload.inn);
      if (!innCheck.isValid) {
        return {
          success: false,
          error: { code: 'AUTH_INVALID_INN', message: innCheck.error || 'Неверный ИНН' }
        };
      }
    }

    return {
      success: true,
      user: {
        id: 'usr_' + Date.now(),
        email: payload.email,
        accountType: payload.userType,
        fullName: payload.userType === 'individual' ? payload.fullName : payload.representativeName,
        companyName: payload.userType === 'organization' ? payload.companyName : undefined,
        inn: payload.userType === 'organization' ? payload.inn : undefined,
        isVerified: false,
        reputationScore: 0,
        roles: [payload.userType === 'organization' ? 'organization_member' : 'individual_user']
      }
    };
  }

  static async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    await new Promise(r => setTimeout(r, this.mockDelay));
    if (!validateEmail(email)) {
      throw new Error('Укажите корректный адрес электронной почты');
    }
    return {
      success: true,
      message: 'Инструкции по восстановлению пароля отправлены на указанный email'
    };
  }
}
