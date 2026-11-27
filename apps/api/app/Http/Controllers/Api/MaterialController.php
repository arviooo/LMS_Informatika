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
            'youtube_video_id' => 'nullable|string|max:255',
            'attachment_path' => 'nullable|string|max:255',
            'estimated_read_time' => 'required|integer',
            'order_number' => 'required|integer',
            'attachment' => 'nullable|file|max:10240', // max 10MB
            'target_classes' => 'nullable|array',
            'target_classes.*' => 'string'
        ]);

        if (array_key_exists('youtube_video_id', $validated)) {
            $validated['youtube_video_id'] = $this->normalizeYoutubeId($validated['youtube_video_id']);
        }

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $ext = strtolower($file->getClientOriginalExtension() ?: 'bin');
            $fileName = 'material_' . time() . '_' . \Illuminate\Support\Str::random(5) . '.' . $ext;
            $dir = storage_path('app/public/materials');
            if (!is_dir($dir)) @mkdir($dir, 0775, true);
            $file->move($dir, $fileName);
            $validated['attachment_path'] = '/api/storage/materials/' . $fileName;
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
            'youtube_video_id' => 'nullable|string|max:255',
            'attachment_path' => 'nullable|string|max:255',
            'estimated_read_time' => 'integer',
            'order_number' => 'integer',
            'attachment' => 'nullable|file|max:10240',
            'target_classes' => 'nullable|array',
            'target_classes.*' => 'string'
        ]);

        if (array_key_exists('youtube_video_id', $validated)) {
            $validated['youtube_video_id'] = $this->normalizeYoutubeId($validated['youtube_video_id']);
        }

        if ($request->hasFile('attachment')) {
            if ($material->attachment_path) {
                $oldRel = ltrim(preg_replace('#^/api/storage/#', '', parse_url($material->attachment_path, PHP_URL_PATH) ?: ''), '/');
                foreach ([storage_path('app/public/' . $oldRel), base_path($oldRel)] as $oldFile) {
                    if (file_exists($oldFile) && !is_dir($oldFile)) @unlink($oldFile);
                }
            }
            $file = $request->file('attachment');
            $ext = strtolower($file->getClientOriginalExtension() ?: 'bin');
            $fileName = 'material_' . time() . '_' . \Illuminate\Support\Str::random(5) . '.' . $ext;
            $dir = storage_path('app/public/materials');
            if (!is_dir($dir)) @mkdir($dir, 0775, true);
            $file->move($dir, $fileName);
            $validated['attachment_path'] = '/api/storage/materials/' . $fileName;
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

    private function normalizeYoutubeId(?string $raw): ?string
    {
        if (!$raw) {
            return null;
        }
        $trimmed = trim($raw);
        if ($trimmed === '') {
            return null;
        }
        if (preg_match('/^[a-zA-Z0-9_-]{11}$/', $trimmed)) {
            return $trimmed;
        }
        if (preg_match('/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([a-zA-Z0-9_-]{11})/', $trimmed, $m)) {
            return $m[1];
        }
        return substr($trimmed, 0, 20);
    }
}
