import axios from 'axios';
import { BASE_URL, API_ENDPOINTS } from './constants';

export interface BuyTicketsResponse {
    orderId: string;
    paymentLink: string;
}

export interface VerifyPaymentResponse {
    status: 'paid' | 'pending' | 'failed';
}

export async function buyTickets(
    userId: string,
    type: 'stars' | 'ton',
    ticketNumber: number
): Promise<BuyTicketsResponse> {
    const resp = await axios.get<BuyTicketsResponse>(
        `${BASE_URL}${API_ENDPOINTS.USERS}/${userId}/buy`,
        {
            params: { currency: type, count: ticketNumber },
        }
    );
    return resp.data;
}

export async function verifyPayment(
    orderId: string,
    status: "paid" | "failed"
): Promise<VerifyPaymentResponse> {
    try {
        const resp = await axios.get<VerifyPaymentResponse>(
            `${BASE_URL}${API_ENDPOINTS.USERS}/verify/${orderId}`,
            {
                params: {
                    status
                }
            }
        );
        return resp.data;
    } catch (error) {
        console.error("Error verifying payment:", error);
        throw new Error("Failed to verify payment");
    }
}

