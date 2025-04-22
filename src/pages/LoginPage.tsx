
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import Logo from "@/components/Logo";

interface LoginFormValues {
  email: string;
  password: string;
}

const LoginPage = () => {
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>();

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsSubmitting(true);
      await login(data.email, data.password);
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1F2C] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo />
          <h1 className="text-2xl text-white font-medium mt-4">Entrar no Sistema</h1>
        </div>
        
        <Card className="p-6 bg-white/10 border-0">
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
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                className="bg-white/5 border-white/20 text-white"
                placeholder="********"
                {...register("password", { required: "Senha é obrigatória" })}
              />
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>
            
            <div className="text-right">
              <Link to="/reset-password" className="text-[#00F0FF] text-sm hover:underline">
                Esqueceu a senha?
              </Link>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-[#00F0FF] hover:bg-[#00E0F0] text-[#1A1F2C]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-white/70">
              Não tem uma conta?{" "}
              <Link to="/register" className="text-[#00F0FF] hover:underline">
                Criar conta
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
