<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChatStoreRequest;
use App\Http\Requests\MessageStoreRequest;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\ConversationParticipant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    /**
     * Get user's conversations
     */
    public function index()
    {
        try {
            /** @var App\Models\User $user */
            $user = Auth::user();
            $conversations = $user->conversations()
                ->with(['users' => function($query) {
                    $query->where('user_id', '!=', Auth::id());
                }])
                ->orderByDesc(
                    Message::select('created_at')
                        ->whereColumn('conversation_id', 'conversations.id')
                        ->latest()
                        ->take(1)
                )
                ->paginate(10);

            return response()->json([
                'status' => 'success',
                'message' => 'Conversations retrieved successfully',
                'data' => $conversations,
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while retrieving conversations.'
            ], 500);
        }
    }

    /**
     * Get or create one-to-one conversation
     */
    public function getConversation($userId)
    {
        try {
            // Check if conversation already exists
            $conversation = Conversation::whereHas('users', function($query) use ($userId) {
                $query->where('user_id', Auth::id());
            })
            ->whereHas('users', function($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->with(['users', 'messages'])
            ->first();

            // If not exists, create new one
            if (!$conversation) {
                $conversation = Conversation::create([
                    'name' => 'Direct Message',
                ]);

                $conversation->users()->attach([Auth::id(), $userId]);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Conversation retrieved successfully',
                'data' => $conversation,
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while retrieving conversation.'
            ], 500);
        }
    }

    /**
     * Send a message in a conversation
     */
    public function sendMessage(ChatStoreRequest $request, $conversationId)
    {
        try {
            // Verify user is a participant
            $participant = Conversation::where('id', $conversationId)
                ->users()
                ->where('id',Auth::id())
                ->firstOrFail();

            $message = Message::create($request->validated());

            return response()->json([
                'status' => 'success',
                'message' => 'Message sent successfully',
                'data' => $message,
            ], 201);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Conversation not found or you are not a participant.'
            ], 403);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while sending message.'
            ], 500);
        }
    }

    /**
     * Get messages in a conversation
     */
    public function getMessages($conversationId)
    {
        try {
            // Verify user is a participant
            $participant = Conversation::where('id', $conversationId)
                ->users()
                ->where('id',Auth::id())
                ->firstOrFail();

            $messages = Message::with('user')
                ->where('conversation_id', $conversationId)
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            // Mark messages as read
            Message::where('conversation_id', $conversationId)
                ->where('sender_id', '!=', Auth::id())
                ->where('read', false)
                ->update(['read' => true]);

            return response()->json([
                'status' => 'success',
                'message' => 'Messages retrieved successfully',
                'data' => $messages,
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Conversation not found or you are not a participant.'
            ], 403);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while retrieving messages.'
            ], 500);
        }
    }

}