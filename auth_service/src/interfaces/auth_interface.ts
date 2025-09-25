export interface IUser {
    firstname: string,
    lastname: string,
    username: string,
    email: string,
    password: string
    role?: Role
}

export interface ILogin {
    identifier: string 
    password: string
}

export enum Role {
    admin = "Admin",
    client = "Client"
}