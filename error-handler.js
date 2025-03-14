export class AppError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}

export const handleError = (error) => {
    console.error('Error:', error);
    
    if (error instanceof AppError) {
        return {
            message: error.message,
            code: error.code
        };
    }

    // Handle Firebase errors
    if (error.code) {
        switch (error.code) {
            case 'auth/user-not-found':
                return {
                    message: 'User not found',
                    code: 404
                };
            case 'auth/wrong-password':
                return {
                    message: 'Invalid credentials',
                    code: 401
                };
            // Add more error cases
            default:
                return {
                    message: 'An unexpected error occurred',
                    code: 500
                };
        }
    }

    return {
        message: 'Internal server error',
        code: 500
    };
}; 