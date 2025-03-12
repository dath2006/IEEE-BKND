import dotenv from "dotenv";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";
import ExpressError from "./utils/expressError";
import studentRoutes from "./routes/studentRoute";
import teacherRoutes from "./routes/teacherRoute";
import logger from "./utils/logger"; // Logger for logging messages
import { configureSecurityMiddleware } from "./middlewares/security";
import cluster from "cluster";
import os from "os";

// Load environment variables
dotenv.config();

// Running multiple instances of the server to handle load
// It is not auto scalable, but it is a simple way to handle load
// If the process is the primary, fork workers for each CPU core
if (cluster.isPrimary) {
  // Get the number of available CPU cores
  const numCPUs = os.cpus().length;

  // Fork workers for each CPU core
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    logger.info(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  const app = express();

  // Security middleware
  configureSecurityMiddleware(app);

  // Basic middleware
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "../src/views"));
  app.use(express.static(path.join(__dirname, "../src/public")));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Database connection with retry logic
  const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI as string, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      logger.info("Connected to MongoDB");
    } catch (err) {
      logger.error("MongoDB connection error:", err);
      setTimeout(connectDB, 5000); // Retry after 5 seconds
    }
  };

  connectDB();

  // Routes
  app.get("/", (req, res) => {
    res.render("index");
  });

  app.use("/student", studentRoutes);
  app.use("/teacher", teacherRoutes);

  // Error handling
  app.get("*", (req, res, next) => {
    next(new ExpressError("Page not found", 404));
  });

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error("Error:", {
      status: err.statusCode || 500,
      message: err.message,
      stack: err.stack,
    });

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      message: err.message || "Internal Server Error",
      status: "error",
      ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
    });
  });

  // Graceful shutdown to ensure all connections are closed
  process.on("SIGINT", () => {
    logger.info("SIGINT received. Shutting down gracefully...");
    app.listen().close(() => {
      logger.info("Server closed");
      mongoose.connection
        .close()
        .then(() => {
          logger.info("MongoDB connection closed");
          process.exit(0);
        })
        .catch((err) => {
          logger.error("Error closing MongoDB connection:", err);
          process.exit(1);
        });
    });
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    logger.info(
      `Worker ${process.pid} started. Server is running on port ${PORT}`
    );
  });
}
