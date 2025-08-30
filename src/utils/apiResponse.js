"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMongoError = exports.ApiResponseHandler = void 0;
class ApiResponseHandler {
    static success(res, data, message = "Success", statusCode = 200) {
        const response = {
            success: true,
            message,
            data,
            timestamp: new Date().toISOString()
        };
        return res.status(statusCode).json(response);
    }
    static error(res, error, statusCode = 500, details) {
        const response = {
            success: false,
            message: typeof error === "string" ? error : error.message,
            error: typeof error === "string" ? error : error.message,
            details,
            timestamp: new Date().toISOString()
        };
        return res.status(statusCode).json(response);
    }
    static validationError(res, errors) {
        return this.error(res, "Validation Error", 400, { validationErrors: errors });
    }
    static notFound(res, resource = "Resource") {
        return this.error(res, `${resource} not found`, 404);
    }
    static unauthorized(res, message = "Unauthorized") {
        return this.error(res, message, 401);
    }
    static forbidden(res, message = "Forbidden") {
        return this.error(res, message, 403);
    }
    static conflict(res, message = "Conflict") {
        return this.error(res, message, 409);
    }
    static withPagination(res, data, pagination, message = "Success") {
        const response = {
            success: true,
            message,
            data,
            pagination,
            timestamp: new Date().toISOString()
        };
        return res.status(200).json(response);
    }
}
exports.ApiResponseHandler = ApiResponseHandler;
const handleMongoError = (error) => {
    if (error.name === "ValidationError") {
        return {
            message: "Validation Error",
            statusCode: 400
        };
    }
    if (error.name === "CastError") {
        return {
            message: "Invalid ID format",
            statusCode: 400
        };
    }
    if (error.code === 11000) {
        return {
            message: "Duplicate entry - this resource already exists",
            statusCode: 409
        };
    }
    return {
        message: error.message || "Internal server error",
        statusCode: 500
    };
};
exports.handleMongoError = handleMongoError;
