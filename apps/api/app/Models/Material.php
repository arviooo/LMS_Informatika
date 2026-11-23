<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Material extends Model
{
    use HasFactory;

    protected $fillable = [
        'topic_id',
        'title',
        'content_text',
        'youtube_video_id',
        'attachment_path',
        'estimated_read_time',
        'order_number',
        'target_classes',
    ];

    protected $casts = [
        'target_classes' => 'array',
    ];

    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class);
    }

    public function quiz()
    {
        return $this->hasOne(Quiz::class);
    }

    public function studentProgress(): HasMany
    {
        return $this->hasMany(StudentProgress::class);
    }

    public function getAttachmentPathAttribute($value)
    {
        if ($value && str_starts_with($value, 'http://localhost/')) {
            return str_replace('http://localhost/', 'http://localhost:8000/', $value);
        }
        return $value;
    }
}
