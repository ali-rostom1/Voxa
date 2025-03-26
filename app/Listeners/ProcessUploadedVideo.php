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

            // Encode video into multiple resolutions
            $this->encodeVideoResolutions($tempFile, $outputDir, $originalWidth, $originalHeight);

            // Generate and upload thumbnail
            $thumbnailPath = $this->generateThumbnail($tempFile);
            Storage::disk('s3')->put("{$outputDir}/thumbnail.jpg", file_get_contents($thumbnailPath));
            unlink($thumbnailPath);

            // Generate HLS manifest and upload to S3
            $this->generateAndUploadHlsManifest($tempFile, $outputDir, $originalWidth, $originalHeight);

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
        $resolutions = [
            '144p' => ['width' => 256, 'height' => 144],
            '360p' => ['width' => 640, 'height' => 360],
            '720p' => ['width' => 1280, 'height' => 720],
            '1080p' => ['width' => 1920, 'height' => 1080],
        ];

        $ffmpeg = FFMpeg::create();
        foreach ($resolutions as $quality => $dimensions) {
            if ($dimensions['width'] > $originalWidth || $dimensions['height'] > $originalHeight) {
                continue; // Skip resolutions higher than the original
            }
             /** @var  FFMpeg\Media\Video $video**/
            $video = $ffmpeg->open($tempFile);

            /** @var  FFMpeg\Filters\Video\VideoFilters $filters **/
            $filters = $video->filters();
            $filters->resize(new \FFMpeg\Coordinate\Dimension($dimensions['width'], $dimensions['height']))->synchronize();

            $outputFile = tempnam(sys_get_temp_dir(), 'output_') . ".mp4";
            $format = new \FFMpeg\Format\Video\X264();
            $video->save($format, $outputFile);

            // Upload encoded video to S3
            Storage::disk('s3')->put("{$outputDir}/output_{$quality}.mp4", file_get_contents($outputFile));
            unlink($outputFile); // Cleanup temp file
        }
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
     * Generate HLS manifest and upload to S3.
     */
    private function generateAndUploadHlsManifest(string $tempFile, string $outputDir, int $originalWidth, int $originalHeight): void
    {
        // Ensure the output directory exists
        if (!file_exists(storage_path("app/{$outputDir}"))) {
            mkdir(storage_path("app/{$outputDir}"), 0777, true);
        }

        $manifestPath = storage_path("app/{$outputDir}/output.m3u8");
        $segmentPattern = storage_path("app/{$outputDir}/segment_%03d.ts");

        $command = sprintf(
            'ffmpeg -i %s -vf scale=%d:%d -c:v libx264 -b:v 800k -c:a aac -b:a 128k -hls_time 10 -hls_playlist_type vod -hls_segment_type mpegts -hls_segment_filename %s %s',
            escapeshellarg($tempFile),
            $originalWidth,
            $originalHeight,
            $segmentPattern,
            escapeshellarg($manifestPath)
        );
        exec($command);

        // Upload manifest and segments to S3
        Storage::disk('s3')->put("{$outputDir}/output.m3u8", file_get_contents($manifestPath));
        foreach (glob(storage_path("app/{$outputDir}/segment_*.ts")) as $segment) {
            Storage::disk('s3')->put("{$outputDir}/" . basename($segment), file_get_contents($segment));
            unlink($segment); // Cleanup segment file
        }
        unlink($manifestPath); // Cleanup manifest file
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
            'manifest_url' => "{$cdnUrl}/{$outputDir}/output.m3u8",
            'file_size' => Storage::disk('s3')->size($videoPath),
            'frame_rate' => $videoStream->get('avg_frame_rate'),
            'thumbnail_path' => "{$cdnUrl}/{$outputDir}/thumbnail.jpg",
        ]);
    }
}
