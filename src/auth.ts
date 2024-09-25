import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./lib/prisma"; // Correct the path if needed
import bcrypt from "bcrypt";
import { z } from "zod";
import signUpSchema from "./lib/validations";
import { PrismaAdapter } from "@next-auth/prisma-adapter";



export const { auth, handlers, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
  
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        firstName: { label: "First Name", type: "text", placeholder: "Abhinash" },
        lastName: { label: "Last Name", type: "text", placeholder: "Sharma" },
        email: { label: "Email", type: "text", placeholder: "email address" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text", placeholder: "alumni, student, professor" },
      },
      async authorize(credentials) {
        try {
          // Validate the incoming credentials using Zod
          const parsedCredentials = signUpSchema.parse(credentials);

          const { firstName, lastName, email, password, role } = parsedCredentials;

          // Check if the user already exists
          const existingUser = await prisma.user.findUnique({
            where: { email },
          });

          if (existingUser) {
            throw new Error("User already exists. Please sign in.");
          }

          // Hash the password and create a new user
          const hashedPassword = await bcrypt.hash(password, 10);

          const newUser = await prisma.user.create({
            data: {
              firstName,
              lastName,
              email,
              password: hashedPassword,
              role,
            },
          });

          // Return the newly created user object with the id as a string
          return {
            id: newUser.id, // This is a string, as expected by NextAuth
            email: newUser.email,
            role: newUser.role,
          };
        } catch (error) {
          // Handle Zod validation errors
          if (error instanceof z.ZodError) {
            throw new Error(`Validation error: ${error.errors.map((e) => e.message).join(", ")}`);
          }

          // Handle any other errors
          throw new Error("Signup failed. Please try again.");
        }
      },
    }),
  ],
  pages: {
    signIn: "/signin",
    error: "/auth/error", // Error page to handle issues like "User already exists" or validation errors
  },
});
