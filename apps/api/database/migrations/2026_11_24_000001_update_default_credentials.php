<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Ubah password semua akun siswa ke default "spentigu123"
        DB::table('users')
            ->where('role', 'siswa')
            ->update([
                'password' => Hash::make('spentigu123'),
                'updated_at' => now(),
            ]);

        // 2. Ubah akun guru koordinator default "0987654321" -> "guruinformatika" & password "guruinformatika123"
        $legacyTeacher = DB::table('users')->where('identifier_no', '0987654321')->first();
        $newTeacher = DB::table('users')->where('identifier_no', 'guruinformatika')->first();

        if ($legacyTeacher && !$newTeacher) {
            DB::table('users')
                ->where('id', $legacyTeacher->id)
                ->update([
                    'identifier_no' => 'guruinformatika',
                    'password' => Hash::make('guruinformatika123'),
                    'updated_at' => now(),
                ]);
        } elseif ($newTeacher) {
            DB::table('users')
                ->where('id', $newTeacher->id)
                ->update([
                    'password' => Hash::make('guruinformatika123'),
                    'updated_at' => now(),
                ]);
        }
    }

    public function down(): void
    {
        // Tidak membalik perubahan password secara otomatis demi keamanan
    }
};
