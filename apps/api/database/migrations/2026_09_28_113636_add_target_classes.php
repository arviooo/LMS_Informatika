<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('materials', function (Blueprint $table) {
            $table->json('target_classes')->nullable()->after('order_number');
        });

        Schema::table('assignments', function (Blueprint $table) {
            $table->json('target_classes')->nullable()->after('attachment_path');
        });
    }

    public function down(): void
    {
        Schema::table('materials', function (Blueprint $table) {
            $table->dropColumn('target_classes');
        });

        Schema::table('assignments', function (Blueprint $table) {
            $table->dropColumn('target_classes');
        });
    }
};
