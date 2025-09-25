export class CustomError extends Error {
    errorInfo: {}
    constructor(message:string, errorInfo:{}){
        super(message);
        this.errorInfo = errorInfo;

        Object.setPrototypeOf(this, CustomError.prototype);
    }

}

export class DocumentNotFoundError extends Error {
    constructor(message:string){
        super(message);
        Object.setPrototypeOf(this, DocumentNotFoundError.prototype);
    }
}