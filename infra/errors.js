export class InternalServerError extends Error {
  constructor({ cause }) {
    super("Internal Error Occurred", { cause });
    this.name = "InternalServerError";
    this.action = "Call the support team";
    this.statusCode = 500;
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
