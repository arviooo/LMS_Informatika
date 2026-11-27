<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClassSetting;
use Illuminate\Http\Request;

class ClassSettingController extends Controller
{
    public static function normalizeClass(?string $className): string
    {
        return strtolower(str_replace(['-', ' '], '', trim((string) $className)));
    }

    public static function defaultForClass(string $className): array
    {
        $norm = self::normalizeClass($className);
        $defaults = [
            'viia' => [
                'homeroom_teacher' => 'Mohamad Hardjoko, S.Pd',
                'informatics_teacher' => 'M. Khanif Syarifudin, S.Pd',
            ],
            'viib' => [
                'homeroom_teacher' => 'Nur Rohim, S.Sos., MA',
                'informatics_teacher' => 'M. Khanif Syarifudin, S.Pd',
            ],
            'viic' => [
                'homeroom_teacher' => 'Amin Fauzi, S.Pd',
                'informatics_teacher' => 'Maya Sekar Kemuning, S.Pd',
            ],
            'viid' => [
                'homeroom_teacher' => 'Miratus Sidqiyah, S.Pd',
                'informatics_teacher' => 'Maya Sekar Kemuning, S.Pd',
            ],
        ];

        return [
            'class_name' => $className,
            'homeroom_teacher' => $defaults[$norm]['homeroom_teacher'] ?? '-',
            'informatics_teacher' => $defaults[$norm]['informatics_teacher'] ?? '-',
        ];
    }

    public static function resolveForClass(?string $className): array
    {
        if (!$className || trim($className) === '') {
            return [
                'class_name' => '',
                'homeroom_teacher' => '-',
                'informatics_teacher' => '-',
            ];
        }

        $norm = self::normalizeClass($className);
        $setting = ClassSetting::whereRaw(
            "LOWER(REPLACE(REPLACE(class_name, '-', ''), ' ', '')) = ?",
            [$norm]
        )
            ->orderByDesc('updated_at')
            ->first();

        if ($setting) {
            return [
                'id' => $setting->id,
                'class_name' => $setting->class_name,
                'homeroom_teacher' => $setting->homeroom_teacher,
                'informatics_teacher' => $setting->informatics_teacher,
            ];
        }

        return self::defaultForClass($className);
    }

    public function index()
    {
        return response()->json(ClassSetting::all());
    }

    public function show($className)
    {
        return response()->json(self::resolveForClass(urldecode($className)));
    }

    public function update(Request $request, $className)
    {
        $className = urldecode($className);
        $teacher = $request->user();
        if ($teacher && $teacher->class_name) {
            $normTeacher = self::normalizeClass($teacher->class_name);
            $normClass = self::normalizeClass($className);
            if ($normTeacher !== $normClass) {
                return response()->json(['message' => 'Akses ditolak: Anda hanya berhak mengubah pengaturan kelas binaan Anda (' . $teacher->class_name . ').'], 403);
            }
        }

        $validated = $request->validate([
            'homeroom_teacher' => 'required|string|max:255',
            'informatics_teacher' => 'required|string|max:255',
        ]);

        $norm = self::normalizeClass($className);
        $existingRows = ClassSetting::whereRaw(
            "LOWER(REPLACE(REPLACE(class_name, '-', ''), ' ', '')) = ?",
            [$norm]
        )->get();

        if ($existingRows->isNotEmpty()) {
            foreach ($existingRows as $row) {
                $row->update($validated);
            }
            $setting = $existingRows->first()->fresh();
        } else {
            $setting = ClassSetting::create([
                'class_name' => $className,
                'homeroom_teacher' => $validated['homeroom_teacher'],
                'informatics_teacher' => $validated['informatics_teacher'],
            ]);
        }

        return response()->json($setting);
    }
}
