<?php
namespace App\Services;

use App\Models\Video;
use App\Models\View;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class ViewTracker
{
    public function track(Video $video, Request $request): bool
    {
        if(Auth::guest()){
            return false;
        }
        $lastView = View::where('video_id', $video->id)
            ->where('user_id', Auth::id())
            ->exists();

        if ($lastView) {
            return false;
        }

        View::create([
            'video_id' => $video->id,
            'user_id' => Auth::id(),
            'device_id' => null,
            'viewed_at' => now(),
        ]);

        return true;
    }
}
