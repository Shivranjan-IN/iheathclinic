import { User, UserRole } from '../common/types';

const API_BASE_URL = (import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api$/, '')
    : 'http://localhost:5000');

export async function getUserWithRole(): Promise<User | null> {
    const token = localStorage.getItem('auth_token');

    if (!token) {
        return null;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
                const cachedUser = localStorage.getItem('user');
                if (cachedUser) {
                    try {
                        const parsedUser = JSON.parse(cachedUser);
                        return parsedUser;
                    } catch (parseError) {
                        console.error('Error parsing cached user:', parseError);
                    }
                }
                return null;
            throw new Error('Failed to fetch user');
        }

        const data = await response.json();
        const user: User = {
            id: String(data.data.user_id),
            full_name: data.data.full_name,
            name: data.data.full_name, // Also set name for convenience
            email: data.data.email,
            role: data.data.role as UserRole,
            doctor_id: data.data.doctor_id,
            patient_id: data.data.patient_id,
            clinic_id: data.data.clinic_id
        };
        // Cache the user in localStorage
        localStorage.setItem('user', JSON.stringify(user));
        return user;
    } catch (error) {
        console.error('Error fetching user:', error);
        // Try to get from cache
        const cachedUser = localStorage.getItem('user');
        if (cachedUser) {
            try {
                return JSON.parse(cachedUser);
            } catch (parseError) {
                console.error('Error parsing cached user:', parseError);
            }
        }
        localStorage.removeItem('auth_token');
        return null;
    }
}

export interface ClinicRegistrationData {
    name: string;
    type: string;
    establishedYear?: number;
    tagline?: string;
    description?: string;
    address: string;
    pinCode: string;
    city: string;
    state: string;
    mobile: string;
    email: string;
    website?: string;
    medicalCouncilRegNo: string;
    bankDetails?: {
        accountName: string;
        accountNumber: string;
        ifsc: string;
        pan: string;
        gstin?: string;
    };
    services?: string[];
    facilities?: string[];
    paymentModes?: string[];
    bookingModes?: string[];
}

export interface DoctorRegistrationData {
    name: string;
    email: string;
    mobile: string;
    gender: string;
    dob: string;
    mciReg: string;
    councilName: string;
    regYear: number;
    degrees: string;
    university: string;
    gradYear: number;
    experience: number;
    specializations: string[];
    languages: string[];
    consultationModes: string[];
    bankDetails?: {
        accountName: string;
        accountNumber: string;
        ifsc: string;
        pan: string;
        gstin?: string;
    };
}

export class AuthService {
    // Sign in with email and password
    async signInWithEmail(email: string, password: string): Promise<User> {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Login error:', errorData);
            throw new Error(errorData.message || 'Login failed');
        }

        const data = await response.json();

        // Store token FIRST before anything else
        if (data.token) {
            localStorage.setItem('auth_token', data.token);
        } else {
            console.error("❌ NO TOKEN IN RESPONSE!");
        }

        // Create user object with proper format (full_name required)
        const userData: User = {
            id: String(data.user.user_id),
            full_name: data.user.full_name,
            name: data.user.full_name, // Also set name for convenience
            email: data.user.email,
            role: data.user.role as UserRole,
            doctor_id: data.user.doctor_id,
            patient_id: data.user.patient_id,
            clinic_id: data.user.clinic_id
        };
        localStorage.setItem('user', JSON.stringify(userData));

        return userData;
    }

    // Sign in with Google
    async signInWithGoogle() {
        window.location.href = `${API_BASE_URL}/api/auth/google`;
    }

    // Sign up clinic
    async signUpClinic(data: ClinicRegistrationData, extraData: any, password: string, files?: Record<string, File>) {
        const formData = new FormData();

        // Add all data fields
        Object.entries({ ...data, ...extraData, password }).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (typeof value === 'object') {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, String(value));
                }
            }
        });

        // Add files if provided
        if (files) {
            Object.entries(files).forEach(([key, file]) => {
                formData.append(key, file);
            });
        }

        const response = await fetch(`${API_BASE_URL}/api/auth/register/clinic`, {
            method: 'POST',
            body: formData,
        });

        const rawData = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(rawData.message || 'Clinic registration failed');
        }

        const responseData = rawData.success ? rawData.data : rawData;
        
        // Store token and user for auto-login
        if (responseData.token) {
            localStorage.setItem('auth_token', responseData.token);
            const userData: User = {
                id: String(responseData.user.user_id),
                full_name: responseData.user.full_name,
                name: responseData.user.full_name,
                email: responseData.user.email,
                role: 'clinic',
                clinic_id: responseData.clinic?.id
            };
            localStorage.setItem('user', JSON.stringify(userData));
        }

        return responseData;
    }

    // Sign up lab
    async signUpLab(data: any, files?: Record<string, File>) {
        const formData = new FormData();

        // Add all data fields
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (typeof value === 'object') {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, String(value));
                }
            }
        });

        // Add files if provided
        if (files) {
            Object.entries(files).forEach(([key, file]) => {
                formData.append(key, file);
            });
        }

        const response = await fetch(`${API_BASE_URL}/api/auth/register/lab`, {
            method: 'POST',
            body: formData,
        });

        const rawData = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(rawData.message || 'Lab registration failed');
        }

        const responseData = rawData.success ? rawData.data : rawData;

        // Store token and user for auto-login
        if (responseData.token) {
            localStorage.setItem('auth_token', responseData.token);
            const userData: User = {
                id: String(responseData.user.user_id),
                full_name: responseData.user.full_name,
                name: responseData.user.full_name,
                email: responseData.user.email,
                role: 'lab'
            };
            localStorage.setItem('user', JSON.stringify(userData));
        }

        return responseData;
    }

    // Sign up doctor
    async signUpDoctor(data: DoctorRegistrationData, password: string, files?: Record<string, File>) {
        const formData = new FormData();

        // Add all data fields
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (typeof value === 'object') {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, String(value));
                }
            }
        });

        // Add password
        formData.append('password', password);

        // Add files if provided
        if (files) {
            Object.entries(files).forEach(([key, file]) => {
                formData.append(key, file);
            });
        }

        const response = await fetch(`${API_BASE_URL}/api/auth/register/doctor`, {
            method: 'POST',
            body: formData,
        });

        const rawData = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(rawData.message || 'Doctor registration failed');
        }

        const responseData = rawData.success ? rawData.data : rawData;

        // Store token and user for auto-login
        if (responseData.token) {
            localStorage.setItem('auth_token', responseData.token);
            const userData: User = {
                id: String(responseData.user.user_id),
                full_name: responseData.user.full_name,
                name: responseData.user.full_name,
                email: responseData.user.email,
                role: 'doctor',
                doctor_id: responseData.doctor?.id
            };
            localStorage.setItem('user', JSON.stringify(userData));
        }

        return responseData;
    }



    // Get current session
    async getSession() {
        const token = localStorage.getItem('auth_token');
        if (!token) return null;

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) return null;

            return await response.json();
        } catch (error) {
            return null;
        }
    }

    // Reset password
    async resetPassword(email: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Password reset failed');
        }
    }

    // Update password
    async updatePassword(newPassword: string): Promise<void> {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE_URL}/api/auth/update-password`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password: newPassword }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Password update failed');
        }
    }

    // Change password (using current & new password check)
    async changePassword(currentPassword: string, newPassword: string): Promise<any> {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ currentPassword, newPassword }),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.message || 'Password update failed');
        }
        return data;
    }

    // Get user profile from database
    async getUserProfile(userId: string) {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE_URL}/api/auth/profile/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch profile');
        }

        return await response.json();
    }

    // Update user profile in database
    async updateUserProfile(userId: string, updates: any) {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE_URL}/api/auth/profile/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update profile');
        }

        return await response.json();
    }

    // Sign out
    async signOut() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
    }
}

export const authService = new AuthService();
