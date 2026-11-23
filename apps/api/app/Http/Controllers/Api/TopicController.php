<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Topic;

class TopicController extends Controller
{
    public function index()
    {
        return response()->json(Topic::with('materials')->orderBy('order_number')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:150',
            'description' => 'required|string',
            'order_number' => 'required|integer',
            'is_active' => 'boolean'
        ]);

        $topic = Topic::create($validated);
        return response()->json($topic, 201);
    }

    public function show(string $id)
    {
        $topic = Topic::with('materials')->findOrFail($id);
        return response()->json($topic);
    }

    public function update(Request $request, string $id)
    {
        $topic = Topic::findOrFail($id);
        
        $validated = $request->validate([
            'title' => 'string|max:150',
            'description' => 'string',
            'order_number' => 'integer',
            'is_active' => 'boolean'
        ]);

        $topic->update($validated);
        return response()->json($topic);
    }

    public function destroy(string $id)
    {
        $topic = Topic::findOrFail($id);
        $topic->delete();
        return response()->json(null, 204);
    }
}
