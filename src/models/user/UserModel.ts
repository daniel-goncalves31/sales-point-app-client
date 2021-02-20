export enum UserRole {
  ADMIN_MASTER = 'Admin Master',
  ADMIN = 'Admin',
  EMPLOYEE = 'Employee'
}

export enum UserStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive'
}

export interface UserModel {
  id: string
  name: string
  username: string
  password?: string
  role: UserRole
  status: UserStatus
}
