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
    console.log("Incoming Vote Request:", body); // ✅ Debugging

    const result = await action({
      params: body,
      schema: CreateVoteSchema,
      authorize: true,
    });

    if (result instanceof Error) {
      console.error("Validation Error:", result); // ✅ Log validation errors
      return handleError(result, "api");
    }

      const { params, session } = result;
      console.log("Validated Params:", params);

    if (!session || !session.user || !session.user.id) {
      console.error("Unauthorized request. Session:", session); // ✅ Log session info
      return handleError(new UnauthorizedError(), "api");
    }

    const userId = session.user.id;
    console.log("User ID:", userId); // ✅ Confirm user ID

    await dbConnect();

    const existingVote = await Vote.findOne({
      author: userId,
      actionId: params.targetId,
      actionType: params.targetType,
    });

    if (existingVote) {
      if (existingVote.voteType === params.voteType) {
        await Vote.deleteOne({ _id: existingVote._id });
      } else {
        await Vote.findByIdAndUpdate(
          existingVote._id,
          { voteType: params.voteType },
          { new: true }
        );
      }
    } else {
      await Vote.create({
        author: userId,
        actionId: params.targetId,
        actionType: params.targetType,
        voteType: params.voteType,
      });
    }

    // Optimized vote count retrieval
    const [upvotes, downvotes] = await Promise.all([
      Vote.countDocuments({
        actionId: params.targetId,
        actionType: params.targetType,
        voteType: "upvote",
      }),
      Vote.countDocuments({
        actionId: params.targetId,
        actionType: params.targetType,
        voteType: "downvote",
      }),
    ]);

    console.log("Vote Count - Upvotes:", upvotes, "Downvotes:", downvotes); // ✅ Debug count

    return NextResponse.json({
      upvotes: upvotes ?? 0,
      downvotes: downvotes ?? 0,
      userVote: existingVote ? existingVote.voteType : null,
    });
  } catch (error) {
    console.error("API Error:", error); // ✅ Debug unexpected errors
    return handleError(error, "api");
  }
}

