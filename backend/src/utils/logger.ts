type LogLevel = "debug" | "info" | "warn" | "error";

type Metadata = Record<string, unknown> | undefined;

interface Logger {
  debug(message: string, metadata?: Metadata): void;
  info(message: string, metadata?: Metadata): void;
  warn(message: string, metadata?: Metadata): void;
  error(message: string, metadata?: Metadata): void;
}

const writers: Record<LogLevel, (message?: unknown, ...optionalParams: unknown[]) => void> = {
  debug: console.debug.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console)
};

function write(level: LogLevel, serviceName: string, message: string, metadata?: Metadata): void {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${serviceName}] [${level.toUpperCase()}]`;

  if (metadata && Object.keys(metadata).length > 0) {
    writers[level](`${prefix} ${message}`, metadata);
    return;
  }

  writers[level](`${prefix} ${message}`);
}

export function createLogger(serviceName: string): Logger {
  return {
    debug: (message, metadata) => write("debug", serviceName, message, metadata),
    info: (message, metadata) => write("info", serviceName, message, metadata),
    warn: (message, metadata) => write("warn", serviceName, message, metadata),
    error: (message, metadata) => write("error", serviceName, message, metadata)
  };
}

export const logger = createLogger("metro-backend");

