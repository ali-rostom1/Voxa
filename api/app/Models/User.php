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
        'pfp_version',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'pfp_version',
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
    public function replies()
    {
        return $this->hasMany(Reply::class);
    }
    
   
    
    public function reactions()
    {
        return $this->hasMany(Reaction::class);
    }
    public function savedVideos()
    {
        return $this->belongsToMany(Video::class,'saved_videos');
    }
    
    public function subscribers()
    {
        return $this->belongsToMany(User::class,'subscribes','subscribed_to_id','subscriber_id');
    }
    public function subscriptions()
    {
        return $this->belongsToMany(User::class,'subscribes','subscriber_id','subscribed_to_id');
    }
    public function history()
    {
        return $this->belongsToMany(Video::class,'views','user_id','video_id')
                    ->orderBy('viewed_at','desc');
    }
    public function views()
    {
        return $this->hasMany(View::class);
    }
}
