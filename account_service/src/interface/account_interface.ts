export enum IAccountType {
    Debit = "Debit",
    Credit = "Credit"
};

export interface AccountCreatedEvent {
    userId: string;
    createdAt: Date;
}