<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class TeacherAccountsSeeder extends Seeder
{
    public function run(): void
    {
        // Migrasi akun koordinator lama (0987654321 -> guruinformatika) agar tidak dobel
        $legacyCoord = User::where('identifier_no', '0987654321')->first();
        if ($legacyCoord && !User::where('identifier_no', 'guruinformatika')->exists()) {
            $legacyCoord->identifier_no = 'guruinformatika';
            $legacyCoord->name = 'Tim Guru Informatika (Koordinator)';
            $legacyCoord->class_name = null;
            $legacyCoord->class_id = null;
            $legacyCoord->password = Hash::make('guruinformatika123');
            $legacyCoord->is_active = true;
            $legacyCoord->save();
        }

        $teachers = [
            // 1. Akun Super Guru (Koordinator MGMP Informatika - Memantau Semua Kelas)
            [
                'name' => 'Tim Guru Informatika (Koordinator)',
                'identifier_no' => 'guruinformatika',
                'role' => 'guru',
                'class_name' => null,
                'class_id' => null,
                'password' => Hash::make('guruinformatika123'),
                'is_active' => true,
            ],
            // 2. Guru Pengampu Kelas VII A
            [
                'name' => 'M. Khanif Syarifudin, S.Pd',
                'identifier_no' => 'guru_viia',
                'role' => 'guru',
                'class_name' => 'VII A',
                'class_id' => null,
                'password' => Hash::make('guruinformatika123'),
                'is_active' => true,
            ],
            // 3. Guru Pengampu Kelas VII B
            [
                'name' => 'Nur Rohim, S.Sos., MA',
                'identifier_no' => 'guru_viib',
                'role' => 'guru',
                'class_name' => 'VII B',
                'class_id' => null,
                'password' => Hash::make('guruinformatika123'),
                'is_active' => true,
            ],
            // 4. Guru Pengampu Kelas VII C
            [
                'name' => 'Maya Sekar Kemuning, S.Pd',
                'identifier_no' => 'guru_viic',
                'role' => 'guru',
                'class_name' => 'VII C',
                'class_id' => null,
                'password' => Hash::make('guruinformatika123'),
                'is_active' => true,
            ],
            // 5. Guru Pengampu Kelas VII D
            [
                'name' => 'Miratus Sidqiyah, S.Pd',
                'identifier_no' => 'guru_viid',
                'role' => 'guru',
                'class_name' => 'VII D',
                'class_id' => null,
                'password' => Hash::make('guruinformatika123'),
                'is_active' => true,
            ],
        ];

        foreach ($teachers as $data) {
            User::updateOrCreate(
                ['identifier_no' => $data['identifier_no']],
                $data
            );
        }
    }
}
