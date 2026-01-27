import { createLogger, format, transports } from "winston";
import fs from "node:fs";
import path from "node:path";

const globalForLogger = global as unknown as {
    logger: ReturnType<typeof createLogger> | undefined 
  };

const logger = globalForLogger.logger ?? createLogger({
  level: "debug",
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.printf(({ timestamp, level, message, stack }) => {
      return `${timestamp} ${level}: ${message}${stack ? `\n${stack}` : ''}`;
    })
  ),
  transports: [
    // Only use console transport in production (Vercel)
    new transports.Console({
      format: format.simple(),
    }),
  ],
});

// Only add file transports in development
if (process.env.NODE_ENV !== "production") {
  // const fs = require("fs");
  // const path = require("path");
  
  const logDir = path.join(process.cwd(), "logs");
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  logger.add(new transports.File({ filename: "logs/error.log", level: "error" }));
  logger.add(new transports.File({ filename: "logs/combined.log" }));
}

export default logger;