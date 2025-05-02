<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        try{
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);
            return response()->json([
                'status' => 'success',
                'message' => 'User created successfully',
                'user' => $user
            ],201);
        }catch(\Throwable $e){
            Log::error('User Registration Error: '. $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'An internal server error occurred while trying to register the user.',
            ],500);
        }
        
    }
    public function login(LoginRequest $request)
    {
        try{
            $token = Auth::attempt($request->only('email','password'));
            if(!$token){
                return response()->json([
                    'status' => 'error',
                    'message' => 'Couldnt find user with given credentials',
                ],401);
            }
            $user = Auth::user();
            $refreshToken = JWTAuth::customClaims([
                'exp' => now()->addDays(30)->timestamp,
                'token_type' => 'refresh'
            ])->fromUser($user);

            $user = Auth::user();
            return response()->json([
                'status' => 'success',
                'message' => 'Successfully authentificated user',
                'user' => $user,
                'authorisation' => [
                    'access_token' => $token,
                    'refresh_token' => $refreshToken,
                    'type' => 'bearer',
                ]
            ]);
        }catch(\Throwable $e){
            return response()->json([
                'status' => 'error',
                'message' => 'An internal server error occurred while trying to register the user.',
            ],500);
        }
    }
    public function logout()
    {
        try{
            JWTAuth::invalidate(JWTAuth::getToken());
            return response()->json([
                'status' => 'success',
                'message' => 'Successfully logged out',
            ]);
        }catch(\Throwable $e){
            return response()->json([
                'status' => 'error',
                'message' => 'An internal server error ocurred while trying to log out the user',
            ],500);
        }
        
    }
    public function refresh()
{
    try {
        $refreshToken = request()->input('refresh_token') ?: request()->bearerToken();

        if (!$refreshToken) {
            return response()->json([
                'status' => 'error',
                'message' => 'Refresh token required'
            ], 400);
        }

        JWTAuth::setToken($refreshToken);

        if (!JWTAuth::check()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid refresh token'
            ], 401);
        }

        $newAccessToken = JWTAuth::refresh();

        return response()->json([
            'status' => 'success',
            'message' => 'Successfully refreshed token',
            'access_token' => $newAccessToken,
            'refresh_token' => $refreshToken,
        ], 200);

    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Failed to refresh token',
            'error' => $e->getMessage()
        ], 500);
    }
}
    public function me()
    {
        try{
            $user = Auth::user();
            return response()->json([
                'status' => 'success',
                'message' => 'Successfully fetched user data',
                'data' => $user,
            ]);
        }catch(\Throwable $e){
            return response()->json([
                'status' => 'error',
                'message' => 'An internal server error ocurred while trying to fetch your data',
            ],500);
        }
    }

}
