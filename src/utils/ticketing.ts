/**
 * A representation of a parking ticket.
 */
type ParkingTicket = {
  barcode: string;
  issuedAt: number; // Unix timestamp in ms
};

const TICKET_STORAGE_KEY = "parking_tickets";
const PARKING_CAPACITY = 54;

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

/**
 * Generates a 16-digit numeric barcode string.
 */
function createBarcode(): string {
  return Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join(
    ""
  );
}

/**
 * Ensures a barcode is not duplicated.
 */
function isBarcodeAvailable(
  barcode: string,
  tickets: ParkingTicket[]
): boolean {
  return !tickets.some((ticket) => ticket.barcode === barcode);
}

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
