import apiClient from "@/lib/apiClient";
import { Comment, PaginationData, Reply } from "@/types";
import { FC, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { CommentInput } from "../ui/comment-input";
import { CommentList } from "../ui/CommentList";

interface CommentsSectionProps {
  videoId: string;
}


export const CommentsSection: FC<CommentsSectionProps> = ({ videoId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isFetchingComments, setIsFetchingComments] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = async (page: number) => {
    try {
      setIsFetchingComments(true);
      const response = await apiClient.get(`/api/v1/videos/${videoId}/comments?page=${page}`);
      const pagination: PaginationData = response.data.data;
      const newComments = pagination.data.map((comment) => ({
        id: comment.id,
        body: comment.body,
        user: {
          id: comment.user.id,
          name: comment.user.name,
        },
        created_at: comment.created_at,
        likes: comment.likes_count,
        dislikes: comment.dislikes_count,
        reaction: comment.user_reaction ? Boolean(comment.user_reaction.value) : null,
        replies: [],
      }));
      setComments((prev) => (page === 1 ? newComments : [...prev, ...newComments]));
      setCurrentPage(pagination.current_page);
      setLastPage(pagination.last_page);
    } catch (err: any) {
      console.error("Failed to fetch comments:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load comments. Please try again.",
      });
    } finally {
      setIsFetchingComments(false);
    }
  };

  useEffect(() => {
    fetchComments(1);
  }, [videoId]);

  const handleShowMoreComments = () => {
    if (currentPage < lastPage) {
      fetchComments(currentPage + 1);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Empty Comment",
        text: "Please enter a comment.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post("/api/v1/comments", {
        videoId: videoId,
        body: newComment,
      });
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Comment posted successfully!",
      });
      setNewComment("");
      fetchComments(1);
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to post comment.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostReply = async (commentId: string, content: string) => {
    if (!content.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Empty Reply",
        text: "Please enter a reply.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post(`/api/v1/comments/${commentId}/replies`, {
        body: content,
      });
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Reply posted successfully!",
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to post reply.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (id: string, isReply: boolean = false) => {
    try {
      const postEndpoint = isReply ? `/api/v1/replies/${id}/like` : `/api/v1/comments/${id}/like`;
      const fetchEndpoint = isReply ? `/api/v1/replies/${id}` : `/api/v1/comments/${id}`;
      await apiClient.post(postEndpoint);
      const response = await apiClient.get(fetchEndpoint);
      const updatedItem = response.data.data;
      console.log(updatedItem);

      if (isReply) {
        setComments((prev) =>
          prev.map((comment) => ({
            ...comment,
            replies: comment.replies.map((reply) =>
              reply.id === id
                ? { ...reply, 
                  likes: updatedItem.likes_count, 
                  dislikes: updatedItem.dislikes_count, 
                  reaction: updatedItem.user_reaction?.value ?? null }
                : reply
            ),
          }))
        );
      } else {
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === id
              ? { ...comment, 
                likes: updatedItem.likes_count, 
                dislikes: updatedItem.dislikes_count, 
                reaction: updatedItem.user_reaction?.value ?? null }
              : comment
          )
        );
      }
      console.log(comments);

    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to like ${isReply ? "reply" : "comment"}.`,
      });
    }
  };

  const handleDislike = async (id: string, isReply: boolean = false) => {
    try {
      const postEndpoint = isReply ? `/api/v1/replies/${id}/dislike` : `/api/v1/comments/${id}/dislike`;
      const fetchEndpoint = isReply ? `/api/v1/replies/${id}` : `/api/v1/comments/${id}`;
      await apiClient.post(postEndpoint);
      const response = await apiClient.get(fetchEndpoint);
      const updatedItem = response.data.data;

      if (isReply) {
        setComments((prev) =>
          prev.map((comment) => ({
            ...comment,
            replies: comment.replies.map((reply) =>
              reply.id === id
                ? { ...reply, 
                  likes: updatedItem.likes_count, 
                  dislikes: updatedItem.dislikes_count, 
                  reaction: updatedItem.user_reaction?.value ?? null }
                : reply
            ),
          }))
        );
      } else {
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === id
              ? { ...comment, 
                likes: updatedItem.likes_count, 
                dislikes: updatedItem.dislikes_count, 
                reaction: updatedItem.user_reaction?.value ?? null }
              : comment
          )
        );
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to dislike ${isReply ? "reply" : "comment"}.`,
      });
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Comments</h3>
      <CommentInput
        value={newComment}
        onChange={setNewComment}
        onSubmit={handlePostComment}
        placeholder="Add a comment..."
        isSubmitting={isSubmitting}
        submitLabel="Post Comment"
      />
      <CommentList
        comments={comments}
        isFetching={isFetchingComments}
        currentPage={currentPage}
        lastPage={lastPage}
        onShowMore={handleShowMoreComments}
        onLike={handleLike}
        onDislike={handleDislike}
        onReplySubmit={handlePostReply}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

