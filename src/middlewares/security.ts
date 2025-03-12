import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import { Express, Request, Response, NextFunction } from "express";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";

// Create different rate limiters for different routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 login/register attempts per windowMs
  message: "Too many attempts from this IP, please try again after 15 minutes",
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});

export const configureSecurityMiddleware = (app: Express) => {
  // Basic security headers with strict CSP
  app.use(
    helmet({
      // Disable cross-origin embedder policy
      crossOriginEmbedderPolicy: false,
      // Disable cross-origin opener policy
      crossOriginOpenerPolicy: false,
      // Disable cross-origin resource policy
      crossOriginResourcePolicy: false,
    })
  );

  // CORS configuration
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "*",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      exposedHeaders: ["Content-Range", "X-Content-Range"],
      maxAge: 600, // 10 minutes
    })
  );

  // Prevent NoSQL injection
  app.use(mongoSanitize());

  // Prevent parameter pollution
  app.use(hpp());

  // Rate limiting for authentication routes
  app.use(
    [
      "/student/login",
      "/student/register",
      "/teacher/login",
      "/teacher/register",
    ],
    authLimiter
  );

  // General rate limiting for other routes
  app.use(["/student", "/teacher"], generalLimiter);

  // Add security headers
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");

    next();
  });
};
