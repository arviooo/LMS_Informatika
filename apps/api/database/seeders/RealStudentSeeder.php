<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\ClassSetting;

class RealStudentSeeder extends Seeder
{
    public function run()
    {
        $students = [
            // Kelas VII A
            ['absen' => '1', 'induk' => '2816', 'name' => 'ABBAD WILDANU AKMAL', 'gender' => 'L', 'class' => 'VII A'],
            ['absen' => '2', 'induk' => '2817', 'name' => 'ADDI LUHUR WILDAN HANI', 'gender' => 'L', 'class' => 'VII A'],
            ['absen' => '3', 'induk' => '2818', 'name' => 'ADIB UBAIDILLAH', 'gender' => 'L', 'class' => 'VII A'],
            ['absen' => '4', 'induk' => '2819', 'name' => 'ADIBA KHANZA', 'gender' => 'P', 'class' => 'VII A'],
            ['absen' => '5', 'induk' => '2820', 'name' => 'AHMAD ZUFAR NURKHOLIS', 'gender' => 'L', 'class' => 'VII A'],
            ['absen' => '6', 'induk' => '2821', 'name' => 'AJENG PRAMESTI DEWI SEPTIANI', 'gender' => 'P', 'class' => 'VII A'],
            ['absen' => '7', 'induk' => '2822', 'name' => 'ALIF FITRA ARINI', 'gender' => 'P', 'class' => 'VII A'],
            ['absen' => '8', 'induk' => '2823', 'name' => 'ALMEERA LATISYA', 'gender' => 'P', 'class' => 'VII A'],
            ['absen' => '9', 'induk' => '2824', 'name' => 'ASYIFA ZALFA ZAKIA MAULIDA', 'gender' => 'P', 'class' => 'VII A'],
            ['absen' => '10', 'induk' => '2825', 'name' => 'ATIYA RAHMA SYAKIRA', 'gender' => 'P', 'class' => 'VII A'],
            ['absen' => '11', 'induk' => '2826', 'name' => 'BYATRIASA NINDYA PRAMESWARI', 'gender' => 'P', 'class' => 'VII A'],
            ['absen' => '12', 'induk' => '2827', 'name' => 'DIAZ FAITH IRWANSYAH', 'gender' => 'L', 'class' => 'VII A'],
            ['absen' => '13', 'induk' => '2828', 'name' => 'FANIA LARISA', 'gender' => 'P', 'class' => 'VII A'],
            ['absen' => '14', 'induk' => '2829', 'name' => 'MUHAMAD FARHAN ATHAILAH', 'gender' => 'L', 'class' => 'VII A'],
            ['absen' => '15', 'induk' => '2830', 'name' => 'MUHAMMAD ADZKA HARYONO', 'gender' => 'L', 'class' => 'VII A'],
            ['absen' => '16', 'induk' => '2831', 'name' => 'MUHAMMAD ALVINO ARDIANSYAH', 'gender' => 'L', 'class' => 'VII A'],
            ['absen' => '17', 'induk' => '2832', 'name' => 'MUHAMMAD FAHRUL HAIKAL', 'gender' => 'L', 'class' => 'VII A'],
            ['absen' => '18', 'induk' => '2833', 'name' => 'MUHAMMAD FAJAR ASSIDIQ', 'gender' => 'L', 'class' => 'VII A'],
            ['absen' => '19', 'induk' => '2834', 'name' => 'MUHAMMAD IRFAN MAULANA', 'gender' => 'L', 'class' => 'VII A'],
            ['absen' => '20', 'induk' => '2835', 'name' => 'MUHAMMAD KEVIN REZA BRAHMASTA', 'gender' => 'L', 'class' => 'VII A'],
            ['absen' => '21', 'induk' => '2836', 'name' => 'MUHAMMAD LUTHFI MAHRUS', 'gender' => 'L', 'class' => 'VII A'],
            ['absen' => '22', 'induk' => '2837', 'name' => 'MUHAMMAD MAULANA IRFANI', 'gender' => 'L', 'class' => 'VII A'],
            ['absen' => '23', 'induk' => '2838', 'name' => 'MUHAMMAD REYHAN EKA NUGROHO', 'gender' => 'L', 'class' => 'VII A'],
            ['absen' => '24', 'induk' => '2839', 'name' => 'NAFSANI', 'gender' => 'P', 'class' => 'VII A'],
            ['absen' => '25', 'induk' => '2840', 'name' => 'NAILA HILDA RAHMANTO', 'gender' => 'P', 'class' => 'VII A'],
            ['absen' => '26', 'induk' => '2841', 'name' => 'NAYLA NUR AFIEFAH', 'gender' => 'P', 'class' => 'VII A'],
            ['absen' => '27', 'induk' => '2842', 'name' => 'RARA KHOIRUNNISA', 'gender' => 'P', 'class' => 'VII A'],
            ['absen' => '28', 'induk' => '2843', 'name' => 'SHIFA CAHYANI ALIYA PUTRI', 'gender' => 'P', 'class' => 'VII A'],
            ['absen' => '29', 'induk' => '2844', 'name' => 'TSANIA SALSABILA', 'gender' => 'P', 'class' => 'VII A'],
            ['absen' => '30', 'induk' => '2845', 'name' => 'TSAQIB ANANDA REZA', 'gender' => 'L', 'class' => 'VII A'],
            ['absen' => '31', 'induk' => '2846', 'name' => 'ULFA KHAERUNNISA', 'gender' => 'P', 'class' => 'VII A'],
            ['absen' => '32', 'induk' => '2847', 'name' => 'UTARI KHAIRA PRATAMA', 'gender' => 'P', 'class' => 'VII A'],

            // Kelas VII B
            ['absen' => '1', 'induk' => '2848', 'name' => 'ADITYA BAGUS SANTOSO', 'gender' => 'L', 'class' => 'VII B'],
            ['absen' => '2', 'induk' => '2849', 'name' => 'AHMAD ADYA SURYA', 'gender' => 'L', 'class' => 'VII B'],
            ['absen' => '3', 'induk' => '2850', 'name' => 'AHMAD IRFAN SANTOSO', 'gender' => 'L', 'class' => 'VII B'],
            ['absen' => '4', 'induk' => '2851', 'name' => 'ALKHALIFI ZIKRI ARGANTA', 'gender' => 'L', 'class' => 'VII B'],
            ['absen' => '5', 'induk' => '2852', 'name' => 'ASSYIFA ALYA NAFISA', 'gender' => 'P', 'class' => 'VII B'],
            ['absen' => '6', 'induk' => '2853', 'name' => 'AYESHA SHAKILA MIKAELA PUTRI', 'gender' => 'P', 'class' => 'VII B'],
            ['absen' => '7', 'induk' => '2854', 'name' => 'AYRA NUR WIDIYANTI', 'gender' => 'P', 'class' => 'VII B'],
            ['absen' => '8', 'induk' => '2855', 'name' => 'DANIA ALDHILA AZZAHRA', 'gender' => 'P', 'class' => 'VII B'],
            ['absen' => '9', 'induk' => '2856', 'name' => 'EZA KHOIRUL NIZAM', 'gender' => 'L', 'class' => 'VII B'],
            ['absen' => '10', 'induk' => '2857', 'name' => 'FAIZAR RASYID SYAHPUTRA', 'gender' => 'L', 'class' => 'VII B'],
            ['absen' => '11', 'induk' => '2858', 'name' => 'FEBI KANZA NUR UMAYAH', 'gender' => 'P', 'class' => 'VII B'],
            ['absen' => '12', 'induk' => '2859', 'name' => 'HESTI AYUNDA MAULIDA', 'gender' => 'P', 'class' => 'VII B'],
            ['absen' => '13', 'induk' => '2860', 'name' => 'IQBAL ARKAB GHOFUR', 'gender' => 'L', 'class' => 'VII B'],
            ['absen' => '14', 'induk' => '2861', 'name' => 'IRFANULLOH ALFATIH', 'gender' => 'L', 'class' => 'VII B'],
            ['absen' => '15', 'induk' => '2862', 'name' => 'KENZO PRATAMA HADIVA', 'gender' => 'L', 'class' => 'VII B'],
            ['absen' => '16', 'induk' => '2863', 'name' => 'KHANZA MUTIARA PRISCILLA', 'gender' => 'P', 'class' => 'VII B'],
            ['absen' => '17', 'induk' => '2864', 'name' => 'LATIFATUL AKHFA', 'gender' => 'P', 'class' => 'VII B'],
            ['absen' => '18', 'induk' => '2865', 'name' => 'MAULIDA IZZATINNAJA', 'gender' => 'P', 'class' => 'VII B'],
            ['absen' => '19', 'induk' => '2866', 'name' => 'MUHAMMAD ALKAFI SYAHPUTRA', 'gender' => 'L', 'class' => 'VII B'],
            ['absen' => '20', 'induk' => '2867', 'name' => 'MUHAMMAD FAISAL ARRIZA', 'gender' => 'L', 'class' => 'VII B'],
            ['absen' => '21', 'induk' => '2868', 'name' => 'MUHAMMAD MAULANA IBRAHIM', 'gender' => 'L', 'class' => 'VII B'],
            ['absen' => '22', 'induk' => '2869', 'name' => 'MUHAMMAD WAFFI NURIL MAULA', 'gender' => 'L', 'class' => 'VII B'],
            ['absen' => '23', 'induk' => '2870', 'name' => 'MUKHAMAD SYAFIQ PRATAMA', 'gender' => 'L', 'class' => 'VII B'],
            ['absen' => '24', 'induk' => '2871', 'name' => 'MUKHAMMAD ZIDAN AL AFGHANI', 'gender' => 'L', 'class' => 'VII B'],
            ['absen' => '25', 'induk' => '2872', 'name' => 'NUR UMAIRA ATIKA', 'gender' => 'P', 'class' => 'VII B'],
            ['absen' => '26', 'induk' => '2873', 'name' => 'RANGGA ALVIAN AUREGAR', 'gender' => 'L', 'class' => 'VII B'],
            ['absen' => '27', 'induk' => '2874', 'name' => 'SASALBILA AYU HANIFAH', 'gender' => 'P', 'class' => 'VII B'],
            ['absen' => '28', 'induk' => '2875', 'name' => 'SEPTIA NABILLA SHOHIB', 'gender' => 'P', 'class' => 'VII B'],
            ['absen' => '29', 'induk' => '2876', 'name' => 'SHEILA AURI MAULIDA', 'gender' => 'P', 'class' => 'VII B'],
            ['absen' => '30', 'induk' => '2877', 'name' => 'SISKA AULIA SIYAM', 'gender' => 'P', 'class' => 'VII B'],
            ['absen' => '31', 'induk' => '2878', 'name' => 'SITI MUTIARA ZULFA', 'gender' => 'P', 'class' => 'VII B'],
            ['absen' => '32', 'induk' => '2879', 'name' => 'VIRANA RIFA AZZAHRA', 'gender' => 'P', 'class' => 'VII B'],

            // Kelas VII C
            ['absen' => '1', 'induk' => '2880', 'name' => 'ADELIA SAFIRA PUTRI', 'gender' => 'P', 'class' => 'VII C'],
            ['absen' => '2', 'induk' => '2881', 'name' => 'ADHYASTHA JARVIS ROSIYANTO', 'gender' => 'L', 'class' => 'VII C'],
            ['absen' => '3', 'induk' => '2882', 'name' => 'AGAM ABDILLAH PRATAMA', 'gender' => 'L', 'class' => 'VII C'],
            ['absen' => '4', 'induk' => '2883', 'name' => 'ALVIN IRGA LANGGENG', 'gender' => 'L', 'class' => 'VII C'],
            ['absen' => '5', 'induk' => '2884', 'name' => 'ANISA APRILIA ZAHRA', 'gender' => 'P', 'class' => 'VII C'],
            ['absen' => '6', 'induk' => '2885', 'name' => 'AYU ROHMAH', 'gender' => 'P', 'class' => 'VII C'],
            ['absen' => '7', 'induk' => '2886', 'name' => 'BAYU AFDHAIL', 'gender' => 'L', 'class' => 'VII C'],
            ['absen' => '8', 'induk' => '2887', 'name' => 'CITRA KIRANA', 'gender' => 'P', 'class' => 'VII C'],
            ['absen' => '9', 'induk' => '2888', 'name' => 'DIKA SATRIA', 'gender' => 'L', 'class' => 'VII C'],
            ['absen' => '10', 'induk' => '2889', 'name' => 'EKA NURIL MAULIDA', 'gender' => 'P', 'class' => 'VII C'],
            ['absen' => '11', 'induk' => '2890', 'name' => 'IQDLIMA', 'gender' => 'P', 'class' => 'VII C'],
            ['absen' => '12', 'induk' => '2891', 'name' => 'LUSI DWI ARYANI', 'gender' => 'P', 'class' => 'VII C'],
            ['absen' => '13', 'induk' => '2892', 'name' => 'M FAHRI MAHARDIKA A', 'gender' => 'L', 'class' => 'VII C'],
            ['absen' => '14', 'induk' => '2893', 'name' => 'MUHAMAD BAYU IRAWAN', 'gender' => 'L', 'class' => 'VII C'],
            ['absen' => '15', 'induk' => '2894', 'name' => 'MUHAMMAD AZAMUL MUJIB', 'gender' => 'L', 'class' => 'VII C'],
            ['absen' => '16', 'induk' => '2895', 'name' => 'MUHAMMAD DHAIF HIFAYAADH', 'gender' => 'L', 'class' => 'VII C'],
            ['absen' => '17', 'induk' => '2896', 'name' => 'MUHAMMAD HAFIDZ SHOLIKUL KOLIS', 'gender' => 'L', 'class' => 'VII C'],
            ['absen' => '18', 'induk' => '2897', 'name' => 'MUHAMMAD IRVAN FAREZA', 'gender' => 'L', 'class' => 'VII C'],
            ['absen' => '19', 'induk' => '2898', 'name' => 'MUHAMMAD RADITYA WAHYU PRATAMA', 'gender' => 'L', 'class' => 'VII C'],
            ['absen' => '20', 'induk' => '2899', 'name' => 'MUHAMMAD REYHAN ALFATIH', 'gender' => 'L', 'class' => 'VII C'],
            ['absen' => '21', 'induk' => '2900', 'name' => 'MUHAMMAD RYAN ADHYASTA', 'gender' => 'L', 'class' => 'VII C'],
            ['absen' => '22', 'induk' => '2901', 'name' => 'NAILATUL MUFIDAH', 'gender' => 'P', 'class' => 'VII C'],
            ['absen' => '23', 'induk' => '2902', 'name' => 'NOFI LESTARI ANGGRAINI', 'gender' => 'P', 'class' => 'VII C'],
            ['absen' => '24', 'induk' => '2903', 'name' => 'NOVAL SATRIA PRATAMA', 'gender' => 'L', 'class' => 'VII C'],
            ['absen' => '25', 'induk' => '2904', 'name' => 'NUR DWI APRILIA ANGGRAENI', 'gender' => 'P', 'class' => 'VII C'],
            ['absen' => '26', 'induk' => '2905', 'name' => 'RAFANDA GISA KAIRINNISWA', 'gender' => 'P', 'class' => 'VII C'],
            ['absen' => '27', 'induk' => '2906', 'name' => 'RIZA KHOLQIH AL FAIZ', 'gender' => 'L', 'class' => 'VII C'],
            ['absen' => '28', 'induk' => '2907', 'name' => 'SALWA PUTRI IZZATUN PADMA', 'gender' => 'P', 'class' => 'VII C'],
            ['absen' => '29', 'induk' => '2908', 'name' => 'SELFIANA SAFITRI', 'gender' => 'P', 'class' => 'VII C'],
            ['absen' => '30', 'induk' => '2909', 'name' => 'SHOFA AULIYA', 'gender' => 'P', 'class' => 'VII C'],
            ['absen' => '31', 'induk' => '2910', 'name' => 'TALITA HASNA HUMAIRA', 'gender' => 'P', 'class' => 'VII C'],
            ['absen' => '32', 'induk' => '2911', 'name' => 'ZULIANI RAHMAN', 'gender' => 'P', 'class' => 'VII C'],

            // Kelas VII D
            ['absen' => '1', 'induk' => '2912', 'name' => 'ABDULLOH FAHAD AL MUBAROK', 'gender' => 'L', 'class' => 'VII D'],
            ['absen' => '2', 'induk' => '2913', 'name' => 'ACHMAD AFFANDI', 'gender' => 'L', 'class' => 'VII D'],
            ['absen' => '3', 'induk' => '2914', 'name' => 'ADEEVA AFSHEEN FATINA', 'gender' => 'P', 'class' => 'VII D'],
            ['absen' => '4', 'induk' => '2915', 'name' => 'ADHI FIRMANSYAH', 'gender' => 'L', 'class' => 'VII D'],
            ['absen' => '5', 'induk' => '2916', 'name' => 'AERRILYN BELLVANIA AMZARI', 'gender' => 'P', 'class' => 'VII D'],
            ['absen' => '6', 'induk' => '2917', 'name' => 'AHMAD IMAM MUZAKKI', 'gender' => 'L', 'class' => 'VII D'],
            ['absen' => '7', 'induk' => '2918', 'name' => 'AKBAR VICTOR RAMADHAN', 'gender' => 'L', 'class' => 'VII D'],
            ['absen' => '8', 'induk' => '2919', 'name' => 'ALDENIO FEBRILIAN SIRURU', 'gender' => 'L', 'class' => 'VII D'],
            ['absen' => '9', 'induk' => '2920', 'name' => 'BINTANG INDRA NURAHMAN', 'gender' => 'L', 'class' => 'VII D'],
            ['absen' => '10', 'induk' => '2921', 'name' => 'DAFFA IBNU ALMUZACKY', 'gender' => 'L', 'class' => 'VII D'],
            ['absen' => '11', 'induk' => '2922', 'name' => 'EVITA MAHARANI AGUSTIN NOVRIATY', 'gender' => 'P', 'class' => 'VII D'],
            ['absen' => '12', 'induk' => '2923', 'name' => 'FAEYZA AQEELA PUTRI', 'gender' => 'P', 'class' => 'VII D'],
            ['absen' => '13', 'induk' => '2924', 'name' => 'HABIBIE RAMDAN PRATAMA', 'gender' => 'L', 'class' => 'VII D'],
            ['absen' => '14', 'induk' => '2925', 'name' => 'HAFIZ ARSYAD FAJAR', 'gender' => 'L', 'class' => 'VII D'],
            ['absen' => '15', 'induk' => '2926', 'name' => 'HANIFA FAHMA BELA', 'gender' => 'P', 'class' => 'VII D'],
            ['absen' => '16', 'induk' => '2927', 'name' => 'KHASANUL LUTHFI ARDIANSYAH', 'gender' => 'L', 'class' => 'VII D'],
            ['absen' => '17', 'induk' => '2928', 'name' => 'MELLODY SYIFANNYLA GHAZALI', 'gender' => 'P', 'class' => 'VII D'],
            ['absen' => '18', 'induk' => '2929', 'name' => 'MUHAMMAD ALIF ALFATAH', 'gender' => 'L', 'class' => 'VII D'],
            ['absen' => '19', 'induk' => '2930', 'name' => 'MUHAMMAD REZA DAVA MAULANA', 'gender' => 'L', 'class' => 'VII D'],
            ['absen' => '20', 'induk' => '2931', 'name' => 'MUHAMMAD ZIDDAN', 'gender' => 'L', 'class' => 'VII D'],
            ['absen' => '21', 'induk' => '2932', 'name' => 'NADA NILA SAFIRA', 'gender' => 'P', 'class' => 'VII D'],
            ['absen' => '22', 'induk' => '2933', 'name' => 'NADINE SYERIN ALANA', 'gender' => 'P', 'class' => 'VII D'],
            ['absen' => '23', 'induk' => '2934', 'name' => 'NAGITA DWI ARIANI', 'gender' => 'P', 'class' => 'VII D'],
            ['absen' => '24', 'induk' => '2935', 'name' => 'NAILA QURRATUL A\'YUN', 'gender' => 'P', 'class' => 'VII D'],
            ['absen' => '25', 'induk' => '2936', 'name' => 'NAJWA KHAIRA WILDA', 'gender' => 'P', 'class' => 'VII D'],
            ['absen' => '26', 'induk' => '2937', 'name' => 'NAURA HASNA ANNIDA', 'gender' => 'P', 'class' => 'VII D'],
            ['absen' => '27', 'induk' => '2938', 'name' => 'RHEZA AFIF PRATAMA', 'gender' => 'L', 'class' => 'VII D'],
            ['absen' => '28', 'induk' => '2939', 'name' => 'SALSA NABILA SEPTIANA', 'gender' => 'P', 'class' => 'VII D'],
            ['absen' => '29', 'induk' => '2940', 'name' => 'SALSABILA NADHIFA CAHYANI', 'gender' => 'P', 'class' => 'VII D'],
            ['absen' => '30', 'induk' => '2941', 'name' => 'SETIO DWI KUNCORO', 'gender' => 'L', 'class' => 'VII D'],
            ['absen' => '31', 'induk' => '2942', 'name' => 'WAHYU NUR AZIZAH', 'gender' => 'P', 'class' => 'VII D'],
            ['absen' => '32', 'induk' => '2943', 'name' => 'ZULIANA RAHMAN', 'gender' => 'P', 'class' => 'VII D'],
        ];

        foreach ($students as $student) {
            User::updateOrCreate(
                ['identifier_no' => $student['induk']],
                [
                    'name' => ucwords(strtolower($student['name'])),
                    'password' => Hash::make('spengu123'),
                    'role' => 'siswa', // changed to 'siswa' instead of 'student'
                    'class_name' => $student['class'],
                    'attendance_number' => $student['absen'],
                ]
            );
        }

        // Set Teachers Class Settings
        $classSettings = [
            'VII A' => ['informatics_teacher' => 'M.Khanif Syarifudin, S.Pd', 'homeroom_teacher' => 'Mohamad Hardjoko, S.Pd'],
            'VII B' => ['informatics_teacher' => 'M. Khanif Syarifudin, S.Pd', 'homeroom_teacher' => 'Nur Rohim, S.Sos.,MA'],
            'VII C' => ['informatics_teacher' => 'Maya Sekar Kemuning, S.Pd', 'homeroom_teacher' => 'Amin Fauzi, S.Pd'],
            'VII D' => ['informatics_teacher' => 'Maya Sekar Kemuning,S.Pd', 'homeroom_teacher' => 'Miratus Sidqiyah, S.Pd'],
        ];

        foreach ($classSettings as $className => $teachers) {
            ClassSetting::updateOrCreate(
                ['class_name' => $className],
                $teachers
            );
        }
    }
}
