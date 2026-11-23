<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'identifier_no' => fake()->unique()->numerify('##########'), // 10 digit
            'role' => fake()->randomElement(['siswa', 'guru']),
            'password' => static::$password ??= Hash::make('password'),
            'avatar_url' => null,
            'remember_token' => Str::random(10),
            'class_id' => null,
            'is_active' => true,
        ];
    }
}
