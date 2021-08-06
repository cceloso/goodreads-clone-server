const controller = {
    createErrorMessage: (errorCode, errorMessage, errorStatus) => {
        return {
            error: {
                code: errorCode,
                message: errorMessage,
                status: errorStatus
            }
        };
    },

    sendData: (res, statusCode, statusMessage) => {
        res.status(statusCode).json(statusMessage);
    },

    sendError: (res, errorCode, errorMessage, errorStatus) => {
        res.status(errorCode).json({
            error: {
                code: errorCode,
                message: errorMessage,
                status: errorStatus
            }
        });
    }
};

module.exports = controller;