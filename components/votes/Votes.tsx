"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import { useState } from "react";

import { toast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/utils";

interface Params {
  upvotes: number;
  hasupVoted: boolean;
  downvotes: number;
  hasdownVoted: boolean;
}

const Votes = ({ upvotes, downvotes, hasupVoted, hasdownVoted }: Params) => {
  const session = useSession();
  const userId = session.data?.user?.id;

  // Local state for votes
  const [localUpvotes, setLocalUpvotes] = useState(upvotes);
  const [localDownvotes, setLocalDownvotes] = useState(downvotes);
  const [localHasUpvoted, setLocalHasUpvoted] = useState(hasupVoted);
  const [localHasDownvoted, setLocalHasDownvoted] = useState(hasdownVoted);
  const [isLoading, setIsLoading] = useState(false);

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (!userId) {
      return toast({
        title: "Please login to vote",
        description: "Only logged-in users can vote.",
      });
    }

    setIsLoading(true);

    try {
      if (voteType === "upvote") {
        if (localHasUpvoted) {
          // Remove upvote
          setLocalUpvotes(Math.max(0, localUpvotes - 1));
          setLocalHasUpvoted(false);
        } else {
          // Add upvote
          setLocalUpvotes(localUpvotes + 1);
          setLocalHasUpvoted(true);

          // Remove downvote if previously downvoted
          if (localHasDownvoted) {
            setLocalDownvotes(Math.max(0, localDownvotes - 1));
            setLocalHasDownvoted(false);
          }
        }
      } else {
        if (localHasDownvoted) {
          // Remove downvote
          setLocalDownvotes(Math.max(0, localDownvotes - 1));
          setLocalHasDownvoted(false);
        } else {
          // Add downvote
          setLocalDownvotes(localDownvotes + 1);
          setLocalHasDownvoted(true);

          // Remove upvote if previously upvoted
          if (localHasUpvoted) {
            setLocalUpvotes(Math.max(0, localUpvotes - 1));
            setLocalHasUpvoted(false);
          }
        }
      }

      // Simulate API call (Replace with actual API request)
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast({
        title: voteType === "upvote" ? "Upvote recorded" : "Downvote recorded",
        description: "Your vote has been updated.",
      });
    } catch {
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
          className={`cursor-pointer ${isLoading && "opacity-50"}`}
          aria-label="Upvote"
          onClick={() => !isLoading && handleVote("upvote")}
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
          className={`cursor-pointer ${isLoading && "opacity-50"}`}
          aria-label="Downvote"
          onClick={() => !isLoading && handleVote("downvote")}
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
