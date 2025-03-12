import winston from "winston";

// Logger for logging messages
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Log errors to a file
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    // Log all messages to a file
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

// If the environment is not production, add a console transport
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

export default logger;
