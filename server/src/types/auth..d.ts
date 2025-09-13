import { Message } from "./message";

export interface User {
  id: number;
  email: string;
  fullName: string;
  password: string;
  bio?: string | null;
  profileImage?: string | null;
  messageSent?: Message[];     
  messageReceived?: Message[]; 
  createdAt: Date;
  updatedAt: Date;
}