import { ParkingTicket } from "./types";

export const PARKING_CAPACITY = 54;

/**
 * Generates a 16-digit numeric barcode string.
 */
export function createBarcode(): string {
  return Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join(
    ""
  );
}

/**
 * Ensures a barcode is not duplicated.
 */
export function isBarcodeAvailable(
  barcode: string,
  tickets: ParkingTicket[]
): boolean {
  return !tickets.some((ticket) => ticket.barcode === barcode);
}
