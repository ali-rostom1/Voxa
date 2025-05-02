// import React, { useState, useEffect } from 'react';
// import { ThumbsUp, ThumbsDown, Reply, MoreVertical, Send } from 'lucide-react';
// import apiClient from '@/lib/apiClient';

// interface User {
//   id: number;
//   name: string;
//   avatar: string;
// }

// interface Comment {
//   id: number;
//   body: string;
//   user_id: number;
//   video_id: number;
//   created_at: string;
//   updated_at: string;
//   user: User;
//   replies: Reply[];
//   likes_count?: number;
//   is_liked?: boolean;
// }

// interface Reply {
//   id: number;
//   body: string;
//   user_id: number;
//   comment_id: number;
//   created_at: string;
//   updated_at: string;
//   user: User;
//   likes_count?: number;
//   is_liked?: boolean;
// }

// interface CommentSectionProps {
//   videoId: number;
//   currentUser?: User;
// }

// const formatDate = (dateString: string): string => {
//   const date = new Date(dateString);
//   const now = new Date();
//   const diffTime = Math.abs(now.getTime() - date.getTime());
//   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
//   if (diffDays < 1) {
//     return 'Today';
//   } else if (diffDays === 1) {
//     return 'Yesterday';
//   } else if (diffDays < 7) {
//     return `${diffDays} days ago`;
//   } else if (diffDays < 30) {
//     return `${Math.floor(diffDays / 7)} weeks ago`;
//   } else {
//     return date.toLocaleDateString();
//   }
// };

// const CommentItem: React.FC<{
//   comment: Comment;
//   currentUser?: User;
//   onAddReply: (commentId: number, body: string) => Promise<void>;
//   onLikeComment: (commentId: number) => Promise<void>;
// }> = ({ comment, currentUser, onAddReply, onLikeComment }) => {
//   const [showReplyInput, setShowReplyInput] = useState(false);
//   const [replyBody, setReplyBody] = useState('');
//   const [isLiked, setIsLiked] = useState(comment.is_liked || false);
//   const [likesCount, setLikesCount] = useState(comment.likes_count || 0);
//   const [showReplies, setShowReplies] = useState(true);

//   const handleLike = async () => {
//     try {
//       await onLikeComment(comment.id);
//       if (isLiked) {
//         setLikesCount(likesCount - 1);
//       } else {
//         setLikesCount(likesCount + 1);
//       }
//       setIsLiked(!isLiked);
//     } catch (error) {
//       console.error('Failed to like comment:', error);
//     }
//   };

//   const handleSubmitReply = async () => {
//     if (replyBody.trim()) {
//       try {
//         await onAddReply(comment.id, replyBody);
//         setReplyBody('');
//         setShowReplyInput(false);
//       } catch (error) {
//         console.error('Failed to add reply:', error);
//       }
//     }
//   };

//   return (
//     <div className="mb-4">
//       <div className="flex">
//         {/* User avatar */}
//         <div className="flex-shrink-0 mr-3">
//           <img
//             src={comment.user.avatar || '/api/placeholder/80/80'}
//             alt={comment.user.name}
//             className="w-10 h-10 rounded-full object-cover"
//           />
//         </div>

//         {/* Comment content */}
//         <div className="flex-grow">
//           <div className="flex items-center">
//             <h4 className="font-medium text-sm mr-2">{comment.user.name}</h4>
//             <span className="text-gray-500 text-xs">{formatDate(comment.created_at)}</span>
//           </div>

//           <p className="text-sm my-1 text-gray-800">{comment.body}</p>

//           {/* Comment actions */}
//           <div className="flex items-center mt-1 mb-2">
//             <button 
//               className={`flex items-center text-xs mr-4 ${isLiked ? 'text-blue-600' : 'text-gray-600'}`}
//               onClick={handleLike}
//             >
//               <ThumbsUp className="w-4 h-4 mr-1" />
//               {likesCount > 0 && <span>{likesCount}</span>}
//             </button>
            
//             <button 
//               className="flex items-center text-xs font-medium mr-4 text-gray-600"
//               onClick={() => setShowReplyInput(!showReplyInput)}
//             >
//               <Reply className="w-4 h-4 mr-1" />
//               REPLY
//             </button>
//           </div>

//           {/* Reply input area */}
//           {showReplyInput && currentUser && (
//             <div className="flex mt-3 mb-4">
//               <div className="flex-shrink-0 mr-3">
//                 <img
//                   src={currentUser.avatar || '/api/placeholder/80/80'}
//                   alt={currentUser.name}
//                   className="w-8 h-8 rounded-full object-cover"
//                 />
//               </div>
//               <div className="flex-grow">
//                 <input
//                   type="text"
//                   value={replyBody}
//                   onChange={(e) => setReplyBody(e.target.value)}
//                   placeholder="Add a reply..."
//                   className="w-full border-b border-gray-300 pb-1 text-sm focus:outline-none focus:border-blue-500"
//                 />
//                 <div className="flex justify-end mt-2">
//                   <button
//                     className="text-gray-500 text-sm mr-3"
//                     onClick={() => {
//                       setShowReplyInput(false);
//                       setReplyBody('');
//                     }}
//                   >
//                     CANCEL
//                   </button>
//                   <button
//                     className={`text-sm font-medium px-3 py-1 rounded-full ${
//                       replyBody.trim()
//                         ? 'bg-blue-500 text-white'
//                         : 'bg-gray-200 text-gray-500 cursor-not-allowed'
//                     }`}
//                     onClick={handleSubmitReply}
//                     disabled={!replyBody.trim()}
//                   >
//                     REPLY
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Replies section */}
//           {comment.replies.length > 0 && (
//             <div className="mt-1">
//               <button
//                 className="flex items-center text-blue-600 text-sm font-medium mb-3"
//                 onClick={() => setShowReplies(!showReplies)}
//               >
//                 <div className="w-5 h-5 mr-1 flex items-center justify-center">
//                   {showReplies ? "−" : "+"}
//                 </div>
//                 {showReplies
//                   ? "Hide replies"
//                   : `View ${comment.replies.length} ${
//                       comment.replies.length === 1 ? "reply" : "replies"
//                     }`}
//               </button>

//               {showReplies && (
//                 <div className="ml-12">
//                   {comment.replies.map((reply) => (
//                     <div key={reply.id} className="mb-4">
//                       <div className="flex">
//                         <div className="flex-shrink-0 mr-3">
//                           <img
//                             src={reply.user.avatar || '/api/placeholder/80/80'}
//                             alt={reply.user.name}
//                             className="w-8 h-8 rounded-full object-cover"
//                           />
//                         </div>
//                         <div className="flex-grow">
//                           <div className="flex items-center">
//                             <h4 className="font-medium text-sm mr-2">{reply.user.name}</h4>
//                             <span className="text-gray-500 text-xs">{formatDate(reply.created_at)}</span>
//                           </div>
//                           <p className="text-sm my-1 text-gray-800">{reply.body}</p>
                          
//                           {/* Reply actions */}
//                           <div className="flex items-center mt-1">
//                             <button 
//                               className="flex items-center text-xs mr-4 text-gray-600"
//                             >
//                               <ThumbsUp className="w-4 h-4 mr-1" />
//                               {reply.likes_count && reply.likes_count > 0 && (
//                                 <span>{reply.likes_count}</span>
//                               )}
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// const CommentSection: React.FC<CommentSectionProps> = ({
//   videoId,
//   currentUser,
// }) => {
//   const [comments, setComments] = useState<Comment[]>([]);
//   const [commentBody, setCommentBody] = useState('');
//   const [sortBy, setSortBy] = useState<'popular' | 'newest'>('popular');
//   const [commentCount, setCommentCount] = useState(0);
//   const [isLoading, setIsLoading] = useState(true);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);

//   useEffect(() => {
//     fetchComments();
//   }, [videoId, sortBy, page]);

//   const fetchComments = async () => {
//     try {
//       setIsLoading(true);
//       const response = await fetch(`/api/videos/${videoId}/comments?page=${page}&sort=${sortBy}`);
//       const data = await response.json();
      
//       if (page === 1) {
//         setComments(data.comments);
//       } else {
//         setComments(prev => [...prev, ...data.comments]);
//       }
      
//       setCommentCount(data.total);
//       setHasMore(data.has_more);
//       setIsLoading(false);
//     } catch (error) {
//       console.error('Failed to fetch comments:', error);
//       setIsLoading(false);
//     }
//   };

//   const addComment = async () => {
//     if (commentBody.trim() && currentUser) {
//       try {
//         // Replace with your actual API endpoint
//         const response = await apiClient(`/api/v1/videos/${videoId}/comments`,{
//             name: commentBody,
//             user_id: currentUser.id,
//             video_id: videoId
//         });
        
//         const newComment = await response.json();
//         setComments([newComment, ...comments]);
//         setCommentBody('');
//         setCommentCount(prev => prev + 1);
//       } catch (error) {
//         console.error('Failed to add comment:', error);
//       }
//     }
//   };

//   const addReply = async (commentId: number, body: string) => {
//     if (!currentUser) return;

//     try {
//       // Replace with your actual API endpoint
//       const response = await fetch(`/api/comments/${commentId}/replies`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ 
//           body,
//           user_id: currentUser.id,
//           comment_id: commentId
//         }),
//       });
      
//       const newReply = await response.json();
      
//       // Update the comments state with the new reply
//       setComments(comments.map(comment => {
//         if (comment.id === commentId) {
//           return {
//             ...comment,
//             replies: [...comment.replies, newReply]
//           };
//         }
//         return comment;
//       }));
//     } catch (error) {
//       console.error('Failed to add reply:', error);
//     }
//   };

//   const likeComment = async (commentId: number) => {
//     try {
//       // Replace with your actual API endpoint
//       await fetch(`/api/comments/${commentId}/like`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ 
//           user_id: currentUser?.id
//         }),
//       });
      
//       // The UI update is handled in the CommentItem component
//     } catch (error) {
//       console.error('Failed to like comment:', error);
//     }
//   };

//   const loadMoreComments = () => {
//     if (!isLoading && hasMore) {
//       setPage(prev => prev + 1);
//     }
//   };

//   return (
//     <div className="mt-6 max-w-4xl">
//       {/* Comment count and sort */}
//       <div className="flex justify-between items-center mb-6">
//         <h3 className="text-lg font-medium">{commentCount} Comments</h3>
//         <div className="flex items-center">
//           <button 
//             className="flex items-center text-sm font-medium"
//             onClick={() => {
//               setSortBy(sortBy === 'popular' ? 'newest' : 'popular');
//               setPage(1); // Reset to first page when changing sort
//             }}
//           >
//             <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//               <path d="M3 7H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
//               <path d="M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
//               <path d="M9 17H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
//             </svg>
//             SORT BY: {sortBy === 'popular' ? 'POPULAR' : 'NEWEST FIRST'}
//           </button>
//         </div>
//       </div>

//       {/* Add comment section */}
//       {currentUser && (
//         <div className="flex mb-8">
//           <div className="flex-shrink-0 mr-3">
//             <img
//               src={currentUser.avatar || '/api/placeholder/80/80'}
//               alt={currentUser.name}
//               className="w-10 h-10 rounded-full object-cover"
//             />
//           </div>
//           <div className="flex-grow">
//             <input
//               type="text"
//               value={commentBody}
//               onChange={(e) => setCommentBody(e.target.value)}
//               placeholder="Add a comment..."
//               className="w-full border-b border-gray-300 pb-2 text-sm focus:outline-none focus:border-blue-500"
//             />
//             {commentBody.trim() && (
//               <div className="flex justify-end mt-2">
//                 <button
//                   className="text-gray-500 text-sm mr-3"
//                   onClick={() => setCommentBody('')}
//                 >
//                   CANCEL
//                 </button>
//                 <button
//                   className="bg-blue-500 text-white text-sm font-medium px-4 py-1 rounded-full"
//                   onClick={addComment}
//                 >
//                   COMMENT
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Comments list */}
//       <div className="comments-list">
//         {isLoading && page === 1 ? (
//           <div className="text-center py-4">Loading comments...</div>
//         ) : comments.length > 0 ? (
//           comments.map((comment) => (
//             <CommentItem
//               key={comment.id}
//               comment={comment}
//               currentUser={currentUser}
//               onAddReply={addReply}
//               onLikeComment={likeComment}
//             />
//           ))
//         ) : (
//           <div className="text-center py-4 text-gray-500">No comments yet. Be the first to comment!</div>
//         )}
//       </div>

//       {/* Load more button */}
//       {hasMore && (
//         <button 
//           className="flex items-center justify-center w-full py-2 mt-4 text-blue-600 font-medium bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
//           onClick={loadMoreComments}
//           disabled={isLoading}
//         >
//           {isLoading && page > 1 ? 'LOADING...' : 'SHOW MORE'}
//         </button>
//       )}
//     </div>
//   );
// };

// // Export the component
// export default CommentSection;