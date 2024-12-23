"use server";

import { Session } from "next-auth";
import { ZodError, ZodSchema } from "zod";

import { auth } from "@/auth";

import { UnauthorizedError, ValidationError } from "../http-errors";
import dbConnect from "../mongoose";


type ActionOptions<T> = {
  params?: T;
  schema?: ZodSchema<T>;
  authorize?: boolean;
};

type ActionResult<T> =
  | { params: T; session: Session | null }
  | ValidationError
  | Error
  | UnauthorizedError;

async function action<T>({
  params,
  schema,
  authorize = false,
}: ActionOptions<T>): Promise<ActionResult<T>> {
  if (schema && params) {
    try {
      schema.parse(params);
    } catch (error) {
      if (error instanceof ZodError) {
        return new ValidationError(
          error.flatten().fieldErrors as Record<string, string[]>
        );
      } else {
        return new Error("Schema validation failed");
      }
    }
  }

  if (!params) {
    return new Error("Params are required");
  }

  let session: Session | null = null;

  if (authorize) {
    session = await auth();

    if (!session) {
      return new UnauthorizedError();
    }
  }

  await dbConnect();

  return { params, session };
}

export default action;
