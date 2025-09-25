export enum IAccountType {
    Debit = "Debit",
    Credit = "Credit"
};

export enum IStatus {
    Pending, 
    Completed,
    Cancelled,
    Failed
}

export interface Filter {
    field: string,
    value: any
}