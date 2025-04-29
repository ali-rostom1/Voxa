<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'pfp_path',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }


    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
    public function videos()
    {
        return $this->hasMany(Video::class);
    }
    public function playlists()
    {
        return $this->hasMany(Playlist::class);
    }
    public function replies()
    {
        return $this->hasMany(Reply::class);
    }
    public function conversations()
    {
        return $this->belongsToMany(Conversation::class,'conversation_participants');
    }
    public function messages()
    {
        return $this->hasMany(Message::class);
    }
    public function reactions()
    {
        return $this->hasMany(Reaction::class);
    }
    public function savedVideos()
    {
        return $this->belongsToMany(Video::class,'saved_videos');
    }
    public function friends()
    {
        return $this->belongsToMany(User::class,'friends','user_id','friend_id')
                    ->withPivot('is_accepted')
                    ->wherePivot('is_accepted',true)
                    ->withTimestamps()
                    ->union(
                        $this->belongsToMany(User::class, 'friends', 'friend_id', 'user_id')
                             ->withPivot('is_accepted')
                             ->wherePivot('is_accepted', true)
                             ->withTimestamps()
                    );
    }
    public function sentFriendRequests()
    {
        return $this->belongsToMany(User::class,'friends','user_id','friend_id')
                    ->withPivot('is_accepted')
                    ->wherePivot('is_accepted',false)
                    ->withTimestamps();
    }
    public function receivedFriendRequests()
    {
        return $this->belongsToMany(User::class,'friends','friend_id','user_id')
                    ->withPivot('is_accepted')
                    ->wherePivot('is_accepted',false)
                    ->withTimestamps();
    }
    public function subscribers()
    {
        return $this->belongsToMany(User::class,'subscribes','subscribed_to_id','subscriber_id');
    }
    public function subscriptions()
    {
        return $this->belongsToMany(User::class,'subscribes','subscriber_id','subscribed_to_id');
    }
}
