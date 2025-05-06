import { Reply } from "@/types";
import { ChevronDown, Loader2 } from "lucide-react";
import { FC } from "react";
import { ReplyContainer } from "./reply-container";


interface ReplyListProps {
    commentId: string;
    replies: Reply[];
    isFetching: boolean;
    currentPage: number;
    lastPage: number;
    onShowMore: () => void;
    onLike: (id: string) => void;
    onDislike: (id: string) => void;
}

export const ReplyList: FC<ReplyListProps> = ({
    commentId,
    replies,
    isFetching,
    currentPage,
    lastPage,
    onShowMore,
    onLike,
    onDislike,
  }) => (
    <div className="ml-8 mt-4">
      {isFetching && replies.length === 0 ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
      ) : replies.length === 0 ? (
        <p className="text-gray-500 text-sm">No replies yet.</p>
      ) : (
        <ul className="space-y-4">
          {replies.map((reply) => (
            <ReplyContainer key={reply.id} reply={reply} onLike={onLike} onDislike={onDislike} />
          ))}
        </ul>
      )}
      {currentPage < lastPage && (
        <button
          onClick={onShowMore}
          className="mt-2 flex items-center gap-2 text-blue-500 hover:text-blue-700"
        >
          {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown size={16} />}
          Show More Replies
        </button>
      )}
    </div>
);