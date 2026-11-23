<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // 1. Buat Kelas VII-A sampai VII-D
        $classes = [];
        $classNames = ['VII-A', 'VII-B', 'VII-C', 'VII-D'];
        foreach ($classNames as $name) {
            $classes[] = \App\Models\StudyClass::create([
                'name' => $name,
                'academic_year' => '2026/2027',
            ]);
        }

        // 2. Class Settings (Wali Kelas & Guru)
        \App\Models\ClassSetting::create(['class_name' => 'VII-A', 'homeroom_teacher' => 'Mohamad Hardjoko, S.Pd', 'informatics_teacher' => 'M.Khanif Syarifudin, S.Pd']);
        \App\Models\ClassSetting::create(['class_name' => 'VII-B', 'homeroom_teacher' => 'Nur Rohim, S.Sos.,MA', 'informatics_teacher' => 'M. Khanif Syarifudin, S.Pd']);
        \App\Models\ClassSetting::create(['class_name' => 'VII-C', 'homeroom_teacher' => 'Amin Fauzi, S.Pd', 'informatics_teacher' => 'Maya Sekar Kemuning, S.Pd']);
        \App\Models\ClassSetting::create(['class_name' => 'VII-D', 'homeroom_teacher' => 'Miratus Sidqiyah, S.Pd', 'informatics_teacher' => 'Maya Sekar Kemuning, S.Pd']);

        // 3. Akun Guru
        User::factory()->create([
            'name' => 'Tim Guru Informatika',
            'identifier_no' => '0987654321',
            'role' => 'guru',
            'class_id' => null,
            'password' => bcrypt('password123'),
        ]);

        $classIds = ['VII-A' => $classes[0]->id, 'VII-B' => $classes[1]->id, 'VII-C' => $classes[2]->id, 'VII-D' => $classes[3]->id];

        // Setup Class Settings (Wali Kelas & Guru Informatika)

        // Siswa VII-A
        User::factory()->create([
            'name' => 'ABBAD WILDANU AKMAL',
            'identifier_no' => '2816',
            'attendance_number' => '1',
            'role' => 'siswa',
            'class_id' => $classIds['VII-A'],
            'class_name' => 'VII-A',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'ADDI LUHUR WILDAN HANI',
            'identifier_no' => '2817',
            'attendance_number' => '2',
            'role' => 'siswa',
            'class_id' => $classIds['VII-A'],
            'class_name' => 'VII-A',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'ADIB UBAIDILLAH',
            'identifier_no' => '2818',
            'attendance_number' => '3',
            'role' => 'siswa',
            'class_id' => $classIds['VII-A'],
            'class_name' => 'VII-A',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'ADIBA KHANZA',
            'identifier_no' => '2819',
            'attendance_number' => '4',
            'role' => 'siswa',
            'class_id' => $classIds['VII-A'],
            'class_name' => 'VII-A',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'AHMAD ZUFAR NURKHOLIS',
            'identifier_no' => '2820',
            'attendance_number' => '5',
            'role' => 'siswa',
            'class_id' => $classIds['VII-A'],
            'class_name' => 'VII-A',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'AJENG PRAMESTI DEWI SEPTIANI',
            'identifier_no' => '2821',
            'attendance_number' => '6',
            'role' => 'siswa',
            'class_id' => $classIds['VII-A'],
            'class_name' => 'VII-A',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'ALIF FITRA ARINI',
            'identifier_no' => '2822',
            'attendance_number' => '7',
            'role' => 'siswa',
            'class_id' => $classIds['VII-A'],
            'class_name' => 'VII-A',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'ALMEERA LATISYA',
            'identifier_no' => '2823',
            'attendance_number' => '8',
            'role' => 'siswa',
            'class_id' => $classIds['VII-A'],
            'class_name' => 'VII-A',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'ASYIFA ZALFA ZAKIA MAULIDA',
            'identifier_no' => '2824',
            'attendance_number' => '9',
            'role' => 'siswa',
            'class_id' => $classIds['VII-A'],
            'class_name' => 'VII-A',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'ATIYA RAHMA SYAKIRA',
            'identifier_no' => '2825',
            'attendance_number' => '10',
            'role' => 'siswa',
            'class_id' => $classIds['VII-A'],
            'class_name' => 'VII-A',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'BYATRIASA NINDYA PRAMESWARI',
            'identifier_no' => '2826',
            'attendance_number' => '11',
            'role' => 'siswa',
            'class_id' => $classIds['VII-A'],
            'class_name' => 'VII-A',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'DIAZ FAITH IRWANSYAH',
            'identifier_no' => '2827',
            'attendance_number' => '12',
            'role' => 'siswa',
            'class_id' => $classIds['VII-A'],
            'class_name' => 'VII-A',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'FANIA LARISA',
            'identifier_no' => '2828',
            'attendance_number' => '13',
            'role' => 'siswa',
            'class_id' => $classIds['VII-A'],
            'class_name' => 'VII-A',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'MUHAMAD FARHAN ATHAILAH',
            'identifier_no' => '2829',
            'attendance_number' => '14',
            'role' => 'siswa',
            'class_id' => $classIds['VII-A'],
            'class_name' => 'VII-A',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'MUHAMMAD ADZKA HARYONO',
            'identifier_no' => '2830',
            'attendance_number' => '15',
            'role' => 'siswa',
            'class_id' => $classIds['VII-A'],
            'class_name' => 'VII-A',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'MUHAMMAD ALVINO ARDIANSYAH',
            'identifier_no' => '2831',
            'attendance_number' => '16',
            'role' => 'siswa',
            'class_id' => $classIds['VII-A'],
            'class_name' => 'VII-A',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'MUHAMMAD FAHRUL HAIKAL',
            'identifier_no' => '2832',
            'attendance_number' => '17',
            'role' => 'siswa',
            'class_id' => $classIds['VII-A'],
            'class_name' => 'VII-A',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'MUHAMMAD FAJAR ASSIDIQ',
            'identifier_no' => '2833',
            'attendance_number' => '18',
            'role' => 'siswa',
            'class_id' => $classIds['VII-A'],
            'class_name' => 'VII-A',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'MUHAMMAD IRFAN MAULANA',
            'identifier_no' => '2834',
            'attendance_number' => '19',
            'role' => 'siswa',
            'class_id' => $classIds['VII-A'],
            'class_name' => 'VII-A',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'MUHAMMAD KEVIN REZA BRAHMASTA',
            'identifier_no' => '2835',
            'attendance_number' => '20',
            'role' => 'siswa',
            'class_id' => $classIds['VII-A'],
            'class_name' => 'VII-A',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'MUHAMMAD LUTHFI MAHRUS',
            'identifier_no' => '2836',
            'attendance_number' => '21',
            'role' => 'siswa',
            'class_id' => $classIds['VII-A'],
            'class_name' => 'VII-A',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'MUHAMMAD MAULANA IRFANI',
            'identifier_no' => '2837',
            'attendance_number' => '22',
            'role' => 'siswa',
            'class_id' => $classIds['VII-A'],
            'class_name' => 'VII-A',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'MUHAMMAD REYHAN EKA NUGROHO',
            'identifier_no' => '2838',
            'attendance_number' => '23',
            'role' => 'siswa',
            'class_id' => $classIds['VII-A'],
            'class_name' => 'VII-A',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'NAFSANI',
            'identifier_no' => '2839',
            'attendance_number' => '24',
            'role' => 'siswa',
            'class_id' => $classIds['VII-A'],
            'class_name' => 'VII-A',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'NAILA HILDA RAHMANTO',
            'identifier_no' => '2840',
            'attendance_number' => '25',
            'role' => 'siswa',
            'class_id' => $classIds['VII-A'],
            'class_name' => 'VII-A',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'NAYLA NUR AFIEFAH',
            'identifier_no' => '2841',
            'attendance_number' => '26',
            'role' => 'siswa',
            'class_id' => $classIds['VII-A'],
            'class_name' => 'VII-A',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'RARA KHOIRUNNISA',
            'identifier_no' => '2842',
            'attendance_number' => '27',
            'role' => 'siswa',
            'class_id' => $classIds['VII-A'],
            'class_name' => 'VII-A',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'SHIFA CAHYANI ALIYA PUTRI',
            'identifier_no' => '2843',
            'attendance_number' => '28',
            'role' => 'siswa',
            'class_id' => $classIds['VII-A'],
            'class_name' => 'VII-A',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'TSANIA SALSABILA',
            'identifier_no' => '2844',
            'attendance_number' => '29',
            'role' => 'siswa',
            'class_id' => $classIds['VII-A'],
            'class_name' => 'VII-A',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'TSAQIB ANANDA REZA',
            'identifier_no' => '2845',
            'attendance_number' => '30',
            'role' => 'siswa',
            'class_id' => $classIds['VII-A'],
            'class_name' => 'VII-A',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'ULFA KHAERUNNISA',
            'identifier_no' => '2846',
            'attendance_number' => '31',
            'role' => 'siswa',
            'class_id' => $classIds['VII-A'],
            'class_name' => 'VII-A',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'UTARI KHAIRA PRATAMA',
            'identifier_no' => '2847',
            'attendance_number' => '32',
            'role' => 'siswa',
            'class_id' => $classIds['VII-A'],
            'class_name' => 'VII-A',
            'password' => bcrypt('password123'),
        ]);
        // Siswa VII-B
        User::factory()->create([
            'name' => 'ADITYA BAGUS SANTOSO',
            'identifier_no' => '2848',
            'attendance_number' => '1',
            'role' => 'siswa',
            'class_id' => $classIds['VII-B'],
            'class_name' => 'VII-B',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'AHMAD ADYA SURYA',
            'identifier_no' => '2849',
            'attendance_number' => '2',
            'role' => 'siswa',
            'class_id' => $classIds['VII-B'],
            'class_name' => 'VII-B',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'AHMAD IRFAN SANTOSO',
            'identifier_no' => '2850',
            'attendance_number' => '3',
            'role' => 'siswa',
            'class_id' => $classIds['VII-B'],
            'class_name' => 'VII-B',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'ALKHALIFI ZIKRI ARGANTA',
            'identifier_no' => '2851',
            'attendance_number' => '4',
            'role' => 'siswa',
            'class_id' => $classIds['VII-B'],
            'class_name' => 'VII-B',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'ASSYIFA ALYA NAFISA',
            'identifier_no' => '2852',
            'attendance_number' => '5',
            'role' => 'siswa',
            'class_id' => $classIds['VII-B'],
            'class_name' => 'VII-B',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'AYESHA SHAKILA MIKAELA PUTRI',
            'identifier_no' => '2853',
            'attendance_number' => '6',
            'role' => 'siswa',
            'class_id' => $classIds['VII-B'],
            'class_name' => 'VII-B',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'AYRA NUR WIDIYANTI',
            'identifier_no' => '2854',
            'attendance_number' => '7',
            'role' => 'siswa',
            'class_id' => $classIds['VII-B'],
            'class_name' => 'VII-B',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'DANIA ALDHILA AZZAHRA',
            'identifier_no' => '2855',
            'attendance_number' => '8',
            'role' => 'siswa',
            'class_id' => $classIds['VII-B'],
            'class_name' => 'VII-B',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'EZA KHOIRUL NIZAM',
            'identifier_no' => '2856',
            'attendance_number' => '9',
            'role' => 'siswa',
            'class_id' => $classIds['VII-B'],
            'class_name' => 'VII-B',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'FAIZAR RASYID SYAHPUTRA',
            'identifier_no' => '2857',
            'attendance_number' => '10',
            'role' => 'siswa',
            'class_id' => $classIds['VII-B'],
            'class_name' => 'VII-B',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'FEBI KANZA NUR UMAYAH',
            'identifier_no' => '2858',
            'attendance_number' => '11',
            'role' => 'siswa',
            'class_id' => $classIds['VII-B'],
            'class_name' => 'VII-B',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'HESTI AYUNDA MAULIDA',
            'identifier_no' => '2859',
            'attendance_number' => '12',
            'role' => 'siswa',
            'class_id' => $classIds['VII-B'],
            'class_name' => 'VII-B',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'IQBAL ARKAB GHOFUR',
            'identifier_no' => '2860',
            'attendance_number' => '13',
            'role' => 'siswa',
            'class_id' => $classIds['VII-B'],
            'class_name' => 'VII-B',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'IRFANULLOH ALFATIH',
            'identifier_no' => '2861',
            'attendance_number' => '14',
            'role' => 'siswa',
            'class_id' => $classIds['VII-B'],
            'class_name' => 'VII-B',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'KENZO PRATAMA HADIVA',
            'identifier_no' => '2862',
            'attendance_number' => '15',
            'role' => 'siswa',
            'class_id' => $classIds['VII-B'],
            'class_name' => 'VII-B',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'KHANZA MUTIARA PRISCILLA',
            'identifier_no' => '2863',
            'attendance_number' => '16',
            'role' => 'siswa',
            'class_id' => $classIds['VII-B'],
            'class_name' => 'VII-B',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'LATIFATUL AKHFA',
            'identifier_no' => '2864',
            'attendance_number' => '17',
            'role' => 'siswa',
            'class_id' => $classIds['VII-B'],
            'class_name' => 'VII-B',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'MAULIDA IZZATINNAJA',
            'identifier_no' => '2865',
            'attendance_number' => '18',
            'role' => 'siswa',
            'class_id' => $classIds['VII-B'],
            'class_name' => 'VII-B',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'MUHAMMAD ALKAFI SYAHPUTRA',
            'identifier_no' => '2866',
            'attendance_number' => '19',
            'role' => 'siswa',
            'class_id' => $classIds['VII-B'],
            'class_name' => 'VII-B',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'MUHAMMAD FAISAL ARRIZA',
            'identifier_no' => '2867',
            'attendance_number' => '20',
            'role' => 'siswa',
            'class_id' => $classIds['VII-B'],
            'class_name' => 'VII-B',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'MUHAMMAD MAULANA IBRAHIM',
            'identifier_no' => '2868',
            'attendance_number' => '21',
            'role' => 'siswa',
            'class_id' => $classIds['VII-B'],
            'class_name' => 'VII-B',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'MUHAMMAD WAFFI NURIL MAULA',
            'identifier_no' => '2869',
            'attendance_number' => '22',
            'role' => 'siswa',
            'class_id' => $classIds['VII-B'],
            'class_name' => 'VII-B',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'MUKHAMAD SYAFIQ PRATAMA',
            'identifier_no' => '2870',
            'attendance_number' => '23',
            'role' => 'siswa',
            'class_id' => $classIds['VII-B'],
            'class_name' => 'VII-B',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'MUKHAMMAD ZIDAN AL AFGHANI',
            'identifier_no' => '2871',
            'attendance_number' => '24',
            'role' => 'siswa',
            'class_id' => $classIds['VII-B'],
            'class_name' => 'VII-B',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'NUR UMAIRA ATIKA',
            'identifier_no' => '2872',
            'attendance_number' => '25',
            'role' => 'siswa',
            'class_id' => $classIds['VII-B'],
            'class_name' => 'VII-B',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'RANGGA ALVIAN AUREGAR',
            'identifier_no' => '2873',
            'attendance_number' => '26',
            'role' => 'siswa',
            'class_id' => $classIds['VII-B'],
            'class_name' => 'VII-B',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'SASALBILA AYU HANIFAH',
            'identifier_no' => '2874',
            'attendance_number' => '27',
            'role' => 'siswa',
            'class_id' => $classIds['VII-B'],
            'class_name' => 'VII-B',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'SEPTIA NABILLA SHOHIB',
            'identifier_no' => '2875',
            'attendance_number' => '28',
            'role' => 'siswa',
            'class_id' => $classIds['VII-B'],
            'class_name' => 'VII-B',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'SHEILA AURI MAULIDA',
            'identifier_no' => '2876',
            'attendance_number' => '29',
            'role' => 'siswa',
            'class_id' => $classIds['VII-B'],
            'class_name' => 'VII-B',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'SISKA AULIA SIYAM',
            'identifier_no' => '2877',
            'attendance_number' => '30',
            'role' => 'siswa',
            'class_id' => $classIds['VII-B'],
            'class_name' => 'VII-B',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'SITI MUTIARA ZULFA',
            'identifier_no' => '2878',
            'attendance_number' => '31',
            'role' => 'siswa',
            'class_id' => $classIds['VII-B'],
            'class_name' => 'VII-B',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'VIRANA RIFA AZZAHRA',
            'identifier_no' => '2879',
            'attendance_number' => '32',
            'role' => 'siswa',
            'class_id' => $classIds['VII-B'],
            'class_name' => 'VII-B',
            'password' => bcrypt('password123'),
        ]);
        // Siswa VII-C
        User::factory()->create([
            'name' => 'ADELIA SAFIRA PUTRI',
            'identifier_no' => '2880',
            'attendance_number' => '1',
            'role' => 'siswa',
            'class_id' => $classIds['VII-C'],
            'class_name' => 'VII-C',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'ADHYASTHA JARVIS ROSIYANTO',
            'identifier_no' => '2881',
            'attendance_number' => '2',
            'role' => 'siswa',
            'class_id' => $classIds['VII-C'],
            'class_name' => 'VII-C',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'AGAM ABDILLAH PRATAMA',
            'identifier_no' => '2882',
            'attendance_number' => '3',
            'role' => 'siswa',
            'class_id' => $classIds['VII-C'],
            'class_name' => 'VII-C',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'ALVIN IRGA LANGGENG',
            'identifier_no' => '2883',
            'attendance_number' => '4',
            'role' => 'siswa',
            'class_id' => $classIds['VII-C'],
            'class_name' => 'VII-C',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'ANISA APRILIA ZAHRA',
            'identifier_no' => '2884',
            'attendance_number' => '5',
            'role' => 'siswa',
            'class_id' => $classIds['VII-C'],
            'class_name' => 'VII-C',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'AYU ROHMAH',
            'identifier_no' => '2885',
            'attendance_number' => '6',
            'role' => 'siswa',
            'class_id' => $classIds['VII-C'],
            'class_name' => 'VII-C',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'BAYU AFDHAIL',
            'identifier_no' => '2886',
            'attendance_number' => '7',
            'role' => 'siswa',
            'class_id' => $classIds['VII-C'],
            'class_name' => 'VII-C',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'CITRA KIRANA',
            'identifier_no' => '2887',
            'attendance_number' => '8',
            'role' => 'siswa',
            'class_id' => $classIds['VII-C'],
            'class_name' => 'VII-C',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'DIKA SATRIA',
            'identifier_no' => '2888',
            'attendance_number' => '9',
            'role' => 'siswa',
            'class_id' => $classIds['VII-C'],
            'class_name' => 'VII-C',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'EKA NURIL MAULIDA',
            'identifier_no' => '2889',
            'attendance_number' => '10',
            'role' => 'siswa',
            'class_id' => $classIds['VII-C'],
            'class_name' => 'VII-C',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'IQDLIMA',
            'identifier_no' => '2890',
            'attendance_number' => '11',
            'role' => 'siswa',
            'class_id' => $classIds['VII-C'],
            'class_name' => 'VII-C',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'LUSI DWI ARYANI',
            'identifier_no' => '2891',
            'attendance_number' => '12',
            'role' => 'siswa',
            'class_id' => $classIds['VII-C'],
            'class_name' => 'VII-C',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'M FAHRI MAHARDIKA  A',
            'identifier_no' => '2892',
            'attendance_number' => '13',
            'role' => 'siswa',
            'class_id' => $classIds['VII-C'],
            'class_name' => 'VII-C',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'MUHAMAD BAYU IRAWAN',
            'identifier_no' => '2893',
            'attendance_number' => '14',
            'role' => 'siswa',
            'class_id' => $classIds['VII-C'],
            'class_name' => 'VII-C',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'MUHAMMAD AZAMUL MUJIB',
            'identifier_no' => '2894',
            'attendance_number' => '15',
            'role' => 'siswa',
            'class_id' => $classIds['VII-C'],
            'class_name' => 'VII-C',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'MUHAMMAD DHAIF HIFAYAADH',
            'identifier_no' => '2895',
            'attendance_number' => '16',
            'role' => 'siswa',
            'class_id' => $classIds['VII-C'],
            'class_name' => 'VII-C',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'MUHAMMAD HAFIDZ SHOLIKUL KOLIS',
            'identifier_no' => '2896',
            'attendance_number' => '17',
            'role' => 'siswa',
            'class_id' => $classIds['VII-C'],
            'class_name' => 'VII-C',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'MUHAMMAD IRVAN FAREZA',
            'identifier_no' => '2897',
            'attendance_number' => '18',
            'role' => 'siswa',
            'class_id' => $classIds['VII-C'],
            'class_name' => 'VII-C',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'MUHAMMAD RADITYA WAHYU PRATAMA',
            'identifier_no' => '2898',
            'attendance_number' => '19',
            'role' => 'siswa',
            'class_id' => $classIds['VII-C'],
            'class_name' => 'VII-C',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'MUHAMMAD REYHAN ALFATIH',
            'identifier_no' => '2899',
            'attendance_number' => '20',
            'role' => 'siswa',
            'class_id' => $classIds['VII-C'],
            'class_name' => 'VII-C',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'MUHAMMAD RYAN ADHYASTA',
            'identifier_no' => '2900',
            'attendance_number' => '21',
            'role' => 'siswa',
            'class_id' => $classIds['VII-C'],
            'class_name' => 'VII-C',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'NAILATUL MUFIDAH',
            'identifier_no' => '2901',
            'attendance_number' => '22',
            'role' => 'siswa',
            'class_id' => $classIds['VII-C'],
            'class_name' => 'VII-C',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'NOFI LESTARI ANGGRAINI',
            'identifier_no' => '2902',
            'attendance_number' => '23',
            'role' => 'siswa',
            'class_id' => $classIds['VII-C'],
            'class_name' => 'VII-C',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'NOVAL SATRIA PRATAMA',
            'identifier_no' => '2903',
            'attendance_number' => '24',
            'role' => 'siswa',
            'class_id' => $classIds['VII-C'],
            'class_name' => 'VII-C',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'NUR DWI APRILIA ANGGRAENI',
            'identifier_no' => '2904',
            'attendance_number' => '25',
            'role' => 'siswa',
            'class_id' => $classIds['VII-C'],
            'class_name' => 'VII-C',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'RAFANDA GISA KAIRINNISWA',
            'identifier_no' => '2905',
            'attendance_number' => '26',
            'role' => 'siswa',
            'class_id' => $classIds['VII-C'],
            'class_name' => 'VII-C',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'RIZA KHOLQIH AL FAIZ',
            'identifier_no' => '2906',
            'attendance_number' => '27',
            'role' => 'siswa',
            'class_id' => $classIds['VII-C'],
            'class_name' => 'VII-C',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'SALWA PUTRI IZZATUN PADMA',
            'identifier_no' => '2907',
            'attendance_number' => '28',
            'role' => 'siswa',
            'class_id' => $classIds['VII-C'],
            'class_name' => 'VII-C',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'SELFIANA SAFITRI',
            'identifier_no' => '2908',
            'attendance_number' => '29',
            'role' => 'siswa',
            'class_id' => $classIds['VII-C'],
            'class_name' => 'VII-C',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'SHOFA AULIYA',
            'identifier_no' => '2909',
            'attendance_number' => '30',
            'role' => 'siswa',
            'class_id' => $classIds['VII-C'],
            'class_name' => 'VII-C',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'TALITA HASNA HUMAIRA',
            'identifier_no' => '2910',
            'attendance_number' => '31',
            'role' => 'siswa',
            'class_id' => $classIds['VII-C'],
            'class_name' => 'VII-C',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'ZULIANI RAHMAN',
            'identifier_no' => '2911',
            'attendance_number' => '32',
            'role' => 'siswa',
            'class_id' => $classIds['VII-C'],
            'class_name' => 'VII-C',
            'password' => bcrypt('password123'),
        ]);
        // Siswa VII-D
        User::factory()->create([
            'name' => 'ABDULLOH FAHAD AL MUBAROK',
            'identifier_no' => '2912',
            'attendance_number' => '1',
            'role' => 'siswa',
            'class_id' => $classIds['VII-D'],
            'class_name' => 'VII-D',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'ACHMAD AFFANDI',
            'identifier_no' => '2913',
            'attendance_number' => '2',
            'role' => 'siswa',
            'class_id' => $classIds['VII-D'],
            'class_name' => 'VII-D',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'ADEEVA AFSHEEN FATINA',
            'identifier_no' => '2914',
            'attendance_number' => '3',
            'role' => 'siswa',
            'class_id' => $classIds['VII-D'],
            'class_name' => 'VII-D',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'ADHI FIRMANSYAH',
            'identifier_no' => '2915',
            'attendance_number' => '4',
            'role' => 'siswa',
            'class_id' => $classIds['VII-D'],
            'class_name' => 'VII-D',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'AERRILYN BELLVANIA AMZARI',
            'identifier_no' => '2916',
            'attendance_number' => '5',
            'role' => 'siswa',
            'class_id' => $classIds['VII-D'],
            'class_name' => 'VII-D',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'AHMAD IMAM MUZAKKI',
            'identifier_no' => '2917',
            'attendance_number' => '6',
            'role' => 'siswa',
            'class_id' => $classIds['VII-D'],
            'class_name' => 'VII-D',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'AKBAR VICTOR RAMADHAN',
            'identifier_no' => '2918',
            'attendance_number' => '7',
            'role' => 'siswa',
            'class_id' => $classIds['VII-D'],
            'class_name' => 'VII-D',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'ALDENIO FEBRILIAN SIRURU',
            'identifier_no' => '2919',
            'attendance_number' => '8',
            'role' => 'siswa',
            'class_id' => $classIds['VII-D'],
            'class_name' => 'VII-D',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'BINTANG INDRA NURAHMAN',
            'identifier_no' => '2920',
            'attendance_number' => '9',
            'role' => 'siswa',
            'class_id' => $classIds['VII-D'],
            'class_name' => 'VII-D',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'DAFFA IBNU ALMUZACKY',
            'identifier_no' => '2921',
            'attendance_number' => '10',
            'role' => 'siswa',
            'class_id' => $classIds['VII-D'],
            'class_name' => 'VII-D',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'EVITA MAHARANI AGUSTIN NOVRIATY',
            'identifier_no' => '2922',
            'attendance_number' => '11',
            'role' => 'siswa',
            'class_id' => $classIds['VII-D'],
            'class_name' => 'VII-D',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'FAEYZA AQEELA PUTRI',
            'identifier_no' => '2923',
            'attendance_number' => '12',
            'role' => 'siswa',
            'class_id' => $classIds['VII-D'],
            'class_name' => 'VII-D',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'HABIBIE RAMDAN PRATAMA',
            'identifier_no' => '2924',
            'attendance_number' => '13',
            'role' => 'siswa',
            'class_id' => $classIds['VII-D'],
            'class_name' => 'VII-D',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'HAFIZ ARSYAD FAJAR',
            'identifier_no' => '2925',
            'attendance_number' => '14',
            'role' => 'siswa',
            'class_id' => $classIds['VII-D'],
            'class_name' => 'VII-D',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'HANIFA FAHMA BELA',
            'identifier_no' => '2926',
            'attendance_number' => '15',
            'role' => 'siswa',
            'class_id' => $classIds['VII-D'],
            'class_name' => 'VII-D',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'KHASANUL LUTHFI ARDIANSYAH',
            'identifier_no' => '2927',
            'attendance_number' => '16',
            'role' => 'siswa',
            'class_id' => $classIds['VII-D'],
            'class_name' => 'VII-D',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'MELLODY SYIFANNYLA GHAZALI',
            'identifier_no' => '2928',
            'attendance_number' => '17',
            'role' => 'siswa',
            'class_id' => $classIds['VII-D'],
            'class_name' => 'VII-D',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'MUHAMMAD ALIF ALFATAH',
            'identifier_no' => '2929',
            'attendance_number' => '18',
            'role' => 'siswa',
            'class_id' => $classIds['VII-D'],
            'class_name' => 'VII-D',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'MUHAMMAD REZA DAVA MAULANA',
            'identifier_no' => '2930',
            'attendance_number' => '19',
            'role' => 'siswa',
            'class_id' => $classIds['VII-D'],
            'class_name' => 'VII-D',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'MUHAMMAD ZIDDAN',
            'identifier_no' => '2931',
            'attendance_number' => '20',
            'role' => 'siswa',
            'class_id' => $classIds['VII-D'],
            'class_name' => 'VII-D',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'NADA NILA SAFIRA',
            'identifier_no' => '2932',
            'attendance_number' => '21',
            'role' => 'siswa',
            'class_id' => $classIds['VII-D'],
            'class_name' => 'VII-D',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'NADINE SYERIN ALANA',
            'identifier_no' => '2933',
            'attendance_number' => '22',
            'role' => 'siswa',
            'class_id' => $classIds['VII-D'],
            'class_name' => 'VII-D',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'NAGITA DWI ARIANI',
            'identifier_no' => '2934',
            'attendance_number' => '23',
            'role' => 'siswa',
            'class_id' => $classIds['VII-D'],
            'class_name' => 'VII-D',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'NAILA QURRATUL A\'YUN',
            'identifier_no' => '2935',
            'attendance_number' => '24',
            'role' => 'siswa',
            'class_id' => $classIds['VII-D'],
            'class_name' => 'VII-D',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'NAJWA KHAIRA WILDA',
            'identifier_no' => '2936',
            'attendance_number' => '25',
            'role' => 'siswa',
            'class_id' => $classIds['VII-D'],
            'class_name' => 'VII-D',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'NAURA HASNA ANNIDA',
            'identifier_no' => '2937',
            'attendance_number' => '26',
            'role' => 'siswa',
            'class_id' => $classIds['VII-D'],
            'class_name' => 'VII-D',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'RHEZA AFIF PRATAMA',
            'identifier_no' => '2938',
            'attendance_number' => '27',
            'role' => 'siswa',
            'class_id' => $classIds['VII-D'],
            'class_name' => 'VII-D',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'SALSA NABILA SEPTIANA',
            'identifier_no' => '2939',
            'attendance_number' => '28',
            'role' => 'siswa',
            'class_id' => $classIds['VII-D'],
            'class_name' => 'VII-D',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'SALSABILA NADHIFA CAHYANI',
            'identifier_no' => '2940',
            'attendance_number' => '29',
            'role' => 'siswa',
            'class_id' => $classIds['VII-D'],
            'class_name' => 'VII-D',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'SETIO DWI KUNCORO',
            'identifier_no' => '2941',
            'attendance_number' => '30',
            'role' => 'siswa',
            'class_id' => $classIds['VII-D'],
            'class_name' => 'VII-D',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'WAHYU NUR AZIZAH',
            'identifier_no' => '2942',
            'attendance_number' => '31',
            'role' => 'siswa',
            'class_id' => $classIds['VII-D'],
            'class_name' => 'VII-D',
            'password' => bcrypt('password123'),
        ]);
        User::factory()->create([
            'name' => 'ZULIANA RAHMAN',
            'identifier_no' => '2943',
            'attendance_number' => '32',
            'role' => 'siswa',
            'class_id' => $classIds['VII-D'],
            'class_name' => 'VII-D',
            'password' => bcrypt('password123'),
        ]);


        // 4. Buat Bab / Topik Pembelajaran
        $topic1 = \App\Models\Topic::create([
            'title' => 'Berpikir Komputasional',
            'description' => 'Mempelajari dasar-dasar logika dan pemecahan masalah',
            'order_number' => 1,
            'is_active' => true,
        ]);

        $topic2 = \App\Models\Topic::create([
            'title' => 'Teknologi Informasi & Komunikasi',
            'description' => 'Pengenalan perangkat keras, lunak, dan aplikasi perkantoran',
            'order_number' => 2,
            'is_active' => true,
        ]);

        // 5. Buat Materi Dummy
        \App\Models\Material::create([
            'topic_id' => $topic1->id,
            'title' => 'Pengenalan Algoritma',
            'content_text' => 'Algoritma adalah langkah-langkah logis untuk menyelesaikan masalah...',
            'estimated_read_time' => 15,
            'order_number' => 1,
            'target_classes' => ['VII-A', 'VII-B', 'VII-C', 'VII-D']
        ]);

        // 6. Buat Tugas Dummy
        \App\Models\Assignment::create([
            'title' => 'Tugas 1: Membuat Flowchart',
            'command_text' => 'Buatlah flowchart sederhana tentang cara membuat mi instan.',
            'instruction' => 'Kerjakan di buku tulis, foto, dan kumpul dalam bentuk JPG/PNG.',
            'deadline' => now()->addDays(7),
            'max_points' => 100,
            'target_classes' => ['VII-A', 'VII-B', 'VII-C', 'VII-D']
        ]);
        
        \App\Models\Assignment::create([
            'title' => 'Tugas 2: Algoritma Kehidupan Sehari-hari',
            'command_text' => 'Tuliskan 3 algoritma yang kamu gunakan setiap hari.',
            'instruction' => 'Kumpulkan dalam bentuk PDF.',
            'deadline' => now()->addDays(3),
            'max_points' => 100,
            'target_classes' => ['VII-A'] // Khusus VII-A
        ]);
    }
}
