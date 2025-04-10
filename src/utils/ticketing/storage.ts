import { ParkingTicket } from "./types";

const TICKET_STORAGE_KEY = "parking_tickets";

/**
 * Retrieves all stored parking tickets from localStorage.
 */
export function fetchTickets(): ParkingTicket[] {
  const stored = localStorage.getItem(TICKET_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Saves all parking tickets to localStorage.
 */
export function storeTickets(tickets: ParkingTicket[]) {
  localStorage.setItem(TICKET_STORAGE_KEY, JSON.stringify(tickets));
}
