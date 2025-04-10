import {
  calculatePrice,
  getTicket,
  getTicketState,
  payTicket,
} from "./utils/ticketing";

(window as any).getTicket = getTicket;
(window as any).calculatePrice = calculatePrice;
(window as any).payTicket = payTicket;
(window as any).getTicketState = getTicketState;
