export class CustomError extends Error{
    constructor(message){
        super(message);
        this.name='CustomError';
    }
}

export class NetworkError extends CustomError{
    constructor(message){
        super(message);
        this.name='NetworkError';
    }
}

export class ValidationError extends CustomError{
    constructor(message){
        super(message);
        this.name='ValidationError';
    }
}

export class AuthenticationError extends CustomError{
    constructor(message){
        super(message);
        this.name='AuthenticationError';
    }
}