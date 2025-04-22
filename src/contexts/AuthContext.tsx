
import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  onAuthStateChanged 
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { doc, getDoc, setDoc, collection, query, where, getDocs, Timestamp, serverTimestamp } from "firebase/firestore";
import { UserProfile } from "@/types/user";

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserProfile = async (user: User) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data() as UserProfile;
        
        if (!userData.approved) {
          toast.error("Sua conta está aguardando aprovação por um administrador.");
          await signOut(auth);
          navigate("/login");
          return null;
        }
        
        setUserProfile(userData);
        return userData;
      } else {
        // Check pending users
        const pendingRef = doc(db, "pendingUsers", user.uid);
        const pendingSnap = await getDoc(pendingRef);
        
        if (pendingSnap.exists()) {
          toast.info("Sua solicitação de acesso está pendente de aprovação.");
          await signOut(auth);
          navigate("/login");
          return null;
        }
        
        // If user has no profile, create one with admin role for the first user
        // This is just for the initial setup of the app
        const usersQuery = query(collection(db, "users"));
        const usersSnapshot = await getDocs(usersQuery);
        
        if (usersSnapshot.empty) {
          // First user is admin
          const newUserProfile: UserProfile = {
            uid: user.uid,
            email: user.email || "",
            name: user.displayName || "Admin",
            role: "admin",
            approved: true,
            createdAt: Date.now()
          };
          
          await setDoc(userRef, newUserProfile);
          setUserProfile(newUserProfile);
          return newUserProfile;
        } else {
          // Any subsequent user needs approval
          const pendingUser = {
            uid: user.uid,
            email: user.email,
            name: user.displayName || "",
            requestedAt: Date.now()
          };
          
          await setDoc(pendingRef, pendingUser);
          toast.info("Sua solicitação de acesso foi registrada. Aguarde aprovação do administrador.");
          await signOut(auth);
          navigate("/login");
          return null;
        }
      }
    } catch (error: any) {
      console.error("Error fetching user profile:", error);
      toast.error("Erro ao carregar perfil do usuário");
      return null;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const profile = await fetchUserProfile(credential.user);
      
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
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Check if this is the first user
      const usersQuery = query(collection(db, "users"));
      const usersSnapshot = await getDocs(usersQuery);
      
      if (usersSnapshot.empty) {
        // First user is admin
        const newUserProfile: UserProfile = {
          uid: user.uid,
          email: email,
          name: name,
          role: "admin",
          approved: true,
          createdAt: Date.now()
        };
        
        await setDoc(doc(db, "users", user.uid), newUserProfile);
        setUserProfile(newUserProfile);
        toast.success("Registro realizado com sucesso!");
        navigate("/");
      } else {
        // Subsequent users need approval
        await setDoc(doc(db, "pendingUsers", user.uid), {
          uid: user.uid,
          email: email,
          name: name,
          requestedAt: Date.now()
        });
        
        toast.info("Sua solicitação de registro foi enviada. Aguarde a aprovação do administrador.");
        await signOut(auth);
        navigate("/login");
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao registrar: " + (error.message || "Tente novamente"));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
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
      await sendPasswordResetEmail(auth, email);
      toast.success("Email de recuperação enviado! Verifique sua caixa de entrada.");
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao enviar email de recuperação: " + (error.message || "Verifique o email"));
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchUserProfile(user);
      } else {
        setUserProfile(null);
      }
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userProfile,
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
