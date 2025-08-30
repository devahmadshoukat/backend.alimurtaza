import { Response } from "express";

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    details?: any;
    timestamp: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        pages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export class ApiResponseHandler {
    static success<T>(
        res: Response,
        data?: T,
        message: string = "Success",
        statusCode: number = 200
    ): Response<ApiResponse<T>> {
        const response: ApiResponse<T> = {
            success: true,
            message,
            data,
            timestamp: new Date().toISOString()
        };

        return res.status(statusCode).json(response);
    }

    static error(
        res: Response,
        error: string | Error,
        statusCode: number = 500,
        details?: any
    ): Response<ApiResponse> {
        const response: ApiResponse = {
            success: false,
            message: typeof error === "string" ? error : error.message,
            error: typeof error === "string" ? error : error.message,
            details,
            timestamp: new Date().toISOString()
        };

        return res.status(statusCode).json(response);
    }

    static validationError(
        res: Response,
        errors: Array<{ field: string; message: string }>
    ): Response<ApiResponse> {
        return this.error(
            res,
            "Validation Error",
            400,
            { validationErrors: errors }
        );
    }

    static notFound(
        res: Response,
        resource: string = "Resource"
    ): Response<ApiResponse> {
        return this.error(res, `${resource} not found`, 404);
    }

    static unauthorized(
        res: Response,
        message: string = "Unauthorized"
    ): Response<ApiResponse> {
        return this.error(res, message, 401);
    }

    static forbidden(
        res: Response,
        message: string = "Forbidden"
    ): Response<ApiResponse> {
        return this.error(res, message, 403);
    }

    static conflict(
        res: Response,
        message: string = "Conflict"
    ): Response<ApiResponse> {
        return this.error(res, message, 409);
    }

    static withPagination<T>(
        res: Response,
        data: T,
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
            hasNext: boolean;
            hasPrev: boolean;
        },
        message: string = "Success"
    ): Response<ApiResponse<T>> {
        const response: ApiResponse<T> = {
            success: true,
            message,
            data,
            pagination,
            timestamp: new Date().toISOString()
        };

        return res.status(200).json(response);
    }
}

export const handleMongoError = (error: any): { message: string; statusCode: number } => {
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
