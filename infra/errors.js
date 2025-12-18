export class InternalServerError extends Error {
  constructor({ cause, statusCode }) {
    super("Internal Error Occurred", { cause });
    this.name = "InternalServerError";
    this.action = "Call the support team";
    this.status_code = statusCode || 500;
  }

  toJSON() {
    return {
      name: this.name,
      error: "Internal Server Error",
      message: this.message,
      cause: this.cause ? this.cause.message : undefined,
      action: this.action,
      status_code: this.status_code,
      timestamp: new Date().toISOString(),
    };
  }
}

export class MethodNotAllowedError extends Error {
  constructor() {
    super("The method POST is not allowed for this endpoint.");
    this.name = "MethodNotAllowedError";
    this.action = "Verify the request method and try again.";
    this.status_code = 405;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      cause: this.cause ? this.cause.message : undefined,
      action: this.action,
      status_code: this.status_code,
    };
  }
}

export class ServiceError extends Error {
  constructor({ cause, message }) {
    super(message || "Service not available", { cause });
    this.name = "ServiceError";
    this.action = "Verify the service status and try again later.";
    this.status_code = 503;
  }

  toJSON() {
    return {
      name: this.name,
      error: "Internal Server Error",
      message: this.message,
      cause: this.cause ? this.cause.message : undefined,
      action: this.action,
      status_code: this.status_code,
      timestamp: new Date().toISOString(),
    };
  }
}

export class ValidationError extends Error {
  constructor({ cause, message, action }) {
    super(message || "Field not allowed", { cause });
    this.name = "ValidationError";
    this.action = action || "Verify data.";
    this.status_code = 400;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      cause: this.cause ? this.cause.message : undefined,
      action: this.action,
      status_code: this.status_code,
    };
  }
}

export class NotFoundError extends Error {
  constructor({ cause, message, action }) {
    super(message || "User not found", { cause });
    this.name = "NotFoundError";
    this.action = action || "Check the username and try again";
    this.status_code = 404;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      cause: this.cause ? this.cause.message : undefined,
      action: this.action,
      status_code: this.status_code,
    };
  }
}

export class UnauthorizedError extends Error {
  constructor({ cause, message, action }) {
    super(message || "Athentication failed", { cause });
    this.name = "UnauthorizedError";
    this.action = action || "Check data and try again";
    this.status_code = 401;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      cause: this.cause ? this.cause.message : undefined,
      action: this.action,
      status_code: this.status_code,
    };
  }
}

export class ForbiddenError extends Error {
  constructor({ cause, message, action }) {
    super(message || "Athentication failed", { cause });
    this.name = "ForbiddenError";
    this.action = action || "Check data and try again";
    this.status_code = 403;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      cause: this.cause ? this.cause.message : undefined,
      action: this.action,
      status_code: this.status_code,
    };
  }
}
