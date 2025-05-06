<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class Comment extends Model
{
    use HasFactory;
    protected $fillable = [
        'body',
        'user_id',
        'video_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function video()
    {
        return $this->belongsTo(Video::class);
    }
    public function replies()
    {
        return $this->hasMany(Reply::class);
    }
    public function reactions()
    {
        return $this->morphMany(Reaction::class,'reactable');
    }
    public function userReaction()
    {
        return $this->morphOne(Reaction::class, 'reactable')
                    ->where('user_id', Auth::id());
    }
}
