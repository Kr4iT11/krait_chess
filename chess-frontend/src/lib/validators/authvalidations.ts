import { z } from 'zod';

// Zod schema for validating user registration data
export const signUpSchema = z.object({
    username: z.string()
        .min(4, "Username must be at least 4 characters long")
        .max(20, "Username must be at most 20 characters long")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    email: z.string()
        .email("Invalid email address"),
    password: z.string()
        .min(8, "Password must be at least 8 characters long")
});

// Zod schema for validating user login data

export const signInSchema = z.object({
    // You might want to allow login with email or username. For now, let's use username.
    // username: z.string().min(1, { message: 'Username is required.' }),
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, { message: 'Password is required.' })
})


// We can infer the TypeScript types directly from our schemas!
export type TSignUpSchema = z.infer<typeof signUpSchema>;
export type TSignInSchema = z.infer<typeof signInSchema>;