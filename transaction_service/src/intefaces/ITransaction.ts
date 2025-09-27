export enum IAccountType {
    Debit = "Debit",
    Credit = "Credit"
};

export enum IStatus {
    Pending = "Pending", 
    Completed = "Completed",
    Cancelled = "Cancelled",
    Failed = "Failed"
}

export interface Filter {
    field: string,
    value: any
}

export interface IAccount {
    userId: string,
    accountId: string,
    type: string
    balance: number;
}