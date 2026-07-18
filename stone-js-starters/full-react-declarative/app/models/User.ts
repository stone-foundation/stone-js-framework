/**
 * User Interface
*/
export interface User {
  id: number
  name: string
  email: string
  avatar: string
  createdAt: number
}

/**
 * New User Interface
*/
export interface UserInput {
  name: string
  email: string
}

/**
 * User Login Interface
*/
export interface UserLogin {
  email: string
  password: string
}

/**
 * User Register Interface
*/
export interface UserRegister {
  name: string
  email: string
  password: string
  confirmPassword: string
}

/**
 * User Register Errors Type
*/
export type UserRegisterErrors = Record<string, string>

/**
 * User Change Password Interface
*/
export interface UserChangePassword {
  password: string
  newPassword: string
  confirmPassword: string
}

/**
 * User Token Interface
*/
export interface UserToken {
  scope: string
  stage: string
  createdAt: number
  expiresIn: number
  tokenType: string
  accessToken: string
}
