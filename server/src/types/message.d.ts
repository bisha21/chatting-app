import { User } from "./auth.";

export interface Message {
  id: number;
  senderId: number;
  reciverId: number;
  sender?: User; // optional to prevent circular typing
  reciver?: User; // optional to prevent circular typing
  text?: string | null;
  image?: string | null;
  seen: boolean;
  createdAt: Date;
}
