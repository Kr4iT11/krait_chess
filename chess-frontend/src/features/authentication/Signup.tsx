import SignupForm from '../../components/auth/SignupForm';
import AuthLayout from '../../layout/AuthLayout';

const Signup: React.FC = () => {
  return (
    <>
      <AuthLayout>
        <SignupForm />
      </AuthLayout>
    </>
  );
};
export default Signup;
