
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const BackButton = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleBack} 
      className="text-white hover:bg-white/10"
    >
      <ArrowLeft className="w-6 h-6" />
    </Button>
  );
};

export default BackButton;
