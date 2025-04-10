/**
 * A representation of a parking ticket.
 */

export type ParkingTicket = {
  barcode: string;
  issuedAt: number;
  payment?: {
    method: string;
    paidAt: number;
  };
};
