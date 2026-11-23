<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use Illuminate\Support\Facades\DB;

class TeacherQuizController extends Controller
{
    public function showByMaterial($materialId)
    {
        $quiz = Quiz::with('questions')->where('material_id', $materialId)->first();
        if (!$quiz) {
            return response()->json(null);
        }
        return response()->json($quiz);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'topic_id' => 'required|exists:topics,id',
            'material_id' => 'required|exists:materials,id',
            'title' => 'nullable|string|max:200',
            'passing_grade' => 'required|numeric',
            'duration_minutes' => 'required|integer',
            'status' => 'required|in:draft,published',
            'questions' => 'nullable|array',
            'questions.*.question_text' => 'required|string',
            'questions.*.options' => 'required|array',
            'questions.*.correct_answer' => 'required|string|size:1',
            'questions.*.points' => 'required|integer',
        ]);

        DB::beginTransaction();
        try {
            if (empty($validated['questions'])) {
                Quiz::where('material_id', $validated['material_id'])->delete();
                DB::commit();
                return response()->json(null, 200);
            }

            // Update or Create Quiz
            $quiz = Quiz::updateOrCreate(
                ['material_id' => $validated['material_id']],
                [
                    'topic_id' => $validated['topic_id'],
                    'title' => $validated['title'] ?? 'Kuis Materi',
                    'passing_grade' => $validated['passing_grade'],
                    'duration_minutes' => $validated['duration_minutes'],
                    'status' => $validated['status'],
                ]
            );

            // Sync questions
            // For simplicity, we delete all existing questions and re-insert them
            $quiz->questions()->delete();

            if (!empty($validated['questions'])) {
                foreach ($validated['questions'] as $q) {
                    $quiz->questions()->create([
                        'question_text' => $q['question_text'],
                        'options' => $q['options'],
                        'correct_answer' => $q['correct_answer'],
                        'points' => $q['points'],
                    ]);
                }
            }

            DB::commit();
            return response()->json($quiz->load('questions'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menyimpan kuis', 'error' => $e->getMessage()], 500);
        }
    }
}
