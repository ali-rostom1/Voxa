<?php

namespace App\Http\Controllers;

use App\Http\Requests\CommentStoreRequest;
use App\Http\Requests\CommentUpdateRequest;
use App\Models\Comment;
use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    public function index($videoId)
    {
        try {
            // Verify the video exists
            Video::findOrFail($videoId);

            // Get paginated comments with user data
            $comments = Comment::with('user')
                ->where('video_id', $videoId)
                ->orderBy('created_at', 'desc')
                ->paginate(15);

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
    public function store(CommentStoreRequest $request, $videoId)
    {
        try {
            // Verify the video exists
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
                'message' => 'An error occurred while adding the comment.'
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

            // Refresh the comment to get updated like count
            $comment->refresh();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'likes_count' => $comment->likes_count
                ]
            ], 200);
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
            // Verify parent comment exists
            Comment::findOrFail($commentId);

            // Get paginated replies with user data
            $replies = Comment::with('user')
                ->where('parent_id', $commentId)
                ->orderBy('created_at', 'asc') // Oldest first for replies
                ->paginate(10);

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
                'message' => 'An error occurred while retrieving comment replies.'
            ], 500);
        }
    }
}

