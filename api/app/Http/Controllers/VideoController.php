<?php

namespace App\Http\Controllers;

use App\Events\VideoUploaded;
use App\Http\Requests\VideoStoreRequest;
use App\Http\Requests\VideoUpdateRequest;
use App\Models\Playlist;
use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class VideoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try{
            $videos = Video::with(['user','category'])->inRandomOrder()->paginate(10);
            $videos->loadCount('views');
            return response()->json([
                'status' => 'success',
                'message' => 'Successfully retrieved videos',
                'data' => $videos,
            ],201);
        }catch(\Throwable $e){
            return response()->json([
                'status' => 'error',
                'message' => 'An internal server error occurred while trying to retrieve videos.',
                'error' => $e->getMessage()
            ],500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(VideoStoreRequest $request)
    {   
        try{
            //STORE THE ORIGINAL VIDEO IN S3
            $originalFilename = $request->file('video_upload')->getClientOriginalName();
            $sanitizedFilename = preg_replace('/[^a-zA-Z0-9._-]/', '_', $originalFilename);
            $originalPath = $request->file('video_upload')->storeAs('uploads/videos',$sanitizedFilename,'s3');

            $videoId = uniqid();
            
            event(new VideoUploaded($originalPath,$videoId,Auth::user()->id,$request->category_id,$request->title,$request->description));


            return response()->json([
                'status' => 'success',
                'message' => 'Video Upload is being processed',
            ],201);
        }catch(\Throwable $e){
            return response()->json([
                'status' => 'error',
                'message' => 'An internal server error occurred while trying to upload video.'
            ],500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try{
            $video = Video::with(['user','category'])->find($id);
            if(!$video){
                return response()->json([
                    'status' => 'error',
                    'message' => 'Video Not Found',
                ]);
            }
            return response()->json([
                'status' => 'success',
                'message' => 'Video Retrieved successfully',
                'data' => $video
            ],201);
        }catch(\Throwable $e){
            return response()->json([
                'status' => 'error',
                'message' => 'An internal server error occurred while trying to find video.'
            ],500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(VideoUpdateRequest $request, string $id)
    {
        try{
            $video = Video::where('user_id',Auth::id())->findOrFail($id);
            $video->update($request->validated());
            return response()->json([
                'status' => 'success',
                'message' => 'Video updated successfully',
                'data' => $video,
            ],200);
        }catch(\Illuminate\Database\Eloquent\ModelNotFoundException $e){
            return response()->json([
                'status' => 'error',
                'message' => 'Video not found or you do not have permission to update it.'
            ],404);
        }catch(\Throwable $e){
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred trying to update the video.'
            ],500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try{
            $video = Video::where('user_id',Auth::id())->findOrFail($id);
            $video->delete();
            return response()->json([
                'status' => 'success',
                'message' => 'Video deleted successfully',
                'data' => $video,
            ],200);
        }catch(\Illuminate\Database\Eloquent\ModelNotFoundException $e){
            return response()->json([
                'status' => 'error',
                'message' => 'Video not found or you do not have permission to delete it.'
            ],404);
        }catch(\Throwable $e){
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred trying to delete the video.'
            ],500);
        }
    }
    public function getVideoByCategory($categoryId)
    {
        try {
            $videos = Video::where('category_id', $categoryId)->with(['user', 'category'])->paginate(10);
            return response()->json([
                'status' => 'success',
                'message' => 'Videos retrieved successfully',
                'data' => $videos,
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An internal server error occurred while trying to retrieve videos by category.',
            ], 500);
        }
    }
    public function getVideoByUser($userId)
    {
        try {
            $videos = Video::where('user_id', $userId)->with(['user', 'category'])->paginate(10);
            return response()->json([
                'status' => 'success',
                'message' => 'Videos retrieved successfully',
                'data' => $videos,
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An internal server error occurred while trying to retrieve videos by user.',
            ], 500);
        }
    }
    public function getVideoBySearch(Request $request)
    {
        try {
            $request->validate([
                'search' => 'required|string|max:255',
            ]);
            $searchTerm = $request->input('search');
            $videos = Video::where('title', 'LIKE', "%{$searchTerm}%")
                ->orWhere('description', 'LIKE', "%{$searchTerm}%")
                ->with(['user', 'category'])
                ->paginate(10);

            return response()->json([
                'status' => 'success',
                'message' => 'Videos retrieved successfully',
                'data' => $videos,
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An internal server error occurred while trying to retrieve videos by search.',
            ], 500);
        }
    }
    public function getVideoBySaved()
    {
        try {
            $videos = Video::whereHas('savedByUsers', function ($query) {
                $query->where('user_id', Auth::id());
            })->with(['user', 'category'])->paginate(10);

            return response()->json([
                'status' => 'success',
                'message' => 'Videos retrieved successfully',
                'data' => $videos,
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An internal server error occurred while trying to retrieve saved videos.',
            ], 500);
        }
    }

    public function trendingVideos(string $perPage = '10')
    {
        try {
            $videos = Video::with(['user', 'category'])
                ->withCount('views')
                ->orderBy('views_count', 'desc')
                ->paginate($perPage);

            return response()->json([
                'status' => 'success',
                'message' => 'Trending videos retrieved successfully',
                'data' => $videos,
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An internal server error occurred while trying to retrieve trending videos.',
            ], 500);
        }
    }

    public function featuredVideos(string $perPage = '10')
    {
        try {
            $videos = Video::with(['user', 'category'])->whereHas('reactions', function ($query) {
                $query->where('value', 1);
            })->withCount(['reactions','views'])
            ->orderBy('reactions_count', 'desc')
            ->paginate($perPage);
        
            return response()->json([
                'status' => 'success',
                'message' => 'Featured videos retrieved successfully',
                'data' => $videos,
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An internal server error occurred while trying to retrieve featured videos.',
            ], 500);
        }
    }
    public function getVideosFiltered(Request $request)
    {
        try {
            $request->validate([
                'search' => 'nullable|string|max:255',
                'category_id' => 'nullable|integer|exists:categories,id',
                'order_by' => 'nullable|string|in:date,likes,views',
                'per_page' => 'nullable|integer|min:1|max:100',
            ]);

            $query = Video::with(['user', 'category'])->withCount('views');

            if ($request->has('category_id')) {
                $query->where('category_id', $request->category_id);
            }

            if ($request->has('search')) {
                $searchTerm = $request->input('search');
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('title', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('description', 'LIKE', "%{$searchTerm}%");
                });
            }

            if ($request->has('order_by')) {
                switch ($request->order_by) {
                    case 'likes':
                        $query->withCount(['reactions as likes_count' => function ($q) {
                            $q->where('value', 1);
                        }])->orderBy('likes_count', 'desc');
                        break;
                    case 'views':
                        $query->orderBy('views_count', 'desc');
                        break;
                    case 'date':
                    default:
                        $query->orderBy('created_at', 'desc');
                        break;
                }
            } else {
                $query->orderBy('created_at', 'desc'); 
            }

            $perPage = $request->input('per_page', 10);
            $videos = $query->paginate($perPage);

            return response()->json([
                'status' => 'success',
                'message' => 'Videos retrieved successfully',
                'data' => $videos,
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An internal server error occurred while trying to retrieve videos.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
