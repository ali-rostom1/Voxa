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
        'path',
        'user_id',
        'category_id',
        'duration',
        'file_format',
        'resolution',
        'file_size',
        'frame_rate',
        'thumbnail_path',
    ];

    public function category(){
        return $this->belongsTo(Category::class);
    }
    public function playlists()
    {
        return $this->belongsToMany(Playlist::class,'video_playlist');
    }
}
