import { useFormStatus } from 'react-dom';
import { Button } from './button';

interface SubmitButtonProps {
  children: React.ReactNode;
}

const SubmitButton = ({ children }: SubmitButtonProps) => {
  const { pending } = useFormStatus();
  return (
    <div>
      <Button type="submit" aria-disabled={pending} className="w-full mt-2">
        {pending ? 'Submitting...' : children}
      </Button>
    </div>
  );
};

export default SubmitButton;
