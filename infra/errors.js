export class InternalServerError extends Error {
  constructor({ cause, statusCode }) {
    super("Internal Error Occurred", { cause });
    this.name = "InternalServerError";
    this.action = "Call the support team";
    this.statusCode = statusCode || 500;
  }

  toJSON() {
    return {
      name: this.name,
      error: "Internal Server Error",
      message: this.message,
      cause: this.cause ? this.cause.message : undefined,
      action: this.action,
      statusCode: this.statusCode,
      timestamp: new Date().toISOString(),
    };
  }
}

export class MethodNotAllowedError extends Error {
  constructor() {
    super("The method POST is not allowed for this endpoint.");
    this.name = "MethodNotAllowedError";
    this.action = "Verify the request method and try again.";
    this.statusCode = 405;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      cause: this.cause ? this.cause.message : undefined,
      action: this.action,
      statusCode: this.statusCode,
    };
  }
}

export class ServiceError extends Error {
  constructor({ cause, message }) {
    super(message || "Service not available", { cause });
    this.name = "ServiceError";
    this.action = "Verify the service status and try again later.";
    this.statusCode = 503;
  }

  toJSON() {
    return {
      name: this.name,
      error: "Internal Server Error",
      message: this.message,
      cause: this.cause ? this.cause.message : undefined,
      action: this.action,
      statusCode: this.statusCode,
      timestamp: new Date().toISOString(),
    };
  }
}
