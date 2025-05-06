import { Comment } from "@/types";
import { ChevronDown, Loader2 } from "lucide-react";
import { FC } from "react";
import { CommentContainer } from "./comment-container";


interface CommentListProps {
    comments: Comment[];
    isFetching: boolean;
    currentPage: number;
    lastPage: number;
    onShowMore: () => void;
    onLike: (id: string) => void;
    onDislike: (id: string) => void;
    onReplySubmit: (commentId: string, content: string) => Promise<void>;
    isSubmitting: boolean;
}
export const CommentList: FC<CommentListProps> = ({
    comments,
    isFetching,
    currentPage,
    lastPage,
    onShowMore,
    onLike,
    onDislike,
    onReplySubmit,
    isSubmitting,
  }) => (
    <>
      {isFetching && comments.length === 0 ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No comments yet.</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <CommentContainer
              key={comment.id}
              comment={comment}
              onLike={onLike}
              onDislike={onDislike}
              onReplySubmit={onReplySubmit}
              isSubmitting={isSubmitting}
            />
          ))}
        </ul>
      )}
      {currentPage < lastPage && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={onShowMore}
            className="flex items-center gap-2 px-4 py-2 text-blue-500 hover:text-blue-700"
          >
            {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown size={16} />}
            Show More
          </button>
        </div>
      )}
    </>
);
