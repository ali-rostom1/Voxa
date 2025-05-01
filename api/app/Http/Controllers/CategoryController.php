<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoryStoreRequest;
use App\Http\Requests\CategoryUpdateRequest;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try{
            $categories = Category::paginate(10);
            return response()->json([
                'status' => 'success',
                'message' => 'Successfully retrieved categories',
                'data' => $categories,
            ],200);
        }catch(\Throwable $e){
            return response()->json([
                'status' => 'error',
                'message' => 'An internal server error occurred while trying to retrieve categories.'
            ],500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CategoryStoreRequest $request)
    {   
        try{
            $category = Category::create($request->validated());

            return response()->json([
                'status' => 'success',
                'message' => 'Successfully added category',
                'data' => $category,
            ],201);
        }catch(\Throwable $e){
            return response()->json([
                'status' => 'error',
                'message' => 'An internal server error occurred while trying to store category.'
            ],500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try{
            $category = Category::with('videos')->find($id);
            if(!$category){
                return response()->json([
                    'status' => 'error',
                    'message' => 'category Not Found',
                ]);
            }
            return response()->json([
                'status' => 'success',
                'message' => 'Category retrieved successfully',
                'data' => $category
            ],201);
        }catch(\Throwable $e){
            return response()->json([
                'status' => 'error',
                'message' => 'An internal server error occurred while trying to find category.'
            ],500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CategoryUpdateRequest $request, string $id)
    {
        try{
            $category = Category::findOrFail($id);
            $category->update($request->validated());
            return response()->json([
                'status' => 'success',
                'message' => 'category updated successfully',
                'data' => $category,
            ],200);
        }catch(\Illuminate\Database\Eloquent\ModelNotFoundException $e){
            return response()->json([
                'status' => 'error',
                'message' => 'category not found or you do not have permission to update it.'
            ],404);
        }catch(\Throwable $e){
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred trying to update the category.'
            ],500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try{
            $category = Category::findOrFail($id);
            $category->delete();
            return response()->json([
                'status' => 'success',
                'message' => 'Category deleted successfully',
                'data' => $category,
            ],200);
        }catch(\Illuminate\Database\Eloquent\ModelNotFoundException $e){
            return response()->json([
                'status' => 'error',
                'message' => 'category not found or you do not have permission to delete it.'
            ],404);
        }catch(\Throwable $e){
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred trying to delete the category.'
            ],500);
        }
    }
}
