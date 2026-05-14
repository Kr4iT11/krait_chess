import AuthLayout from '../../../layout/AuthLayout';
import SignupForm from '../components/SignupForm';

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
