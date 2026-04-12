export interface LoginCredentials {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface JwtPayload {
  sub: string;
  role: "admin" | "recruiter";
  exp: number;
}

export interface User {
  username: string;
  role: "admin" | "recruiter";
}