<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function update(ProfileUpdateRequest $request){
        try{
            /** @var App\Models\User $user */
            $user = Auth::user();
            $validated = $request->validated();
            if(key_exists('pfp_file',$validated)){
                $cdn_url = config('app.cdn_url');
                $extension = $validated['pfp_file']->getClientOriginalExtension();
                
                $currentVersion = $user->pfp_version ? (int)$user->pfp_version : 0;
                $newVersion = $currentVersion + 1;
                $fileName = "uploads/images/{$user->id}-v{$newVersion}.{$extension}";

                $res = Storage::disk('s3')->put($fileName, file_get_contents($validated['pfp_file']), 'public');
                if($res){
                    if ($user->pfp_path) {
                        $oldFileName = basename($user->pfp_path);
                        Storage::disk('s3')->delete("uploads/images/{$oldFileName}");
                    }
                    $validated['pfp_path'] = "{$cdn_url}/{$fileName}";
                    $validated['pfp_version'] = $newVersion;
                }else{
                    throw new Exception('Failed to upload profile picture to S3');
                }
            }
            if(isset($validated['new_password'])) $validated = [...$validated,'password' => Hash::make($validated['new_password'])];
            $user->update($validated);
            return response()->json([
                'status' => 'success',
                'message' => 'Successfully update your profile',
                'data' => $user,
            ], 200);

        }catch(\Throwable $e){
            return response()->json([
                'status' => 'error',
                'message' => 'An internal server error occurred while trying to update profile.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function getUser($userId){
        try{
            $user = User::findOrFail($userId);
            return response()->json([
                'status' => 'success',
                'message' => 'Successfully update your profile',
                'data' => $user,
            ]);

        }catch(\Illuminate\Database\Eloquent\ModelNotFoundException $e){
            return response()->json([
                'status' => 'error',
                'message' => 'Comment not found or you do not have permission to delete it.'
            ],404);
        }catch(\Throwable $e){
            return response()->json([
                'status' => 'error',
                'message' => 'An internal server error occurred while trying to retrieve profile.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function isSubscribed($userId){
        try{
            $user = User::find($userId);
            $isSubscribed = $user->subscribers()
            ->where('subscriber_id', Auth::id())
            ->exists();
            return response()->json([
                'status' => 'success',
                'message' => 'Successfully retrived isSubscribed',
                'data' => $isSubscribed,
            ],200);
        }catch(\Throwable $e){
            return response()->json([
                'status' => 'error',
                'message' => 'An internal server error occurred while trying to retrieve subscription info.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function subscribe($userId){
        try{
            /** @var App\Model\User $user */
            $user = Auth::user();
            if($user->subscriptions()->where('subscribed_to_id', $userId)->exists()){
                $user->subscriptions()->detach($userId);
                return response()->json(['message' => 'Unsubscribed successfully'], 200);
            }else {
                $user->subscriptions()->attach($userId, ['created_at' => now(), 'updated_at' => now()]);
                return response()->json(['message' => 'Subscribed successfully'], 200);
            }
        }catch(\Throwable $e){
            return response()->json([
                'status' => 'error',
                'message' => 'An internal server error occurred while trying to subscribe to user.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
