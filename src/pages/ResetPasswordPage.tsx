
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import Logo from "@/components/Logo";

interface ResetPasswordFormValues {
  email: string;
}

const ResetPasswordPage = () => {
  const { resetPassword } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormValues>();

  const onSubmit = async (data: ResetPasswordFormValues) => {
    try {
      setIsSubmitting(true);
      await resetPassword(data.email);
      setEmailSent(true);
    } catch (error) {
      console.error("Reset password error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1F2C] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo />
          <h1 className="text-2xl text-white font-medium mt-4">Recuperar Senha</h1>
        </div>
        
        <Card className="p-6 bg-white/10 border-0">
          {!emailSent ? (
            <>
              <p className="text-white/70 mb-6">
                Informe seu email para receber um link de recuperação de senha.
              </p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="seu@email.com"
                    {...register("email", { required: "Email é obrigatório" })}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-[#00F0FF] hover:bg-[#00E0F0] text-[#1A1F2C]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Enviar Link de Recuperação"}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="mb-4 text-[#00F0FF]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <h3 className="text-xl text-white font-medium mb-2">Email Enviado!</h3>
              <p className="text-white/70 mb-4">
                Verifique sua caixa de entrada e siga as instruções para recuperar sua senha.
              </p>
              <Button asChild variant="ghost" className="text-[#00F0FF]">
                <Link to="/login">Voltar para o Login</Link>
              </Button>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <Link to="/login" className="text-[#00F0FF] hover:underline">
              Voltar para o Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
