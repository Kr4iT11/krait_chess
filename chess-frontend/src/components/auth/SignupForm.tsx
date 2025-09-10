import React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema, type TSignUpSchema } from '../../lib/validators/authvalidations'; // Import our schema and type
import InputField from '../form/input/InputField'; // Path might need adjustment
import Button from '../ui/Button'; // Path might need adjustment
import { useAuth } from '../../features/authentication/context/AuthContext';

const SignupForm: React.FC = () => {
    const { registerLocal, signUpPending } = useAuth();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<TSignUpSchema>({
        resolver: zodResolver(signUpSchema), // Connect Zod schema to React Hook Form
        mode: 'onBlur', // Validate on blur
    });

    const onSubmit: SubmitHandler<TSignUpSchema> = async (data) => {
        // This function now only runs if validation passes
        // Here you would make your API call
        console.log('Form submitted with data:', data);
        try {
            registerLocal({ username: data.username, email: data.email, password: data.password });
        } catch (error) {
            console.error('Signup failed:', error);
            // TODO: Handle error (e.g., show an error message to the user)
        }
    };
    return (
        <div className="bg-gray-800 p-8 rounded-lg shadow-2xl max-w-md mx-auto w-full transition-transform transform">
            <div className="text-center mb-8">
                <div className="mb-4">
                    <h2 className="text-3xl font-bold text-white">Create Account</h2>
                    <p className="text-gray-400">Join the ultimate chess community</p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                        <InputField
                            id="username"
                            type="text"
                            placeholder="ChessMaster123"
                            register={register('username')}
                            error={errors.username?.message}
                        // hint={!errors ? "" : errors.username?.message}
                        />
                    </div>
                    <div className="mb-4">
                        <InputField
                            id="email"
                            type="text"
                            placeholder="you@example.com"
                            register={register('email')}
                            error={errors.email?.message}
                        // hint={!errors ? "" : errors.email?.message}
                        />
                    </div>
                    <div className="mb-4">
                        <InputField
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            register={register('password')}
                            error={errors.password?.message}
                        // hint={!errors ? "" : errors.password?.message}
                        />
                    </div>
                    <Button
                        type="submit" // Use type="submit" for the form button
                        disabled={isSubmitting} // Disable button during submission
                        className="w-full mt-4 bg-yellow-500 ..."
                    >
                        {signUpPending ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                </form>
            </div>
        </div>
    )
}
export default SignupForm