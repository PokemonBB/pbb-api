export interface JwtPayload {
  sub: string;
  username: string;
  active: boolean;
  role: string;
}
