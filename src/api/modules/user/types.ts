export interface UserLoginRequest {
  password: string
  uid: number
}

export interface UserLoginResponse {
  id: number
  need_update: boolean
  token: string
  user_type: string
}

export interface UserUpdatePasswordRequest {
  new_password: string
  old_password: string
}

export interface UserUpdatePasswordResponse {
  token: string
}
