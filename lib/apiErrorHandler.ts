import { NextResponse } from "next/server";

/**
 * Represents an API error with an associated HTTP status code.
 * Throw this within route handlers to return structured error responses.
 *
 * @param message - Human-readable error message returned to the client
 * @param status - HTTP status code, defaults to 400
 */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

/**
 * Wraps a route handler with centralized error handling.
 *
 * Catches any thrown errors and returns a structured JSON error response.
 * If the error is an {@link ApiError}, its status code is used; otherwise
 * defaults to 500. Non-Error throws are returned as a generic message.
 *
 * @param handler - The route handler function to wrap
 * @returns A new handler that catches and formats errors as JSON responses
 */
export function withApiErrorHandler(
  handler: (req: Request) => Promise<Response>
) {
  return async function (req: Request) {
    try {
      return await handler(req);
    } catch (error) {
      console.error("API Error:", error);

      var status_msg:number;
      var err_msg:string;

      if (error instanceof ApiError) {
        status_msg = error.status;
        err_msg = error.message;
      } else {
        status_msg = 500;
        err_msg = "An unexpected error occurred"
      }
      return NextResponse.json(
        {
          error: err_msg,
          status: status_msg
        }
      );
    }
  };
}
