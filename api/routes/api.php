<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\PlaylistController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReactionController;
use App\Http\Controllers\VideoController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function(){


    Route::post('/register',[AuthController::class,'register']);
    Route::post('/login',[AuthController::class,'login']);
    Route::post('/refresh',[AuthController::class,'refresh']);

    Route::apiResource('/videos',VideoController::class)->only(['index']);
    Route::apiResource('/videos',VideoController::class)->only(['show'])->middleware('track.view');
    Route::apiResource('categories',CategoryController::class)->only(['index','show']);
    Route::apiResource('/playlists',PlaylistController::class)->only(["index",'show']);

    Route::get('videos/featured/{perPage}',[VideoController::class,'featuredVideos']);
    Route::get('videos/trending/{perPage}',[VideoController::class,'trendingVideos']);
    Route::post('videos/filter',[VideoController::class,'getVideosFiltered']);
    
       
    Route::middleware('auth:api')->group(function(){
        Route::post('/logout',[AuthController::class,'logout']);
        Route::get('/me',[AuthController::class,'me']);
        Route::apiResource('/videos',VideoController::class)->except(['index','show']);
        Route::apiResource('/comments',CommentController::class);
        Route::apiResource('/categories',CategoryController::class)->except(['index','show']);
        Route::apiResource('/playlists',PlaylistController::class)->except(['index','show']);

        // Video reactions
        Route::post('/videos/{video}/like', [ReactionController::class, 'like']);
        Route::post('/videos/{video}/dislike', [ReactionController::class, 'dislike']);
        Route::get('/videos/{video}/reactions', [ReactionController::class, 'getReactionCounts']);
        Route::get('/videos/{id}/my-reactions', [ReactionController::class, 'getReactions']);
        Route::get('/videos/{video}/save', [ReactionController::class, 'saveVideo']);
        Route::get('/videos/{video}/subscribe',[ReactionController::class, 'subscribe']);
        Route::post('/videos/history/me',[VideoController::class, 'getHistory']);
        Route::delete('/videos/history/clear',[VideoController::class, 'clearHistory']);


        //playlist interactions
        Route::post('/playlists/add/{playlistId}/{videoId}',[PlaylistController::class,'addVideo']);


        Route::put('/profile',[ProfileController::class,'update']);
    });
});


