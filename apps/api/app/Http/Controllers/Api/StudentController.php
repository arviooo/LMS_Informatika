<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Topic;
use App\Models\Material;
use App\Models\StudentProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StudentController extends Controller
{
    public function getTopics()
    {
        $user = Auth::user();
        $userId = $user->id;
        $studyClass = \App\Models\StudyClass::find($user->class_id);
        $userClassName = $studyClass ? $studyClass->name : $user->class_name;

        // Get all active topics with their materials, ordered by order_number
        // also load student progress for each material for the current user
        $topics = Topic::with(['materials' => function ($query) use ($userId, $userClassName) {
            $query->where(function ($q) use ($userClassName) {
                      $q->whereNull('target_classes')
                        ->orWhereJsonContains('target_classes', $userClassName);
                  })
                  ->orderBy('order_number')
                  ->with(['studentProgress' => function ($q) use ($userId) {
                      $q->where('user_id', $userId);
                  }, 'quiz' => function ($q) use ($userId) {
                      $q->where('status', 'published')
                        ->has('questions')
                        ->with(['attempts' => function ($q2) use ($userId) {
                            $q2->where('user_id', $userId);
                        }]);
                  }]);
        }])
        ->where('is_active', true)
        ->orderBy('order_number')
        ->get();

        return response()->json($topics);
    }

    public function getMaterial($id)
    {
        $userId = Auth::id();
        
        $material = Material::with(['studentProgress' => function ($query) use ($userId) {
            $query->where('user_id', $userId);
        }, 'quiz' => function ($q) use ($userId) {
            $q->where('status', 'published')
              ->has('questions')
              ->with(['attempts' => function ($q2) use ($userId) {
                  $q2->where('user_id', $userId);
              }]);
        }])->findOrFail($id);

        return response()->json($material);
    }

    public function markProgress(Request $request, $id)
    {
        $userId = Auth::id();
        $material = Material::findOrFail($id);

        $progress = StudentProgress::updateOrCreate(
            [
                'user_id' => $userId,
                'material_id' => $material->id,
            ],
            [
                'is_read' => true,
                'is_video_watched' => $request->input('is_video_watched', true),
                'completed_at' => now(),
            ]
        );

        return response()->json([
            'message' => 'Progress updated successfully',
            'progress' => $progress
        ]);
    }

    public function getClasses()
    {
        $classes = \App\Models\StudyClass::all();
        return response()->json($classes);
    }

    public function updateProfile(Request $request)
    {
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'class_id' => 'sometimes|required|exists:classes,id',
            'attendance_number' => 'sometimes|required|string|max:10',
        ]);

        $user = Auth::user();
        if ($request->has('name')) $user->name = $request->name;
        if ($request->has('class_id')) $user->class_id = $request->class_id;
        if ($request->has('attendance_number')) $user->attendance_number = $request->attendance_number;
        
        if ($request->has('password') && !empty($request->password)) {
            $user->password = \Illuminate\Support\Facades\Hash::make($request->password);
        }

        if ($request->has('avatar_base64')) {
            $base64String = $request->avatar_base64;
            if (strpos($base64String, ';base64,') !== false) {
                $imageParts = explode(";base64,", $base64String);
                $imageTypeAux = explode("image/", $imageParts[0]);
                $imageType = $imageTypeAux[1] ?? 'png';
                $imageBase64 = base64_decode($imageParts[1]);
                
                $avatarsPath = base_path('avatars');
                if (!file_exists($avatarsPath)) {
                    mkdir($avatarsPath, 0755, true);
                }
                
                $fileName = 'avatar_' . $user->id . '_' . time() . '.' . $imageType;
                file_put_contents($avatarsPath . '/' . $fileName, $imageBase64);
                $user->avatar_url = '/avatars/' . $fileName;
            }
        }
        
        if ($request->has('remove_avatar') && $request->remove_avatar == true) {
            $user->avatar_url = null;
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }

    public function heartbeat(Request $request)
    {
        $user = Auth::user();
        $user->last_activity_at = now();
        $user->save();
        return response()->json(['status' => 'alive', 'time' => now()]);
    }

    public function leave(Request $request)
    {
        $user = Auth::user();
        $user->last_activity_at = null;
        $user->last_logout_at = now();
        $user->save();
        return response()->json(['status' => 'logged_out']);
    }
}
