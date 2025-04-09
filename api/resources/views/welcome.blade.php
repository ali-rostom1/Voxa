<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body class="">
       <form action="/upload" method="POST" enctype="multipart/form-data">
            @csrf
            <input type="file" name="uploadMe" >
            <button type="submit">submit</button>
       </form>
    </body>
</html>
