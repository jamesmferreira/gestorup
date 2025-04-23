
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { UserProfile } from "@/types/user";

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserProfile = async (user: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        // Check if the error is because the profile doesn't exist yet
        if (error.code === 'PGRST116') {
          // Profile might still be in pending status, check pending_users
          const { data: pendingData } = await supabase
            .from('pending_users')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (pendingData) {
            toast.info("Sua conta está aguardando aprovação por um administrador.");
            await logout();
            return null;
          }
        }
        
        throw error;
      }
      
      if (!data.approved) {
        toast.error("Sua conta está aguardando aprovação por um administrador.");
        await logout();
        return null;
      }
      
      setUserProfile(data);
      return data;
    } catch (error: any) {
      console.error("Error fetching user profile:", error);
      toast.error("Erro ao carregar perfil do usuário");
      return null;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      const profile = await fetchUserProfile(data.user!);
      
      if (profile) {
        toast.success("Login realizado com sucesso!");
        navigate("/");
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao fazer login: " + (error.message || "Verifique suas credenciais"));
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      // Only register the user with email, password, and name in metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });
      
      if (error) throw error;
      
      // The database trigger should handle creation of the pending_users entry
      toast.info("Sua solicitação de registro foi enviada. Aguarde a aprovação do administrador.");
      navigate("/login");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error("Erro ao registrar: " + (error.message || "Tente novamente"));
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setCurrentUser(null);
      setUserProfile(null);
      setSession(null);
      
      toast.success("Logout realizado com sucesso!");
      navigate("/login");
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao fazer logout");
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) throw error;
      
      toast.success("Email de recuperação enviado! Verifique sua caixa de entrada.");
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao enviar email de recuperação: " + (error.message || "Verifique o email"));
      throw error;
    }
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setCurrentUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCurrentUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user);
      }
      
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    session,
    login,
    register,
    logout,
    resetPassword,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
