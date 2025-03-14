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
        return $this->hasMany(Video::class);
    }
}
