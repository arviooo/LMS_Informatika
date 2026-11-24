<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // 1. Buat Kelas VII-A sampai VII-D (aman dijalankan ulang & tanpa Faker)
        $classNames = ['VII-A', 'VII-B', 'VII-C', 'VII-D'];
        foreach ($classNames as $name) {
            \App\Models\StudyClass::firstOrCreate(
                ['name' => $name],
                ['academic_year' => '2026/2027']
            );
        }

        // 2. Sinkronkan Akun Guru (default koordinator: guruinformatika / guruinformatika123)
        //    dan Akun Siswa (default password: spentigu123) + Class Settings
        $this->call([
            TeacherAccountsSeeder::class,
            RealStudentSeeder::class,
        ]);

        // 3. Buat Bab / Topik Pembelajaran Awal jika belum ada
        $topic1 = \App\Models\Topic::firstOrCreate(
            ['title' => 'Berpikir Komputasional'],
            [
                'description' => 'Mempelajari dasar-dasar logika dan pemecahan masalah',
                'order_number' => 1,
                'is_active' => true,
            ]
        );

        \App\Models\Topic::firstOrCreate(
            ['title' => 'Teknologi Informasi & Komunikasi'],
            [
                'description' => 'Pengenalan perangkat keras, lunak, dan aplikasi perkantoran',
                'order_number' => 2,
                'is_active' => true,
            ]
        );

        // 4. Buat Materi Awal jika belum ada
        \App\Models\Material::firstOrCreate(
            ['topic_id' => $topic1->id, 'title' => 'Pengenalan Algoritma'],
            [
                'content_text' => 'Algoritma adalah langkah-langkah logis untuk menyelesaikan masalah...',
                'estimated_read_time' => 15,
                'order_number' => 1,
                'target_classes' => ['VII-A', 'VII-B', 'VII-C', 'VII-D'],
            ]
        );

        // 5. Buat Tugas Awal jika belum ada
        \App\Models\Assignment::firstOrCreate(
            ['title' => 'Tugas 1: Membuat Flowchart'],
            [
                'command_text' => 'Buatlah flowchart sederhana tentang cara membuat mi instan.',
                'instruction' => 'Kerjakan di buku tulis, foto, dan kumpul dalam bentuk JPG/PNG.',
                'deadline' => now()->addDays(7),
                'max_points' => 100,
                'target_classes' => ['VII-A', 'VII-B', 'VII-C', 'VII-D'],
            ]
        );

        \App\Models\Assignment::firstOrCreate(
            ['title' => 'Tugas 2: Algoritma Kehidupan Sehari-hari'],
            [
                'command_text' => 'Tuliskan 3 algoritma yang kamu gunakan setiap hari.',
                'instruction' => 'Kumpulkan dalam bentuk PDF.',
                'deadline' => now()->addDays(3),
                'max_points' => 100,
                'target_classes' => ['VII-A'],
            ]
        );
    }
}
