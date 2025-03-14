<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Playlist extends Model
{
    protected $fillable = [
        'name',
        'description',
        'image_path',
        'user_id',
    ];

    public function videos()
    {
        return $this->belongsToMany(Video::class,'video_playlist');
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
