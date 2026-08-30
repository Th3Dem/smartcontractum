/**
 * Antigravity 2.0 — Типы и контракты аутентификации и онбординга
 */

export type AuthMode = 'login' | 'register' | 'forgot_password';
export type AccountType = 'individual' | 'organization';

export interface UserProfileDTO {
  id: string;
  email: string;
  accountType: AccountType;
  lastName?: string;
  firstName?: string;
  middleName?: string;
  phone?: string;
  companyName?: string;
  inn?: string;
  isVerified: boolean;
  reputationScore: number;
  roles: string[];
}

export interface AuthCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface IndividualRegisterPayload {
  userType: 'individual';
  lastName: string;
  firstName: string;
  middleName?: string;
  phone: string;
  email: string;
  password: string;
  passwordConfirm: string;
  agreement: boolean;
}

export interface OrganizationRegisterPayload {
  userType: 'organization';
  companyName: string;
  inn: string;
  representativeLastName: string;
  representativeFirstName: string;
  representativeMiddleName?: string;
  phone: string;
  email: string;
  password: string;
  passwordConfirm: string;
  agreement: boolean;
}

export type RegisterPayload = IndividualRegisterPayload | OrganizationRegisterPayload;

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: UserProfileDTO;
  error?: {
    code: string;
    message: string;
    field?: string;
  };
}

export interface PasswordStrength {
  score: number; // 0-4
  label: 'Слишком короткий' | 'Слабый' | 'Средний' | 'Надежный' | 'Отличный';
  color: string;
  suggestions: string[];
}
