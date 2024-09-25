import { z } from "zod";

const signUpSchema = z.object({
    firstName: z.string().min(1, "First name is required").max(100),
    lastName: z.string().min(1, "Last name is required").max(100),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    role: z.enum(["alumni", "student", "professor"],),
  });


  export default signUpSchema