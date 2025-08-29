import SignInForm from '../../components/auth/SigninForm';
import AuthLayout from '../../layout/AuthLayout';

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
