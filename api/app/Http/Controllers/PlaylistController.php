<?php

namespace App\Http\Controllers;

use App\Http\Requests\PlaylistStoreRequest;
use App\Http\Requests\PlaylistUpdateRequest;
use App\Models\Playlist;
use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PlaylistController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $playlists = Playlist::with(['user', 'videos'])->withCount("videos")
                ->paginate(10);
            return response()->json([
                'status' => 'success',
                'message' => 'Successfully retrieved playlists',
                'data' => $playlists,
            ], 200);
        }catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An internal server error occurred while trying to retrieve playlists.'
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(PlaylistStoreRequest $request)
    {
        try {
            $user = Auth::user();
            $playlist = Playlist::create([...$request->validated(),'user_id'=>$user->id]);

            return response()->json([
                'status' => 'success',
                'message' => 'Playlist created successfully',
                'data' => $playlist,
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An internal server error occurred while trying to create playlist.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $playlist = Playlist::with(['user', 'videos'])->findOrFail($id);

            return response()->json([
                'status' => 'success',
                'message' => 'Playlist retrieved successfully',
                'data' => $playlist,
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Playlist not found or you do not have permission to view it.'
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An internal server error occurred while trying to retrieve playlist.'
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(PlaylistUpdateRequest $request, string $id)
    {
        try {
            $playlist = Playlist::where('user_id', Auth::id())->findOrFail($id);
            $playlist->update($request->validated());

            return response()->json([
                'status' => 'success',
                'message' => 'Playlist updated successfully',
                'data' => $playlist,
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Playlist not found or you do not have permission to update it.'
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred trying to update the playlist.'
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $playlist = Playlist::where('user_id', Auth::id())->findOrFail($id);
            $playlist->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Playlist deleted successfully',
                'data' => $playlist,
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Playlist not found or you do not have permission to delete it.'
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred trying to delete the playlist.'
            ], 500);
        }
    }

    /**
     * Add video to playlist
     */
    public function addVideo(Request $request, string $playlistId, string $videoId)
    {
            try {
            $playlist = Playlist::where('user_id', Auth::id())->findOrFail($playlistId);
            $video = Video::findOrFail($videoId);

            if ($playlist->videos()->where('video_id', $videoId)->exists()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Video is already in the playlist.'
                ], 400);
            }

            $playlist->videos()->attach($videoId);

            return response()->json([
                'status' => 'success',
                'message' => 'Video added to playlist successfully',
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Playlist or video not found.'
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred trying to add video to playlist.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove video from playlist
     */
    public function removeVideo(Request $request, string $playlistId, string $videoId)
    {
        try {
            $playlist = Playlist::where('user_id', Auth::id())->findOrFail($playlistId);
            $video = Video::findOrFail($videoId);

            if (!$playlist->videos()->where('id', $videoId)->exists()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Video is not in the playlist.'
                ], 400);
            }
            
            $playlist->videos()->detach($videoId);

            return response()->json([
                'status' => 'success',
                'message' => 'Video removed from playlist successfully',
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Playlist or video not found.'
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred trying to remove video from playlist.'
            ], 500);
        }
    }

    /**
     * Get user's playlists
     */
    public function userPlaylists()
    {
        try {
            $playlists = Playlist::with(['videos'])
                ->where('user_id', Auth::id())
                ->paginate(10);

            return response()->json([
                'status' => 'success',
                'message' => 'User playlists retrieved successfully',
                'data' => $playlists,
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An internal server error occurred while trying to retrieve user playlists.'
            ], 500);
        }
    }
    
}