<?php

namespace App\Http\Controllers;

use App\Models\Reaction;
use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReactionController extends Controller
{
    public function getReactions(string $id){
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $video = Video::with(['reactions' => function($query) use ($user) {
            $query->where('user_id', $user->id);
        }])->findOrFail($id);
        $isLiked = $video->reactions()
            ->where('user_id', $user->id)
            ->where('value', true)
            ->exists();
        $isDisliked = $video->reactions()
            ->where('user_id', $user->id)
            ->where('value', false)
            ->exists();
        $isSubscribed = $video->user->subscribers()
            ->where('subscriber_id', $user->id)
            ->exists();
        $isSaved = $user->savedVideos()
            ->where('video_id', $video->id)
            ->exists();
        return ['isLiked' =>$isLiked ,'isDisliked' => $isDisliked, 'isSubscribed' => $isSubscribed,'isSaved' => $isSaved];
    }
    public function like(Video $video)
    {
        return $this->handleReaction($video, 1);
    }

    public function dislike(Video $video)
    {
        return $this->handleReaction($video, 0);
    }

    private function handleReaction(Video $video, int $value)
    {
        $user = Auth::user();
        
        $existingReaction = $video->reactions()
            ->where('user_id', $user->id)
            ->first();
        if ($existingReaction) {
            if ($existingReaction->value === $value) {
                $existingReaction->delete();
                return response()->json(['message' => 'Reaction removed'], 200);
            }
            
            $existingReaction->update(['value' => $value]);
            return response()->json(['message' => 'Reaction updated'], 200);
        }

        $reaction = new Reaction([
            'user_id' => $user->id,
            'value' => $value
        ]);
        
        $video->reactions()->save($reaction);
        
        return response()->json(['message' => 'Reaction added'], 200);
    }

    public function getReactionCounts(Video $video)
    {
        $likes = $video->reactions()->where('value', true)->count();
        $dislikes = $video->reactions()->where('value', false)->count();
        
        return response()->json([
            'likes' => $likes,
            'dislikes' => $dislikes,
            'user_reaction' => Auth::check() 
                ? $video->reactions()->where('user_id', Auth::id())->first()
                : null
        ]);
    }
    public function saveVideo(Video $video)
    {
        /** @var App\Models\User $user */
        $user = Auth::user();
        if ($user->savedVideos()->where('video_id', $video->id)->exists()) {
            $user->savedVideos()->detach($video->id);
            return response()->json(['message' => 'Video unsaved'], 200);
        }
        
        $user->savedVideos()->attach($video->id, ['created_at' => now(), 'updated_at' => now()]);
        
        return response()->json(['message' => 'Video saved successfully'], 200);
    }
    public function subscribe(Video $video)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $channel = $video->user;
        if ($user->subscriptions()->where('subscriber_id', $channel->id)->exists()) {
            $user->subscriptions()->detach($channel->id);
            return response()->json(['message' => 'Unsubscribed successfully'], 200);
        } else {
            $user->subscriptions()->attach($channel->id, ['created_at' => now(), 'updated_at' => now()]);
            return response()->json(['message' => 'Subscribed successfully'], 200);
        }
    }
 }

