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
        Schema::table('quizzes', function (Blueprint $table) {
            $table->string('title', 200)->nullable()->after('topic_id');
            $table->enum('status', ['draft', 'published'])->default('draft')->after('duration_minutes');
        });

        Schema::table('quiz_questions', function (Blueprint $table) {
            $table->integer('points')->default(10)->after('explanation');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->dropColumn(['title', 'status']);
        });

        Schema::table('quiz_questions', function (Blueprint $table) {
            $table->dropColumn(['points']);
        });
    }
};
