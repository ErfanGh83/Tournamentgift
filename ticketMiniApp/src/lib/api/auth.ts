"use client"

import axios from "axios";
import { API_ENDPOINTS, BASE_URL } from "./constants";

interface LaunchRequest {
    telegramId: string;
    firstName: string;
    lastName: string;
    username: string;
    initData: string;
}

export interface LaunchResponse {
    telegramId: string
    firstName: string
    lastName: string
    username: string
    yellowTickets: number
    totalTicketsBought: number
    refralCode: string
    referralsCount: number
}

export interface NewLaunchResponse {
    user: LaunchResponse
}

export async function launchUser(data: LaunchRequest): Promise<NewLaunchResponse> {
    const resp = await axios.post<NewLaunchResponse>(
        `${BASE_URL}${API_ENDPOINTS.LAUNCH}`,
        data
    );
    return resp.data;
}
