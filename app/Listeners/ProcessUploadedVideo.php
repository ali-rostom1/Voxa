<?php

namespace App\Listeners;

use App\Events\VideoUploaded;
use App\Models\Video;
use FFMpeg\FFMpeg;
use FFMpeg\FFProbe;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
class ProcessUploadedVideo implements ShouldQueue
{
    use InteractsWithQueue;

    // Add resolution configurations at the class level
    private array $hlsResolutions = [
        [
            'name' => '240p',
            'width' => 426,
            'height' => 240,
            'bitrate' => 800,
            'audio_bitrate' => '96k'
        ],
        [
            'name' => '360p',
            'width' => 640,
            'height' => 360,
            'bitrate' => 1200,
            'audio_bitrate' => '128k'
        ],
        [
            'name' => '720p',
            'width' => 1280,
            'height' => 720,
            'bitrate' => 3000,
            'audio_bitrate' => '128k'
        ]
    ];



    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(VideoUploaded $event)
    {
        try {
            // Extract variables from the event
            $videoPath = $event->videoPath;
            $videoId = $event->videoId;
            $userId = $event->userId;
            $categoryId = $event->categoryId;
            $title = $event->title;
            $description = $event->description;

            // Define output directory for encoded videos
            $outputDir = "uploads/videos/video_{$videoId}";

            // Download the video from S3 to a temporary file
            $tempFile = $this->downloadVideoToTempFile($videoPath);

            // Get original video dimensions
            $originalDimensions = $this->getVideoDimensions($tempFile);
            $originalWidth = $originalDimensions->getWidth();
            $originalHeight = $originalDimensions->getHeight();

            // Encode video into multiple resolutions and generate variants and master playlists
            $this->encodeVideoResolutions($tempFile, $outputDir, $originalWidth, $originalHeight);

            // Generate and upload thumbnail
            $thumbnailPath = $this->generateThumbnail($tempFile);
            Storage::disk('s3')->put("{$outputDir}/thumbnail.jpg", file_get_contents($thumbnailPath));
            unlink($thumbnailPath);


            // Save video metadata to the database
            $this->saveVideoMetadata(
                $title,
                $description,
                $videoPath,
                $userId,
                $categoryId,
                $outputDir,
                $tempFile
            );

        } catch (\Exception $e) {
            // Log the error
            Log::error("Video processing failed: " . $e->getMessage());
            throw $e; // Re-throw the exception to halt further processing
        } finally {
            // Clean up temporary files
            if (isset($tempFile) && file_exists($tempFile)) {
                unlink($tempFile);
            }
        }
    }

    /**
     * Download video from S3 to a temporary file.
     */
    private function downloadVideoToTempFile(string $videoPath): string
    {
        $localPath = Storage::disk('s3')->get($videoPath);
        $tempFile = tempnam(sys_get_temp_dir(), 'video_');
        file_put_contents($tempFile, $localPath);
        return $tempFile;
    }

    /**
     * Get video dimensions using FFProbe.
     */
    private function getVideoDimensions(string $tempFile): \FFMpeg\Coordinate\Dimension
    {
        $ffprobe = FFProbe::create();
        return $ffprobe->streams($tempFile)
                    ->videos()
                    ->first()
                    ->getDimensions();
    }

    /**
     * Encode video into multiple resolutions and upload to S3.
     */
    private function encodeVideoResolutions(string $tempFile, string $outputDir, int $originalWidth, int $originalHeight): void
    {
        $manifestPaths = [];
        $maxBitrate = 0;

        foreach ($this->hlsResolutions as $resolution) {
            if ($resolution['width'] > $originalWidth || $resolution['height'] > $originalHeight) {
                continue;
            }

            $quality = $resolution['name'];
            $manifestPath = $this->generateHlsVariant(
                $tempFile,
                $outputDir,
                $resolution['width'],
                $resolution['height'],
                $resolution['bitrate'],
                $resolution['audio_bitrate'],
                $quality
            );

            $manifestPaths[] = [
                'path' => $manifestPath,
                'bandwidth' => $resolution['bitrate'] * 1000,
                'resolution' => "{$resolution['width']}x{$resolution['height']}"
            ];

            if ($resolution['bitrate'] > $maxBitrate) {
                $maxBitrate = $resolution['bitrate'];
            }
        }

        // Generate master playlist after all variants
        $this->generateMasterPlaylist($outputDir, $manifestPaths, $maxBitrate);
    }

    /**
     * Generate HLS variant for a specific resolution
     */
    private function generateHlsVariant(
        string $tempFile,
        string $outputDir,
        int $width,
        int $height,
        int $bitrate,
        string $audioBitrate,
        string $quality
    ): string {
        $variantDir = "{$outputDir}/{$quality}";
        $localVariantDir = storage_path("app/{$variantDir}");
        
        if (!file_exists($localVariantDir)) {
            mkdir($localVariantDir, 0777, true);
        }

        $manifestPath = "{$localVariantDir}/playlist.m3u8";
        $segmentPattern = "{$localVariantDir}/segment_%03d.ts";

        $command = sprintf(
            'ffmpeg -threads 2 -i %s -vf scale=%d:%d -c:v libx264 -b:v %dk -maxrate %dk -bufsize %dk -c:a aac -b:a %s ' .
            '-hls_time 6 -hls_playlist_type vod -hls_segment_filename %s %s',
            escapeshellarg($tempFile),
            $width,
            $height,
            $bitrate,
            $bitrate * 1.2,  // maxrate = bitrate * 1.2
            $bitrate * 2,     // bufsize = bitrate * 2
            $audioBitrate,
            $segmentPattern,
            escapeshellarg($manifestPath)
        );

        exec($command);

        // Upload entire variant directory to S3
        foreach (glob("{$localVariantDir}/*") as $file) {
            $relativePath = str_replace(storage_path('app/'), '', $file);
            Storage::disk('s3')->put($relativePath, file_get_contents($file));
            unlink($file);
        }

        return "{$variantDir}/playlist.m3u8";
    }

    /**
     * Generate master HLS playlist
     */
    private function generateMasterPlaylist(string $outputDir, array $variants, int $maxBitrate): void
    {
        $masterContent = "#EXTM3U\n";
        $masterContent .= "#EXT-X-VERSION:3\n";
        
        $cdnUrl = config('app.cdn_url');

        foreach ($variants as $variant) {
            $masterContent .= sprintf(
                "#EXT-X-STREAM-INF:BANDWIDTH=%d,RESOLUTION=%s\n%s\n",
                $variant['bandwidth'],
                $variant['resolution'],
                "{$cdnUrl}/{$variant['path']}"
            );
        }

        $masterPath = "{$outputDir}/master.m3u8";
        Storage::disk('s3')->put($masterPath, $masterContent);
    }

    /**
     * Generate a thumbnail from the video.
     */
    private function generateThumbnail(string $tempFile): string
    {
        $thumbnailPath = tempnam(sys_get_temp_dir(), 'thumbnail_') . ".jpg";
        $command = sprintf(
            'ffmpeg -i %s -ss 00:00:01 -vframes 1 -update 1 %s',
            escapeshellarg($tempFile),
            escapeshellarg($thumbnailPath)
        );
        exec($command);
        return $thumbnailPath;
    }


    /**
     * Save video metadata to the database.
     */
    private function saveVideoMetadata(
        string $title,
        string $description,
        string $videoPath,
        int $userId,
        int $categoryId,
        string $outputDir,
        string $tempFile
    ): void {
        $ffprobe = FFProbe::create();
        $videoStream = $ffprobe->streams($tempFile)->videos()->first();
        $format = $ffprobe->format($tempFile);
        $cdnUrl = config('app.cdn_url');
        Video::create([
            'title' => $title,
            'description' => $description,
            'original_video_path' => "{$cdnUrl}/{$videoPath}",
            'user_id' => $userId,
            'category_id' => $categoryId,
            'duration' => $format->get('duration'),
            'file_format' => $format->get('format_name'),
            'resolution' => "{$videoStream->getDimensions()->getWidth()}x{$videoStream->getDimensions()->getHeight()}",
            'manifest_url' => "{$cdnUrl}/{$outputDir}/master.m3u8",
            'file_size' => Storage::disk('s3')->size($videoPath),
            'frame_rate' => $videoStream->get('avg_frame_rate'),
            'thumbnail_path' => "{$cdnUrl}/{$outputDir}/thumbnail.jpg",
        ]);
    }
}
