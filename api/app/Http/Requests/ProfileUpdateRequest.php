<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:30|unique:users',
            'pfp_file' => 'sometimes|file|max:10000',
            'new_password' => 'sometimes|string|max:50|min:6',
            'old_password' => 'required_with:new_password|string|current_password:api',
        ];
    }
}
