
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import Logo from "@/components/Logo";
import BackButton from "@/components/BackButton";
import { toast } from "@/components/ui/sonner";

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterFormValues>();

  const password = watch("password");

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsSubmitting(true);
      await registerUser(data.email, data.password, data.name);
    } catch (error) {
      console.error("Register error:", error);
      // Error is already handled in the AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1F2C] flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 left-4">
        <BackButton />
      </div>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo />
          <h1 className="text-2xl text-white font-medium mt-4">Criar Conta</h1>
        </div>
        
        <Card className="p-6 bg-white/10 border-0">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white mb-1">
                Nome
              </label>
              <Input
                id="name"
                className="bg-white/5 border-white/20 text-white"
                placeholder="Seu nome completo"
                {...register("name", { required: "Nome é obrigatório" })}
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                className="bg-white/5 border-white/20 text-white"
                placeholder="seu@email.com"
                {...register("email", { 
                  required: "Email é obrigatório",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email inválido"
                  }
                })}
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                className="bg-white/5 border-white/20 text-white"
                placeholder="********"
                {...register("password", { 
                  required: "Senha é obrigatória",
                  minLength: {
                    value: 6,
                    message: "A senha deve ter pelo menos 6 caracteres"
                  }
                })}
              />
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-1">
                Confirmar Senha
              </label>
              <Input
                id="confirmPassword"
                type="password"
                className="bg-white/5 border-white/20 text-white"
                placeholder="********"
                {...register("confirmPassword", { 
                  required: "Confirme sua senha",
                  validate: value => value === password || "As senhas não coincidem"
                })}
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-[#00F0FF] hover:bg-[#00E0F0] text-[#1A1F2C]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-white/70">
              Já tem uma conta?{" "}
              <Link to="/login" className="text-[#00F0FF] hover:underline">
                Entrar
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
