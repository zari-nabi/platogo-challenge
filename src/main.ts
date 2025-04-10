import { calculatePrice, getTicket } from "./utils/ticketing";

(window as any).getTicket = getTicket;
(window as any).calculatePrice = calculatePrice;
