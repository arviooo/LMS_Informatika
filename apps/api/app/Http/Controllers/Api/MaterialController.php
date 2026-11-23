<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Material;
use Illuminate\Support\Facades\Storage;

class MaterialController extends Controller
{
    public function index()
    {
        return response()->json(Material::orderBy('order_number')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'topic_id' => 'required|exists:topics,id',
            'title' => 'required|string|max:200',
            'content_text' => 'required|string',
            'youtube_video_id' => 'nullable|string|max:20',
            'attachment_path' => 'nullable|string|max:255',
            'estimated_read_time' => 'required|integer',
            'order_number' => 'required|integer',
            'attachment' => 'nullable|file|max:10240', // max 10MB
            'target_classes' => 'nullable|array',
            'target_classes.*' => 'string'
        ]);

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $fileName = 'material_' . time() . '_' . \Illuminate\Support\Str::random(5) . '.' . $file->getClientOriginalExtension();
            $dir = base_path('materials');
            if (!file_exists($dir)) mkdir($dir, 0755, true);
            $file->move($dir, $fileName);
            $validated['attachment_path'] = '/materials/' . $fileName;
        }

        $material = Material::create($validated);
        return response()->json($material, 201);
    }

    public function show(string $id)
    {
        $material = Material::findOrFail($id);
        return response()->json($material);
    }

    public function update(Request $request, string $id)
    {
        $material = Material::findOrFail($id);
        
        $validated = $request->validate([
            'topic_id' => 'exists:topics,id',
            'title' => 'string|max:200',
            'content_text' => 'string',
            'youtube_video_id' => 'nullable|string|max:20',
            'attachment_path' => 'nullable|string|max:255',
            'estimated_read_time' => 'integer',
            'order_number' => 'integer',
            'attachment' => 'nullable|file|max:10240',
            'target_classes' => 'nullable|array',
            'target_classes.*' => 'string'
        ]);

        if ($request->hasFile('attachment')) {
            if ($material->attachment_path) {
                $oldFile = base_path(ltrim(parse_url($material->attachment_path, PHP_URL_PATH), '/'));
                if (file_exists($oldFile) && !is_dir($oldFile)) @unlink($oldFile);
            }
            $file = $request->file('attachment');
            $fileName = 'material_' . time() . '_' . \Illuminate\Support\Str::random(5) . '.' . $file->getClientOriginalExtension();
            $dir = base_path('materials');
            if (!file_exists($dir)) mkdir($dir, 0755, true);
            $file->move($dir, $fileName);
            $validated['attachment_path'] = '/materials/' . $fileName;
        }

        $material->update($validated);
        return response()->json($material);
    }

    public function destroy(string $id)
    {
        $material = Material::findOrFail($id);
        $material->delete();
        return response()->json(null, 204);
    }
}
