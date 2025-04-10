import { calculatePrice, getTicket, payTicket } from "./utils/ticketing";

(window as any).getTicket = getTicket;
(window as any).calculatePrice = calculatePrice;
(window as any).payTicket = payTicket;
