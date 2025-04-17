<?php

namespace App\Http\Middleware;

use App\Models\Video;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackView
{
    public function __construct(
        protected \App\Services\ViewTracker $viewTracker
    )
    {
        
    }
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
    
        if ($request->route()->getName() === 'videos.show') {
            
            $id = $request->route('video');
            $video = Video::find($id);
            
            if ($video) {
                
                $this->viewTracker->track($video, $request);
            }
        }
    return $response;
    }
}
