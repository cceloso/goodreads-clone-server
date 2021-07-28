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

    // sendErrorMessage: (errorCode, errorMessage) => {
    //     res.status(errorCode).json(errorMessage);
    // }
};

module.exports = controller;