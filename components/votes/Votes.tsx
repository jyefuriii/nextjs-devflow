"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import { useState } from "react";

import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { formatNumber } from "@/lib/utils";

interface Params {
  targetId: string;
  targetType: "question" | "answer";
  upvotes: number;
  hasupVoted: boolean;
  downvotes: number;
  hasdownVoted: boolean;
}

const Votes = ({
  targetId,
  targetType,
  upvotes,
  downvotes,
  hasupVoted,
  hasdownVoted,
}: Params) => {
  const { data: session, status } = useSession();
  const userId = session?.user?.id ?? null;

  const [localUpvotes, setLocalUpvotes] = useState(upvotes);
  const [localDownvotes, setLocalDownvotes] = useState(downvotes);
  const [localHasUpvoted, setLocalHasUpvoted] = useState(hasupVoted);
  const [localHasDownvoted, setLocalHasDownvoted] = useState(hasdownVoted);
  const [isLoading, setIsLoading] = useState(false);

  // Prevent vote action if session is still loading
  const isSessionLoading = status === "loading";

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (!userId) {
      return toast({
        title: "Please login to vote",
        description: "Only logged-in users can vote.",
      });
    }

    setIsLoading(true);

    try {
      const response = await api.votes.submitVote(
        targetId,
        targetType,
        voteType
      );

      // Ensure response is a valid object before type assertion
      if (!response || typeof response !== "object") {
        throw new Error("Invalid response from server");
      }

      // Explicitly cast response to the expected type
      const data = response as unknown as {
        upvotes: number;
        downvotes: number;
        userVote: "upvote" | "downvote" | null;
      };

      setLocalUpvotes(data.upvotes);
      setLocalDownvotes(data.downvotes);
      setLocalHasUpvoted(data.userVote === "upvote");
      setLocalHasDownvoted(data.userVote === "downvote");

      toast({
        title: voteType === "upvote" ? "Upvote recorded" : "Downvote recorded",
        description: "Your vote has been updated.",
      });
    } catch (error) {
      console.error("Vote error:", error);
      toast({
        title: "Failed to vote",
        description: "An error occurred while voting. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-center gap-2.5">
      <div className="flex-center gap-1.5">
        <Image
          src={localHasUpvoted ? "/icons/upvoted.svg" : "/icons/upvote.svg"}
          width={18}
          height={18}
          alt="upvote"
          className={`cursor-pointer ${isLoading || isSessionLoading ? "opacity-50" : ""}`}
          aria-label="Upvote"
          onClick={() =>
            !isLoading && !isSessionLoading && handleVote("upvote")
          }
        />

        <div className="flex-center background-light700_dark400 min-w-5 rounded-sm p-1">
          <p className="subtle-medium text-dark400_light900">
            {formatNumber(localUpvotes)}
          </p>
        </div>
      </div>

      <div className="flex-center gap-1.5">
        <Image
          src={
            localHasDownvoted ? "/icons/downvoted.svg" : "/icons/downvote.svg"
          }
          width={18}
          height={18}
          alt="downvote"
          className={`cursor-pointer ${isLoading || isSessionLoading ? "opacity-50" : ""}`}
          aria-label="Downvote"
          onClick={() =>
            !isLoading && !isSessionLoading && handleVote("downvote")
          }
        />

        <div className="flex-center background-light700_dark400 min-w-5 rounded-sm p-1">
          <p className="subtle-medium text-dark400_light900">
            {formatNumber(localDownvotes)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Votes;
