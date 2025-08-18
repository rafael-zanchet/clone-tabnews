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
      status_code: this.statusCode,
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
      status_code: this.statusCode,
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
      status_code: this.statusCode,
      timestamp: new Date().toISOString(),
    };
  }
}

export class ValidationError extends Error {
  constructor({ cause, message, action }) {
    super(message || "Field not allowed", { cause });
    this.name = "ValidationError";
    this.action = action || "Verify data.";
    this.statusCode = 400;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      cause: this.cause ? this.cause.message : undefined,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class NotFoundError extends Error {
  constructor({ cause, message, action }) {
    super(message || "User not found", { cause });
    this.name = "NotFoundError";
    this.action = action || "Check the username and try again";
    this.statusCode = 404;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      cause: this.cause ? this.cause.message : undefined,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class UnauthorizedError extends Error {
  constructor({ cause, message, action }) {
    super(message || "Athentication failed", { cause });
    this.name = "UnauthorizedError";
    this.action = action || "Check data and try again";
    this.statusCode = 401;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      cause: this.cause ? this.cause.message : undefined,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}
