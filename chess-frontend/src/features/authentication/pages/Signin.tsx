import AuthLayout from '../../../layout/AuthLayout';
import SignInForm from '../components/SigninForm';

const SignIn: React.FC = () => {
  return (
    <>
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
};
export default SignIn;
