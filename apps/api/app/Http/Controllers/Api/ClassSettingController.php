<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClassSetting;
use Illuminate\Http\Request;

class ClassSettingController extends Controller
{
    public function index()
    {
        return response()->json(ClassSetting::all());
    }

    public function show($className)
    {
        $setting = ClassSetting::where('class_name', $className)->first();
        return response()->json($setting ?: [
            'class_name' => $className,
            'homeroom_teacher' => 'Bpk. Haryanto, S.Kom.',
            'informatics_teacher' => 'Bpk. Haryanto, S.Kom.',
        ]);
    }

    public function update(Request $request, $className)
    {
        $teacher = $request->user();
        if ($teacher && $teacher->class_name) {
            $normTeacher = str_replace(['-', ' '], '', $teacher->class_name);
            $normClass = str_replace(['-', ' '], '', $className);
            if ($normTeacher !== $normClass) {
                return response()->json(['message' => 'Akses ditolak: Anda hanya berhak mengubah pengaturan kelas binaan Anda (' . $teacher->class_name . ').'], 403);
            }
        }

        $validated = $request->validate([
            'homeroom_teacher' => 'required|string',
            'informatics_teacher' => 'required|string',
        ]);

        $setting = ClassSetting::updateOrCreate(
            ['class_name' => $className],
            $validated
        );

        return response()->json($setting);
    }
}
