import { NextResponse } from "next/server";

import Vote from "@/database/vote.model";
import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import { UnauthorizedError } from "@/lib/http-errors";
import dbConnect from "@/lib/mongoose";
import { CreateVoteSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Use action.ts for validation and authentication
    const result = await action({
      params: body,
      schema: CreateVoteSchema,
      authorize: true,
    });

    // Proper error handling
    if (result instanceof Error) {
      return handleError(result, "api");
    }

    const { params, session } = result;
    const { targetId, targetType, voteType } = params;

    // ✅ Explicitly check if session is null or missing user
    if (!session || !session.user || !session.user.id) {
      return handleError(new UnauthorizedError(), "api");
    }

    const userId = session.user.id;

    await dbConnect();

    const existingVote = await Vote.findOne({
      author: userId,
      actionId: targetId,
      actionType: targetType,
    });

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        await Vote.deleteOne({ _id: existingVote._id });
      } else {
        await Vote.findOneAndUpdate(
          { _id: existingVote._id },
          { voteType },
          { new: true }
        );
      }
    } else {
      await Vote.create({
        author: userId,
        actionId: targetId,
        actionType: targetType,
        voteType,
      });
    }

    // Use aggregation for optimized vote count
    const [upvotes, downvotes] = await Promise.all([
      Vote.countDocuments({
        actionId: targetId,
        actionType: targetType,
        voteType: "upvote",
      }),
      Vote.countDocuments({
        actionId: targetId,
        actionType: targetType,
        voteType: "downvote",
      }),
    ]);

    return NextResponse.json({ upvotes, downvotes, userVote: voteType });
  } catch (error) {
    return handleError(error, "api");
  }
}
