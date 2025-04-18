<?php

namespace App\Http\Controllers;

use App\Models\Reaction;
use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReactionController extends Controller
{
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
         
         return response()->json(['message' => 'Reaction added'], 201);
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
 }

