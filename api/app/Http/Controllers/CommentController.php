<?php

namespace App\Http\Controllers;

use App\Http\Requests\CommentStoreRequest;
use App\Http\Requests\CommentUpdateRequest;
use App\Http\Requests\ReplyStoreRequest;
use App\Models\Comment;
use App\Models\Reaction;
use App\Models\Reply;
use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    public function index($videoId)
    {
        try {
            Video::findOrFail($videoId);

            $comments = Comment::with(['user','replies','userReaction'])
                ->where('video_id', $videoId)
                ->withCount(['reactions as likes_count' => function($query){
                    $query->where('value',1);
                },'reactions as dislikes_count' => function($query){
                    $query->where('value',0);
                }])
                ->orderBy('created_at', 'desc')
                ->paginate(2);

            return response()->json([
                'status' => 'success',
                'message' => 'Video comments retrieved successfully',
                'data' => $comments,
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Video not found.'
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while retrieving video comments.'
            ], 500);
        }
    }
    public function store(CommentStoreRequest $request)
    {
        try {
            $validated = $request->validated();

            $videoId = $validated['videoId'];
            Video::findOrFail($videoId);

            // Create the comment
            $comment = Comment::create([
                'video_id' => $videoId,
                'user_id' => Auth::id(),
                'body' => $request->body,
            ]);

            // Load user relationship for the response
            $comment->load('user');

            return response()->json([
                'status' => 'success',
                'message' => 'Comment added successfully',
                'data' => $comment,
            ], 201);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Video not found.'
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while adding the comment.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an existing comment
     * 
     * Allows the comment owner to update their comment content
     * 
     * @param VideoCommentUpdateRequest $request Validated comment data
     * @param int $commentId The ID of the comment to update
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(CommentUpdateRequest $request, $commentId)
    {
        try {
            // Find the comment and verify ownership
            $comment = Comment::where('user_id', Auth::id())
                ->findOrFail($commentId);

            // Update the comment content
            $comment->update([
                'content' => $request->content
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Comment updated successfully',
                'data' => $comment,
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Comment not found or you do not have permission to edit it.'
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while updating the comment.'
            ], 500);
        }
    }

    /**
     * Delete a comment
     * 
     * Allows the comment owner or video owner to delete a comment
     * 
     * @param int $commentId The ID of the comment to delete
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($commentId)
    {
        try {
            // Find the comment and verify ownership
            $comment = Comment::with('video')
                ->where(function($query) {
                    // Either the comment owner or the video owner can delete
                    $query->where('user_id', Auth::id())
                          ->orWhereHas('video', function($q) {
                              $q->where('user_id', Auth::id());
                          });
                })
                ->findOrFail($commentId);

            $comment->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Comment deleted successfully',
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Comment not found or you do not have permission to delete it.'
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while deleting the comment.'
            ], 500);
        }
    }

    /**
     * Like a comment
     * 
     * Toggles a like on a comment for the authenticated user
     * 
     * @param int $commentId The ID of the comment to like/unlike
     * @return \Illuminate\Http\JsonResponse
     */
    public function like($commentId)
    {
        try {
            $comment = Comment::findOrFail($commentId);
            $user = Auth::user();
            
            $existingReaction = $comment->reactions()
            ->where('user_id',$user->id)
            ->first();
            if($existingReaction){
                if($existingReaction->value === 1){
                    $existingReaction->delete();
                    return response()->json([
                        'message' => 'Reaction removed'
                    ],200);
                }
                $existingReaction->update(['value' => 1]);
                return response()->json(['message' => 'Reaction updated'], 200);
            }
            $reaction = new Reaction([
                'user_id' => $user->id,
                'value' => 1
            ]);
            $comment->reactions()->save($reaction);
            return response()->json([
                'message' => 'Reaction added'
            ],200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Comment not found.'
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while processing your request.'
            ], 500);
        }
    }
    public function dislike($commentId)
    {
        try {
            $comment = Comment::findOrFail($commentId);
            $user = Auth::user();
            
            $existingReaction = $comment->reactions()
            ->where('user_id',$user->id)
            ->first();
            if($existingReaction){
                if($existingReaction->value === 0){
                    $existingReaction->delete();
                    return response()->json([
                        'message' => 'Reaction removed'
                    ],200);
                }
                $existingReaction->update(['value' => 0]);
                return response()->json(['message' => 'Reaction updated'], 200);
            }
            $reaction = new Reaction([
                'user_id' => $user->id,
                'value' => 0
            ]);
            $comment->reactions()->save($reaction);
            return response()->json([
                'message' => 'Reaction added'
            ],200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Comment not found.'
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while processing your request.'
            ], 500);
        }
    }

    /**
     * Get replies to a comment
     * 
     * Returns paginated replies (nested comments) for a parent comment
     * 
     * @param int $commentId The ID of the parent comment
     * @return \Illuminate\Http\JsonResponse
     */
    public function replies($commentId)
    {
        try {
            Comment::findOrFail($commentId);

            $replies = Reply::with(['user','userReaction'])
                ->where('comment_id', $commentId)
                ->withCount(['reactions as likes_count' => function($query){
                    $query->where('value',1);
                },'reactions as dislikes_count' => function($query){
                    $query->where('value',0);
                }])
                ->orderBy('created_at', 'asc')
                ->paginate(2);

            return response()->json([
                'status' => 'success',
                'message' => 'Comment replies retrieved successfully',
                'data' => $replies,
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Comment not found.'
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while retrieving comment replies.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function addReply(ReplyStoreRequest $request,string $commentId){
        try {
            Comment::findOrFail($commentId);
            $validated = $request->validated();
            $reply = Reply::create([...$validated,'comment_id' => $commentId,'user_id'=>Auth::id()]);

            return response()->json([
                'status' => 'success',
                'message' => 'Reply added successfully',
                'data' => $reply,
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Comment not found.'
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while posting reply.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function show($commentId){
        try {
            $comment = Comment::with(['user','replies','userReaction'])
            ->withCount(['reactions as likes_count' => function($query){
                $query->where('value',1);
            },'reactions as dislikes_count' => function($query){
                $query->where('value',0);
            }])
            ->orderBy('created_at', 'desc')
            ->find($commentId);

            return response()->json([
                'status' => 'success',
                'message' => 'Comment retrived successfully',
                'data' => $comment,
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Comment not found.'
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while retrieving comment.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function likeReply($replyId)
    {
        try {
            $reply = Reply::findOrFail($replyId);
            $user = Auth::user();
            
            $existingReaction = $reply->reactions()
            ->where('user_id',$user->id)
            ->first();
            if($existingReaction){
                if($existingReaction->value === 1){
                    $existingReaction->delete();
                    return response()->json([
                        'message' => 'Reaction removed'
                    ],200);
                }
                $existingReaction->update(['value' => 1]);
                return response()->json(['message' => 'Reaction updated'], 200);
            }
            $reaction = new Reaction([
                'user_id' => $user->id,
                'value' => 1
            ]);
            $reply->reactions()->save($reaction);
            return response()->json([
                'message' => 'Reaction added'
            ],200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'reply not found.'
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while processing your request.'
            ], 500);
        }
    }
    public function dislikeReply($replyId)
    {
        try {
            $reply = Reply::findOrFail($replyId);
            $user = Auth::user();
            
            $existingReaction = $reply->reactions()
            ->where('user_id',$user->id)
            ->first();
            if($existingReaction){
                if($existingReaction->value === 0){
                    $existingReaction->delete();
                    return response()->json([
                        'message' => 'Reaction removed'
                    ],200);
                }
                $existingReaction->update(['value' => 0]);
                return response()->json(['message' => 'Reaction updated'], 200);
            }
            $reaction = new Reaction([
                'user_id' => $user->id,
                'value' => 0
            ]);
            $reply->reactions()->save($reaction);
            return response()->json([
                'message' => 'Reaction added'
            ],200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'reply not found.'
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while processing your request.'
            ], 500);
        }
    }
    public function showReply($replyId){
        try {
            $reply = Reply::with(['user','userReaction'])
            ->withCount(['reactions as likes_count' => function($query){
                $query->where('value',1);
            },'reactions as dislikes_count' => function($query){
                $query->where('value',0);
            }])
            ->orderBy('created_at', 'desc')
            ->find($replyId);

            return response()->json([
                'status' => 'success',
                'message' => 'reply retrived successfully',
                'data' => $reply,
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'reply not found.'
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while retrieving reply.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

