export const UserRoles = {
  admin: "admin",
  project_manager: "project_manager",
  member: "member",
} as const;

export type UserRoles = typeof UserRoles[keyof typeof UserRoles];
