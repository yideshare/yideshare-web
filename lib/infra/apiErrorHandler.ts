import { NextResponse } from "next/server";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function withApiErrorHandler(
  handler: (req: Request) => Promise<Response>
) {
  return async function (req: Request) {
    try {
      return await handler(req);
    } catch (error) {
      console.error("API Error:", error);
      const status = error instanceof ApiError ? error.status : 500;

      return NextResponse.json(
        {
          error:
            error instanceof ApiError
              ? error.message
              : "An unexpected error occurred",
        },
        { status }
      );
    }
  };
}
