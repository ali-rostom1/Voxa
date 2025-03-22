<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Video extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'original_video_path',
        'manifest_url',
        'user_id',
        'category_id',
        'duration',
        'file_format',
        'resolution',
        'file_size',
        'frame_rate',
        'thumbnail_path',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
    public function playlists()
    {
        return $this->belongsToMany(Playlist::class,'video_playlist');
    }
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
    public function reactions()
    {
        return $this->morphMany(Reaction::class,'reactable');
    }
    public function views()
    {
        return $this->hasMany(View::class);
    }
    public function savedByUsers()
    {
        return $this->hasMany(User::class,'saved_videos');
    }
}
