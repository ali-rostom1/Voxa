<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\VideoController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function(){
    Route::post('/register',[AuthController::class,'register']);
    Route::post('/login',[AuthController::class,'login']);
    Route::post('/refresh',[AuthController::class,'refresh']);
    Route::middleware('auth:api')->group(function(){
        Route::post('/logout',[AuthController::class,'logout']);
        Route::get('/me',[AuthController::class,'me']);
        Route::apiResource('/videos',VideoController::class);
        Route::apiResource('/comments',CommentController::class);
    });
});


