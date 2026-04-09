export const ROLES = {
  ADMIN: "admin",
  EIGENAAR: "eigenaar",
  MONTEUR: "monteur",
  RECEPTIONIST: "receptionist",
  KLANT: "klant",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export type AppRoute =
  | "/dashboard/admin"
  | "/dashboard/mechanic"
  | "/dashboard/receptionist";

export const routeRoles: Record<AppRoute, Role[]> = {
  "/dashboard/admin": ["admin", "eigenaar"],
  "/dashboard/mechanic": ["monteur"],
  "/dashboard/receptionist": ["receptionist"],
};