<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. classes
        Schema::create('classes', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50);
            $table->string('academic_year', 10);
            $table->timestamps();
        });

        // 2. modify users
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('class_id')->nullable()->constrained('classes')->onDelete('restrict')->after('id');
            $table->boolean('is_active')->default(true);
            $table->dateTime('last_login_at')->nullable();
        });

        // 3. topics
        Schema::create('topics', function (Blueprint $table) {
            $table->id();
            $table->string('title', 150);
            $table->text('description');
            $table->integer('order_number');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 4. materials
        Schema::create('materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('topic_id')->constrained('topics')->onDelete('cascade');
            $table->string('title', 200);
            $table->longText('content_text');
            $table->string('youtube_video_id', 20)->nullable();
            $table->string('attachment_path', 255)->nullable();
            $table->integer('estimated_read_time');
            $table->integer('order_number');
            $table->timestamps();
        });

        // 5. student_progress
        Schema::create('student_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('material_id')->constrained('materials')->onDelete('cascade');
            $table->boolean('is_read')->default(false);
            $table->boolean('is_video_watched')->default(false);
            $table->dateTime('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'material_id']);
        });

        // 6. quizzes
        Schema::create('quizzes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('topic_id')->constrained('topics')->onDelete('cascade');
            $table->decimal('passing_grade', 5, 2)->default(75.00);
            $table->integer('duration_minutes');
            $table->timestamps();
        });

        // 7. quiz_questions
        Schema::create('quiz_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained('quizzes')->onDelete('cascade');
            $table->text('question_text');
            $table->json('options'); // Store A, B, C, D as JSON
            $table->string('correct_answer', 1); // 'A', 'B', 'C', or 'D'
            $table->text('explanation')->nullable();
            $table->timestamps();
        });

        // 8. quiz_attempts
        Schema::create('quiz_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('quiz_id')->constrained('quizzes')->onDelete('cascade');
            $table->decimal('score', 5, 2);
            $table->boolean('is_passed');
            $table->integer('attempt_number');
            $table->timestamps();
        });

        // 9. quiz_attempt_answers
        Schema::create('quiz_attempt_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attempt_id')->constrained('quiz_attempts')->onDelete('cascade');
            $table->foreignId('question_id')->constrained('quiz_questions')->onDelete('cascade');
            $table->string('student_answer', 1);
            $table->timestamps();
        });

        // 10. assignments
        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('topic_id')->nullable()->constrained('topics')->onDelete('cascade');
            $table->string('title', 200);
            $table->text('command_text')->nullable(); // Perintah tugas
            $table->text('instruction');
            $table->dateTime('deadline');
            $table->integer('max_points')->default(100);
            $table->string('attachment_path', 255)->nullable();
            $table->timestamps();
        });

        // 11. assignment_submissions
        Schema::create('assignment_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained('assignments')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('file_path', 255)->nullable();
            $table->text('student_note')->nullable(); // Catatan siswa
            $table->dateTime('submitted_at')->nullable();
            $table->decimal('score', 5, 2)->nullable();
            $table->text('teacher_feedback')->nullable();
            $table->timestamps();
        });

        // 12. certificates
        Schema::create('certificates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->string('certificate_number', 50)->unique();
            $table->dateTime('issued_at');
            $table->string('file_path', 255);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('certificates');
        Schema::dropIfExists('assignment_submissions');
        Schema::dropIfExists('assignments');
        Schema::dropIfExists('quiz_attempt_answers');
        Schema::dropIfExists('quiz_attempts');
        Schema::dropIfExists('quiz_questions');
        Schema::dropIfExists('quizzes');
        Schema::dropIfExists('student_progress');
        Schema::dropIfExists('materials');
        Schema::dropIfExists('topics');
        
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['class_id']);
            $table->dropColumn(['class_id', 'is_active', 'last_login_at']);
        });
        
        Schema::dropIfExists('classes');
    }
};
