import authConfig from "@config/auth";
import AppError from "@shared/errors/AppError";
import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

export default function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("JWT token is missing");
  }

  const [, token] = authHeader.split(" ");

  try {
    const decodedToken = verify(token, authConfig.jwt.secret);

    const { sub: id } = decodedToken;

    if (!id || typeof id !== "string") {
      throw new AppError("Invalid JWT token");
    }

    req.user = {
      id,
    };

    return next();
  } catch {
    throw new AppError("Invalid JWT token");
  }
}
