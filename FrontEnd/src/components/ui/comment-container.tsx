import apiClient from "@/lib/apiClient";
import { Comment, PaginationData } from "@/types";
import { ChevronDown, ChevronUp, MessageSquare, ThumbsDown, ThumbsUp } from "lucide-react";
import { FC, useState } from "react";
import Swal from "sweetalert2";
import { CommentInput } from "./comment-input";
import { ReplyList } from "./reply-list";



interface CommentProps {
    comment: Comment;
    onLike: (id: string,isReply?: boolean) => void;
    onDislike: (id: string, isReply?: boolean) => void;
    onReplySubmit: (commentId: string, content: string) => Promise<void>;
    isSubmitting: boolean;
}
export const CommentContainer: FC<CommentProps> = ({ comment, onLike, onDislike, onReplySubmit, isSubmitting }) => {
    const [replyContent, setReplyContent] = useState("");
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [replyPage, setReplyPage] = useState(1);
    const [replyLastPage, setReplyLastPage] = useState(1);
    const [isFetchingReplies, setIsFetchingReplies] = useState(false);
  
    const fetchReplies = async (page: number) => {
      try {
        setIsFetchingReplies(true);
        const response = await apiClient.get(`/api/v1/comments/${comment.id}/replies?page=${page}`);
        const pagination = response.data.data;
        const replies = pagination.data.map((reply : any) => ({
          id: reply.id,
          body: reply.body,
          user: {
            id: reply.user.id,
            name: reply.user.name,
          },
          created_at: reply.created_at,
          likes: reply.likes_count,
          dislikes: reply.dislikes_count,
          reaction: reply.user_reaction ? Boolean(reply.user_reaction.value) : null,
        }));
        comment.replies = page === 1 ? replies : [...comment.replies, ...replies];
        setReplyPage(pagination.current_page);
        setReplyLastPage(pagination.last_page);
      } catch (err: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load replies. Please try again.",
        });
      } finally {
        setIsFetchingReplies(false);
      }
    };
  
    const handleShowReplies = () => {
      if (!showReplies) {
        fetchReplies(1);
      }
      setShowReplies(!showReplies);
    };
  
    const handleShowMoreReplies = () => {
      if (replyPage < replyLastPage) {
        fetchReplies(replyPage + 1);
      }
    };
  
    const handleReplySubmit = async () => {
      await onReplySubmit(comment.id, replyContent);
      setReplyContent("");
      setShowReplyInput(false);
      if (!showReplies) {
        handleShowReplies();
      } else {
        fetchReplies(1);
      }
    };
  
    return (
      <li className="border-b border-gray-200 pb-4">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-800">{comment.user.name}</span>
              <span className="text-sm text-gray-500">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-700 mt-1">{comment.body}</p>
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={() => onLike(comment.id)}
                className={`flex items-center gap-1  hover:text-blue-500 ${comment.reaction ? 'text-blue-500': 'text-gray-500'}`}
              >
                <ThumbsUp size={16} />
                <span>{comment.likes}</span>
              </button>
              <button
                onClick={() => onDislike(comment.id)}
                className={`flex items-center gap-1 text-gray-500 hover:text-red-500 ${comment.reaction === false ? '!text-red-500': null}`}
              >
                <ThumbsDown size={16} />
                <span>{comment.dislikes}</span>
              </button>
              <button
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="flex items-center gap-1 text-gray-500 hover:text-blue-500"
              >
                <MessageSquare size={16} />
                <span>Reply</span>
              </button>
              <button
                onClick={handleShowReplies}
                className="flex items-center gap-1 text-gray-500 hover:text-blue-500"
              >
                {showReplies ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                <span>{showReplies ? "Hide Replies" : "Show Replies"}</span>
              </button>
            </div>
            {showReplyInput && (
              <CommentInput
                value={replyContent}
                onChange={setReplyContent}
                onSubmit={handleReplySubmit}
                onCancel={() => setShowReplyInput(false)}
                placeholder="Add a reply..."
                isSubmitting={isSubmitting}
                submitLabel="Post Reply"
              />
            )}
            {showReplies && (
              <ReplyList
                commentId={comment.id}
                replies={comment.replies}
                isFetching={isFetchingReplies}
                currentPage={replyPage}
                lastPage={replyLastPage}
                onShowMore={handleShowMoreReplies}
                onLike={(id) => onLike(id,true)}
                onDislike={(id) => onDislike(id,true)}
              />
            )}
          </div>
        </div>
      </li>
    );
  };