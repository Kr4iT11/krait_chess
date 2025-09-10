import React from "react";
import InputField from "../../components/form/input/InputField";
import Button from "../../components/ui/Button";
import { useForm } from "react-hook-form";
import { signInSchema, type TSignInSchema } from "../../lib/validators/authvalidations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../features/authentication/context/AuthContext";

const SignInForm: React.FC = () => {
    const { login, signInPending } = useAuth();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<TSignInSchema>({
        resolver: zodResolver(signInSchema),
        mode: 'onBlur', // Validate on blur
    });

    const onSubmit = async (data: TSignInSchema) => {
        console.log(data);
        // Need  to make API call here
        try {
            login({ username: '', email: data.email, password: data.password }); // we are leaving username empty as backend accepts either username or email
        } catch (error) {
            console.error('Sign in failed:', error);
        }
    };
    return (
        <div className="bg-gray-800 p-8 rounded-lg shadow-2xl max-w-md mx-auto w-full transition-transform transform">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
                <p className="text-gray-400">Sign in to continue your game</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} >
                <div className="mb-4">
                    <InputField
                        id="email"
                        type="email"
                        placeholder="ChessMaster123"
                        register={register('email')}
                        error={errors.email?.message}
                    />
                </div>
                <div className="mb-4">
                    <InputField
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        register={register('password')}
                        error={errors.password?.message}
                    />
                </div>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-4 bg-yellow-500 ..."
                >
                    {signInPending ? 'Signing In...' : 'Sign In'}
                </Button>
            </form>
        </div>
    )
}

export default SignInForm