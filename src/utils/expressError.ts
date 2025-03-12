class ExpressError extends Error {
  // Custom error class to handle errors in the application
  constructor(message: string, public statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
  }
}

export default ExpressError;
