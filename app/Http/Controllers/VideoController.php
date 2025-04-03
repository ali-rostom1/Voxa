<?php

namespace App\Http\Controllers;

use App\Events\VideoUploaded;
use App\Http\Requests\VideoStoreRequest;
use App\Http\Requests\VideoUpdateRequest;
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
        /** @var App\Models\User $user */
        $user = Auth::user();
        try{
            $videos = Video::paginate(10);
            return response()->json([
                'status' => 'success',
                'message' => 'Successfully retrieved videos',
                'data' => $videos,
            ],201);
        }catch(\Throwable $e){
            return response()->json([
                'status' => 'error',
                'message' => 'An internal server error occurred while trying to retrieve videos.'
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
}
