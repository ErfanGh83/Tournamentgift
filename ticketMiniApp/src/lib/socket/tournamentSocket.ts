// tournamentSocket.ts
import { io, Socket } from "socket.io-client";
import { BASE_SOCKET_URL } from "../api/constants"; 

export interface TournamentState {
  totalTickets: number;
  ticketsSold: number;
}

let socket: Socket | null = null;

/**
 * Initialize tournament socket and listen for live updates
 * @param onUpdate callback with the latest tournament state
 */
export function initTournamentSocket(onUpdate: (state: TournamentState) => void) {
  if (socket) return; // prevent multiple connections

  socket = io(BASE_SOCKET_URL, {
    path: "/api/socket.io", // ✅ must match backend path
    // transports: ["websocket"], // optional, try enabling only if fallback issues
  });

  socket.on("connect", () => {
    console.log("✅ Connected to tournament socket:", socket?.id);
  });

  socket.on("tournamentState", (data: TournamentState) => {
    console.log("📢 Got tournament update:", data);
    onUpdate(data);
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected from tournament socket");
  });
}

/**
 * Close the socket connection
 */
export function closeTournamentSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Trigger ticket selling via backend REST API
 */
export async function sellTicket() {
  try {
    const res = await fetch(`${BASE_SOCKET_URL}/sell`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to sell ticket");
    console.log("🎟️ Ticket sold!");
  } catch (err) {
    console.error("Error selling ticket:", err);
  }
}
