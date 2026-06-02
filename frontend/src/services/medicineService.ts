const API_BASE_URL = (import.meta as any).env?.VITE_API_URL
    ? (import.meta as any).env.VITE_API_URL.replace(/\/api$/, '')
    : 'http://localhost:5000';

class MedicineService {
    private async getAuthHeaders() {
        const token = localStorage.getItem('auth_token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    }

    async getMedicines(params?: { category?: string; search?: string }) {
        const query = new URLSearchParams();
        if (params?.category) query.append('category', params.category);
        if (params?.search) query.append('search', params.search);

        const response = await fetch(`${API_BASE_URL}/api/medicines?${query.toString()}`, {
            headers: await this.getAuthHeaders(),
        });
        const result = await response.json();
        return result.data || [];
    }

    async getCart() {
        const response = await fetch(`${API_BASE_URL}/api/cart`, {
            headers: await this.getAuthHeaders(),
        });
        const result = await response.json();
        return result.data || [];
    }

    async addToCart(medicineId: string, quantity: number = 1) {
        const response = await fetch(`${API_BASE_URL}/api/cart`, {
            method: 'POST',
            headers: await this.getAuthHeaders(),
            body: JSON.stringify({ medicine_id: medicineId, quantity })
        });
        return await response.json();
    }

    async removeFromCart(itemId: number) {
        await fetch(`${API_BASE_URL}/api/cart/${itemId}`, {
            method: 'DELETE',
            headers: await this.getAuthHeaders(),
        });
    }

    async updateCartQuantity(itemId: number, quantity: number) {
        await fetch(`${API_BASE_URL}/api/cart/${itemId}`, {
            method: 'PUT',
            headers: await this.getAuthHeaders(),
            body: JSON.stringify({ quantity })
        });
    }

    async getOrders() {
        const response = await fetch(`${API_BASE_URL}/api/orders`, {
            headers: await this.getAuthHeaders(),
        });
        const result = await response.json();
        return result.data || [];
    }

    async placeOrder(orderData: any) {
        const response = await fetch(`${API_BASE_URL}/api/orders`, {
            method: 'POST',
            headers: await this.getAuthHeaders(),
            body: JSON.stringify(orderData)
        });
        return await response.json();
    }

    async toggleBookmark(medicineId: string) {
        const response = await fetch(`${API_BASE_URL}/api/bookmarks`, {
            method: 'POST',
            headers: await this.getAuthHeaders(),
            body: JSON.stringify({ medicine_id: medicineId })
        });
        return await response.json();
    }

    async getBookmarks() {
        const response = await fetch(`${API_BASE_URL}/api/bookmarks`, {
            headers: await this.getAuthHeaders(),
        });
        const result = await response.json();
        return result.data || [];
    }

    async getReminders() {
        const response = await fetch(`${API_BASE_URL}/api/reminders`, {
            headers: await this.getAuthHeaders(),
        });
        const result = await response.json();
        return result.data || [];
    }

    async addReminder(reminder: any) {
        const response = await fetch(`${API_BASE_URL}/api/reminders`, {
            method: 'POST',
            headers: await this.getAuthHeaders(),
            body: JSON.stringify(reminder)
        });
        return await response.json();
    }
}

export const medicineService = new MedicineService();
