export interface LoginData {
    // Usuario o email
    username: string
    password: string
}

export interface SignupData {
    name: string
    username: string
    email: string
    password: string
    confirmPassword: string
}

export type SocialProvider = "github" | "google"
