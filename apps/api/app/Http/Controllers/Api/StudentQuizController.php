<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Quiz;
use App\Models\Material;
use App\Models\QuizAttempt;
use App\Models\QuizAttemptAnswer;
use Illuminate\Support\Facades\DB;

class StudentQuizController extends Controller
{
    // Fetch Quiz using the Material ID
    public function showByMaterial(Request $request, $materialId)
    {
        $material = Material::findOrFail($materialId);
        
        $quiz = Quiz::with('questions')->where('material_id', $material->id)->first();
        if (!$quiz) {
            return response()->json(['message' => 'Quiz not found'], 404);
        }

        if ($quiz->status !== 'published') {
            return response()->json(['message' => 'Quiz is not available yet'], 403);
        }

        // We should hide the 'correct_answer' and 'explanation' from the student response
        $quizData = $quiz->toArray();
        foreach ($quizData['questions'] as &$question) {
            unset($question['correct_answer']);
            unset($question['explanation']);
        }

        // Optional: Include topic title for UI
        $quizData['topic_title'] = $material->topic->title;

        // Check if student already submitted this quiz
        $user = $request->user();
        if ($user) {
            $latestAttempt = QuizAttempt::where('user_id', $user->id)
                ->where('quiz_id', $quiz->id)
                ->latest()
                ->first();

            $quizData['latest_attempt'] = $latestAttempt ? [
                'id' => $latestAttempt->id,
                'score' => $latestAttempt->score,
                'is_passed' => (bool)$latestAttempt->is_passed,
                'attempt_number' => $latestAttempt->attempt_number,
                'created_at' => $latestAttempt->created_at,
            ] : null;
        } else {
            $quizData['latest_attempt'] = null;
        }

        return response()->json($quizData);
    }

    public function submit(Request $request, $quizId)
    {
        $validated = $request->validate([
            'answers' => 'nullable|array',
        ]);

        $studentAnswers = $validated['answers'] ?? [];

        $quiz = Quiz::with('questions')->findOrFail($quizId);
        $user = $request->user();

        // Prevent duplicate attempt if already completed
        $existingAttempt = QuizAttempt::where('user_id', $user->id)
            ->where('quiz_id', $quizId)
            ->first();
        if ($existingAttempt) {
            return response()->json([
                'message' => 'Anda sudah menyelesaikan kuis ini.',
                'already_completed' => true,
                'score' => $existingAttempt->score,
                'is_passed' => (bool)$existingAttempt->is_passed,
            ], 400);
        }

        // Calculate score
        $totalPoints = 0;
        $earnedPoints = 0;
        $questionsMap = $quiz->questions->keyBy('id');

        foreach ($questionsMap as $qId => $question) {
            $totalPoints += $question->points;
            
            if (isset($studentAnswers[$qId])) {
                $studentAnswer = $studentAnswers[$qId];
                if ($studentAnswer === $question->correct_answer) {
                    $earnedPoints += $question->points;
                }
            }
        }

        // Base 100 calculation
        $score = $totalPoints > 0 ? ($earnedPoints / $totalPoints) * 100 : 0;
        $isPassed = $score >= $quiz->passing_grade;

        // Determine attempt number
        $attemptCount = QuizAttempt::where('user_id', $user->id)
            ->where('quiz_id', $quizId)
            ->count();
        $attemptNumber = $attemptCount + 1;

        DB::beginTransaction();
        try {
            $attempt = QuizAttempt::create([
                'user_id' => $user->id,
                'quiz_id' => $quizId,
                'score' => $score,
                'is_passed' => $isPassed,
                'attempt_number' => $attemptNumber,
            ]);

            foreach ($studentAnswers as $qId => $studentAnswer) {
                if ($questionsMap->has($qId)) {
                    QuizAttemptAnswer::create([
                        'attempt_id' => $attempt->id,
                        'question_id' => $qId,
                        'student_answer' => $studentAnswer,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Kuis berhasil disubmit.',
                'score' => $score,
                'is_passed' => $isPassed
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal submit kuis', 'error' => $e->getMessage()], 500);
        }
    }
}
