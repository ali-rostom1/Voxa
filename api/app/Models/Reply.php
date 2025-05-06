<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class Reply extends Model
{
    protected $fillable = [
        'body',
        'user_id',
        'comment_id',
    ];

    public function comment()
    {
        return $this->belongsTo(Comment::class);
    }
    public function user()
    {
        return $this->belongsTo(User::class);
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
