import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";

export const validateRequest = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: "Validation Error",
                    details: (error as z.ZodError).issues.map((err: any) => ({
                        field: err.path.join("."),
                        message: err.message
                    }))
                });
            }
            next(error);
        }
    };
};

export const validateQuery = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.query);
            next();
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: "Query Validation Error",
                    details: (error as z.ZodError).issues.map((err: any) => ({
                        field: err.path.join("."),
                        message: err.message
                    }))
                });
            }
            next(error);
        }
    };
};

export const validateParams = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.params);
            next();
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: "Parameter Validation Error",
                    details: (error as z.ZodError).issues.map((err: any) => ({
                        field: err.path.join("."),
                        message: err.message
                    }))
                });
            }
            next(error);
        }
    };
};
