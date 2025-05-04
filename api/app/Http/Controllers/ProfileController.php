<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
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
                $res = Storage::disk('s3')->put("uploads/images/{$user->id}",file_get_contents($validated['pfp_file']));
                if($res) $validated = [...$validated,'pfp_path'=> "{$cdn_url}/uploads/images/{$user->id}"];
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
}
