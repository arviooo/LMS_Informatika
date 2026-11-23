<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'identifier_no' => ['required', 'string'],
            'password' => ['required', 'string'],
            'role' => ['nullable', 'string', 'in:siswa,guru'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $identifier = strtolower(trim((string) $this->input('identifier_no')));
        $password = (string) $this->input('password');
        $expectedRole = $this->input('role');

        // Cari akun berdasarkan identifier_no terlebih dahulu, lalu fallback nama (case-insensitive)
        $matchedUser = \App\Models\User::whereRaw('LOWER(identifier_no) = ?', [$identifier])->first();
        if (! $matchedUser) {
            $matchedUser = \App\Models\User::whereRaw('LOWER(name) = ?', [$identifier])->first();
        }

        if (! $matchedUser || ! \Illuminate\Support\Facades\Hash::check($password, $matchedUser->password)) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'identifier_no' => __('auth.failed'),
            ]);
        }

        // Validasi peran ketat: akun guru tidak boleh masuk di portal siswa, begitu pula sebaliknya
        if ($expectedRole && $matchedUser->role !== $expectedRole) {
            $roleMessage = $expectedRole === 'siswa'
                ? 'Akun ini terdaftar sebagai Guru. Silakan beralih ke Portal Guru untuk masuk.'
                : 'Akun ini terdaftar sebagai Siswa. Silakan beralih ke Portal Siswa untuk masuk.';

            throw ValidationException::withMessages([
                'role' => $roleMessage,
            ]);
        }

        Auth::login($matchedUser, $this->boolean('remember'));
        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'identifier_no' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->input('identifier_no')).'|'.$this->ip());
    }
}
