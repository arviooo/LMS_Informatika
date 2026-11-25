<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class AssignmentController extends Controller
{
    // === TEACHER METHODS ===

    public function index(Request $request)
    {
        $teacher = $request->user();
        $query = Assignment::query();

        if ($teacher && $teacher->class_name) {
            $norm = strtolower(str_replace(['-', ' '], '', $teacher->class_name));
            $query->withCount(['submissions' => function($q) use ($norm) {
                $q->whereHas('user', function($u) use ($norm) {
                    $u->whereRaw("LOWER(REPLACE(REPLACE(class_name, '-', ''), ' ', '')) = ?", [$norm]);
                });
            }]);
        } else {
            $query->withCount('submissions');
        }

        $assignments = $query->orderBy('created_at', 'desc')->get();
        return response()->json($assignments);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $assignment = Assignment::findOrFail($id);
        
        $subQuery = AssignmentSubmission::with('user:id,name,class_name,identifier_no,attendance_number')
            ->where('assignment_id', $id);

        if ($user && $user->class_name) {
            $norm = strtolower(str_replace(['-', ' '], '', $user->class_name));
            $subQuery->whereHas('user', function($q) use ($norm) {
                $q->whereRaw("LOWER(REPLACE(REPLACE(class_name, '-', ''), ' ', '')) = ?", [$norm]);
            });
        }

        $submissions = $subQuery->orderBy('submitted_at', 'desc')
            ->get()
            ->map(function ($sub) {
                $subData = $sub->toArray();
                if ($sub->file_path) {
                    $subData['file_url'] = url('/api/storage/' . $sub->file_path);
                }
                return $subData;
            });

        return response()->json([
            'assignment' => $assignment,
            'submissions' => $submissions
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:200',
            'command_text' => 'required|string',
            'instruction' => 'required|string',
            'deadline' => 'required|date',
            'max_points' => 'required|integer',
            'attachment' => 'nullable|file|max:15360', // 15MB
            'target_classes' => 'nullable|array',
            'target_classes.*' => 'string'
        ]);

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $ext = strtolower($file->getClientOriginalExtension() ?: 'bin');
            $fileName = 'assignment_' . time() . '_' . \Illuminate\Support\Str::random(5) . '.' . $ext;
            $dir = storage_path('app/public/assignments');
            if (!is_dir($dir)) @mkdir($dir, 0775, true);
            $file->move($dir, $fileName);
            $attachmentPath = 'assignments/' . $fileName;
        }

        $assignment = Assignment::create([
            'title' => $validated['title'],
            'command_text' => $validated['command_text'],
            'instruction' => $validated['instruction'],
            'deadline' => $validated['deadline'],
            'max_points' => $validated['max_points'],
            'attachment_path' => $attachmentPath,
            'target_classes' => $validated['target_classes'] ?? null,
        ]);

        return response()->json([
            'message' => 'Assignment created successfully',
            'assignment' => $assignment
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $assignment = Assignment::findOrFail($id);
        
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'command_text' => 'required|string',
            'instruction' => 'nullable|string',
            'deadline' => 'required|date',
            'max_points' => 'required|integer',
            'attachment' => 'nullable|file|max:10240',
            'target_classes' => 'nullable|array',
            'target_classes.*' => 'string'
        ]);

        if ($request->hasFile('attachment')) {
            if ($assignment->attachment_path) {
                $cleanOld = ltrim($assignment->attachment_path, '/');
                foreach ([storage_path('app/public/' . $cleanOld), base_path($cleanOld)] as $oldFile) {
                    if (file_exists($oldFile) && !is_dir($oldFile)) @unlink($oldFile);
                }
            }
            $file = $request->file('attachment');
            $ext = strtolower($file->getClientOriginalExtension() ?: 'bin');
            $fileName = 'assignment_' . time() . '_' . \Illuminate\Support\Str::random(5) . '.' . $ext;
            $dir = storage_path('app/public/assignments');
            if (!is_dir($dir)) @mkdir($dir, 0775, true);
            $file->move($dir, $fileName);
            $assignment->attachment_path = 'assignments/' . $fileName;
        }

        $assignment->update([
            'title' => $validated['title'],
            'command_text' => $validated['command_text'],
            'instruction' => $validated['instruction'],
            'deadline' => $validated['deadline'],
            'max_points' => $validated['max_points'],
            'target_classes' => $validated['target_classes'] ?? null,
        ]);

        return response()->json([
            'message' => 'Assignment updated successfully',
            'assignment' => $assignment
        ]);
    }

    public function destroy($id)
    {
        $assignment = Assignment::findOrFail($id);
        $assignment->delete();
        
        return response()->json([
            'message' => 'Assignment deleted successfully'
        ]);
    }

    public function grade(Request $request, $id, $submissionId)
    {
        $validated = $request->validate([
            'score' => 'required|integer|min:0'
        ]);

        $teacher = $request->user();
        $submission = AssignmentSubmission::with('user')
            ->where('id', $submissionId)
            ->where('assignment_id', $id)
            ->firstOrFail();

        if ($teacher && $teacher->class_name && $submission->user) {
            $normTeacher = strtolower(str_replace(['-', ' '], '', $teacher->class_name));
            $normStudent = strtolower(str_replace(['-', ' '], '', $submission->user->class_name ?? ''));
            if ($normTeacher !== $normStudent) {
                return response()->json(['message' => 'Akses ditolak: Anda hanya berhak memberi nilai pada siswa kelas Anda (' . $teacher->class_name . ').'], 403);
            }
        }

        $submission->update([
            'score' => $validated['score']
        ]);

        return response()->json([
            'message' => 'Graded successfully',
            'submission' => $submission
        ]);
    }

    // === STUDENT METHODS ===

    public function studentIndex(Request $request)
    {
        $user = $request->user();
        $userId = $user->id;
        $studyClass = \App\Models\StudyClass::find($user->class_id);
        $userClassName = $studyClass ? $studyClass->name : $user->class_name;

        // Get assignments with submission status
        $assignments = Assignment::where(function ($q) use ($userClassName) {
                $q->whereNull('target_classes')
                  ->orWhereJsonContains('target_classes', $userClassName);
            })
            ->orderBy('deadline', 'asc')
            ->get()
            ->map(function ($assignment) use ($userId) {
            $submission = AssignmentSubmission::where('assignment_id', $assignment->id)
                ->where('user_id', $userId)
                ->first();

            return [
                'id' => $assignment->id,
                'title' => $assignment->title,
                'command_text' => $assignment->command_text,
                'deadline' => $assignment->deadline,
                'max_points' => $assignment->max_points,
                'has_submitted' => $submission ? true : false,
                'score' => $submission ? $submission->score : null,
            ];
        });

        return response()->json($assignments);
    }

    public function studentShow(Request $request, $id)
    {
        $assignment = Assignment::with('topic')->findOrFail($id);
        $userId = $request->user()->id;

        $submission = AssignmentSubmission::where('assignment_id', $id)
            ->where('user_id', $userId)
            ->first();

        // Convert assignment to array and append full URL for attachment
        $assignmentData = $assignment->toArray();
        if (!empty($assignmentData['attachment_path'])) {
            $assignmentData['attachment_url'] = url('/api/storage/' . ltrim($assignmentData['attachment_path'], '/'));
        }

        $submissionData = null;
        if ($submission) {
            $submissionData = $submission->toArray();
            if (!empty($submissionData['file_path'])) {
                $submissionData['file_url'] = url('/api/storage/' . ltrim($submissionData['file_path'], '/'));
            }
        }

        return response()->json([
            'assignment' => $assignmentData,
            'submission' => $submissionData,
        ]);
    }

    public function submit(Request $request, $id)
    {
        $request->validate([
            'file' => 'required|file|max:15360', // 15MB
            'student_note' => 'nullable|string'
        ]);

        $file = $request->file('file');
        $ext = strtolower($file->getClientOriginalExtension() ?: '');
        $allowedExts = ['pdf', 'png', 'jpg', 'jpeg', 'webp'];
        if (!in_array($ext, $allowedExts, true)) {
            return response()->json([
                'message' => 'Format file tidak didukung. Gunakan file PDF, JPG, atau PNG.'
            ], 422);
        }

        $assignment = Assignment::findOrFail($id);
        $userId = $request->user()->id;

        $submission = AssignmentSubmission::where('assignment_id', $id)
            ->where('user_id', $userId)
            ->first();

        try {
            $dir = storage_path('app/public/submissions');
            if (!is_dir($dir) && !@mkdir($dir, 0775, true) && !is_dir($dir)) {
                throw new \RuntimeException('Gagal membuat folder penyimpanan tugas di server.');
            }

            $fileName = 'sub_' . $assignment->id . '_' . $userId . '_' . time() . '_' . \Illuminate\Support\Str::random(6) . '.' . $ext;
            $file->move($dir, $fileName);
            $filePath = 'submissions/' . $fileName;
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Assignment submission upload failed', [
                'assignment_id' => $id,
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Gagal menyimpan file tugas di server. Pastikan folder storage dapat ditulis.'
            ], 500);
        }

        if ($submission) {
            if ($submission->file_path) {
                $oldFile = storage_path('app/public/' . ltrim($submission->file_path, '/'));
                if (file_exists($oldFile) && !is_dir($oldFile)) {
                    @unlink($oldFile);
                }
            }
            $submission->update([
                'file_path' => $filePath,
                'student_note' => $request->student_note,
                'submitted_at' => now(),
            ]);
        } else {
            $submission = AssignmentSubmission::create([
                'assignment_id' => $assignment->id,
                'user_id' => $userId,
                'file_path' => $filePath,
                'student_note' => $request->student_note,
                'submitted_at' => now(),
            ]);
        }

        $submissionData = $submission->toArray();
        $submissionData['file_url'] = url('/api/storage/' . ltrim($filePath, '/'));

        return response()->json([
            'message' => 'Submission successful',
            'submission' => $submissionData
        ]);
    }
}
