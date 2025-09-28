export interface LeaderboardEntry {
  telegramId: string;
  firstName: string;
  lastName: string;
  username: string;
  totalTicketsBought: number;
  referralsCount: number;
  yellowTickets: number;
}

export interface LeaderboardResponse {
  type: string; // "whales" | "referrals" | "live"
  leaderboard: LeaderboardEntry[];
}
