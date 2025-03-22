<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class VideoUploaded
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $videoPath;
    public $videoId;
    public $userId;
    public $categoryId;
    public $title;
    public $description;

    /**
     * Create a new event instance.
     */
    public function __construct($videoPath, $videoId, $userId, $categoryId, $title, $description)
    {
        $this->videoPath = $videoPath;
        $this->videoId = $videoId;
        $this->userId = $userId;
        $this->categoryId = $categoryId;
        $this->title = $title;
        $this->description = $description;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('channel-name'),
        ];
    }
}
