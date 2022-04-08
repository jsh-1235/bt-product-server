const winston = require("winston");
const WinstonDaily = require("winston-daily-rotate-file");
const path = require("path");

const { combine, timestamp, printf, colorize } = winston.format;

const logDir = "logs";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

winston.addColors(colors);

const level = () => {
  const env = process.env.NODE_ENV || "development";
  const isDevelopment = env === "development";
  return isDevelopment ? "debug" : "http";
};

// Log Format
const logFormat = combine(
  timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  printf((info) => {
    if (info.stack) {
      return `${info.timestamp} ${info.level}: ${info.message} \n Error Stack: ${info.stack}`;
    }
    return `${info.timestamp} ${info.level}: ${info.message}`;
  })
);

const consoleOpts = {
  handleExceptions: true,
  level: process.env.NODE_ENV === "production" ? "error" : "debug",
  format: combine(colorize({ all: true }), timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" })),
};

const transports = [
  new winston.transports.Console(consoleOpts),
  // new WinstonDaily({
  //   level: "error",
  //   datePattern: "YYYY-MM-DD",
  //   dirname: path.join(__dirname, logDir, "/error"),
  //   filename: "%DATE%.error.log",
  //   maxFiles: 30,
  //   zippedArchive: true,
  // }),
  // // Set a file to store all level logs
  // new WinstonDaily({
  //   level: "debug",
  //   datePattern: "YYYY-MM-DD",
  //   dirname: path.join(__dirname, logDir, "/all"),
  //   filename: "%DATE%.all.log",
  //   maxFiles: 7,
  //   zippedArchive: true,
  // }),
];

const dataLogger = winston.createLogger({
  level: level(),
  levels,
  format: logFormat,
  transports,
});

const stream = {
  write: (message) => {
    dataLogger.info(message);
  },
};

module.exports = { dataLogger, stream };
