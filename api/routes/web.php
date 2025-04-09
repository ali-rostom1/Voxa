<?php

use FFMpeg\FFProbe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::get('/', function () {
    return view('welcome');
});
Route::post('/upload',function(Request $request){
    if($request->hasFile('uploadMe')){
        $file = $request->file('uploadMe');
        $fileName = $file->getClientOriginalName();
        $filePath = $request->file('uploadMe')->getPathname();
        $ffprobe = FFProbe::create();

        $videoStream = $ffprobe->streams($filePath)
                                ->videos()
                                ->first();
        $format = $ffprobe->format($filePath);
        $metadata = [
            'duration' => $format->get('duration'),
            'file_format' => $format->get('format_name'),
            'resolution' => $videoStream->get('width') . 'x' . $videoStream->get('height'),
            'file_size' => $format->get('size'),
            'frame_rate' => $videoStream->get('avg_frame_rate'),
        ];
        Storage::drive('s3')->putFileAs('uploads/videos/',$file,$fileName,['Metadata' => $metadata]);
    }
});