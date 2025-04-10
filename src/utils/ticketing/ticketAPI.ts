import { ParkingTicket } from "./types";
import { fetchTickets, storeTickets } from "./storage";
import { createBarcode, isBarcodeAvailable, PARKING_CAPACITY } from "./helpers";

/**
 * Issues a new parking ticket and stores it.
 */
export function getTicket(): ParkingTicket | null {
  const currentTickets = fetchTickets();

  if (currentTickets.length >= PARKING_CAPACITY) {
    console.warn("Parking lot is full.");
    return null;
  }

  let barcode: string;
  let attempts = 0;

  do {
    barcode = createBarcode();
    attempts++;
  } while (!isBarcodeAvailable(barcode, currentTickets) && attempts < 10);

  if (attempts === 10) {
    console.error("Unable to generate a unique barcode.");
    return null;
  }

  const newTicket: ParkingTicket = {
    barcode,
    issuedAt: Date.now(),
  };

  currentTickets.push(newTicket);
  storeTickets(currentTickets);

  console.log("Ticket issued:", newTicket);
  return newTicket;
}

/**
 * Calculates the parking fee for a given ticket.
 * Every started hour costs €2.
 *
 * @param barcode - The unique 16-digit barcode of the parking ticket.
 * @returns The fee in euros. Returns 0 if ticket is not found.
 */
export function calculatePrice(barcode: string): number {
  const tickets = fetchTickets();
  const ticket = tickets.find((t) => t.barcode === barcode);

  if (!ticket) {
    console.warn(`Ticket not found for barcode: ${barcode}`);
    return 0;
  }

  const now = Date.now();
  const millisecondsInHour = 1000 * 60 * 60;
  const durationMs = now - ticket.issuedAt;

  const hoursParked = Math.ceil(durationMs / millisecondsInHour);
  const ratePerHour = 2;
  const total = hoursParked * ratePerHour;

  console.log(
    `Calculated fee for ticket ${barcode}: €${total} (${hoursParked} hour(s) parked)`
  );

  if (ticket.payment) {
    console.log(
      `[calculatePrice] Ticket ${barcode} already paid at ${new Date(
        ticket.payment.paidAt
      ).toLocaleString()}`
    );
    return 0;
  }

  return total;
}

/**
 * Marks a ticket as paid by storing the payment method and timestamp.
 * If already paid, returns the existing receipt.
 *
 * @param barcode - The 16-digit ticket barcode.
 * @param method - Payment method used (e.g., 'credit card')
 * @returns A receipt object or null if the ticket is not found.
 */
export function payTicket(
  barcode: string,
  method: string
): { receipt: string; paidAt: number } | null {
  const tickets = fetchTickets();
  const index = tickets.findIndex((t) => t.barcode === barcode);

  if (index === -1) {
    console.warn(`[payTicket] No ticket found for barcode: ${barcode}`);
    return null;
  }

  const ticket = tickets[index];

  // Already paid
  if (ticket.payment) {
    const { method: existingMethod, paidAt } = ticket.payment;
    console.log(
      `[payTicket]  Ticket ${barcode} was already paid via ${existingMethod} on ${new Date(
        paidAt
      ).toLocaleString()}`
    );
    return {
      receipt: `Receipt: Ticket ${barcode}, paid via ${existingMethod} on ${new Date(
        paidAt
      ).toLocaleString()}`,
      paidAt,
    };
  }

  const paidAt = Date.now();
  ticket.payment = { method, paidAt };
  tickets[index] = ticket;
  storeTickets(tickets);

  console.log(
    `[payTicket] Payment recorded for ticket ${barcode} via ${method} at ${new Date(
      paidAt
    ).toLocaleString()}`
  );

  return {
    receipt: `Receipt: Ticket ${barcode}, paid via ${method} on ${new Date(
      paidAt
    ).toLocaleString()}`,
    paidAt,
  };
}

/**
 * Returns the current exit eligibility of a ticket.
 * - "paid"     → Ticket is paid and within 15-minute exit window
 * - "expired"  → Paid, but exit window has expired
 * - "unpaid"   → Not yet paid
 * - "not_found"→ Ticket not found
 *
 * @param barcode - The 16-digit ticket barcode
 * @returns A status string representing the ticket's state
 */
export function getTicketState(
  barcode: string
): "paid" | "unpaid" | "expired" | "not_found" {
  const tickets = fetchTickets();
  const ticket = tickets.find((t) => t.barcode === barcode);

  if (!ticket) {
    console.warn(`[getTicketState] Ticket not found for barcode: ${barcode}`);
    return "not_found";
  }

  if (!ticket.payment) {
    console.log(`[getTicketState] Ticket ${barcode} has not been paid.`);
    return "unpaid";
  }

  const now = Date.now();
  const gracePeriodMs = 15 * 60 * 1000;
  const { paidAt } = ticket.payment;

  if (now - paidAt > gracePeriodMs) {
    console.log(
      `[getTicketState] Ticket ${barcode} payment expired. Paid at: ${new Date(
        paidAt
      ).toLocaleString()}`
    );
    return "expired";
  }

  console.log(`[getTicketState] Ticket ${barcode} is valid for exit.`);
  return "paid";
}

/**
 * Returns the number of currently available parking spaces.
 * Considers all issued tickets as occupying one space.
 *
 * @returns A number from 0 to PARKING_CAPACITY
 */
export function getFreeSpaces(): number {
  const tickets = fetchTickets();
  const usedSpaces = tickets.length;
  const freeSpaces = Math.max(0, PARKING_CAPACITY - usedSpaces);

  console.log(
    `[getFreeSpaces] ${freeSpaces} of ${PARKING_CAPACITY} spaces available.`
  );
  return freeSpaces;
}
