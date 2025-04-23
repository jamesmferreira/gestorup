
import React, { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/components/ui/sonner';

// This is a utility component to create all the necessary test users
// It will automatically run when loaded and then redirect to login page

const Register2UsersPage = () => {
  useEffect(() => {
    const createTestUsers = async () => {
      try {
        toast.info("Iniciando criação de usuários de teste...");
        
        // Create admin user
        await createUserIfNotExists(
          'jamesmferreira@icloud.com',
          '12345678',
          'James Admin',
          'admin'
        );
        
        // Create gestor user
        await createUserIfNotExists(
          'fabimfilho@gmail.com',
          'cliente123',
          'Fabim Gestor',
          'gestor'
        );
        
        // Create first employee
        const employee1 = await createUserIfNotExists(
          'agathameira1516@gmail.com',
          'cliente123',
          'Agatha Funcionário',
          'vendedor'
        );
        
        // Create second employee
        const employee2 = await createUserIfNotExists(
          'rayrasound@hotmail.com',
          'cliente123',
          'Ray Funcionário',
          'vendedor'
        );
        
        // Set up manager relationships
        if (employee1) {
          await setupManagerRelationship(employee1, 'fabimfilho@gmail.com');
        }
        
        if (employee2) {
          await setupManagerRelationship(employee2, 'fabimfilho@gmail.com');
        }
        
        toast.success("Usuários de teste criados com sucesso!");
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
        
      } catch (error) {
        console.error("Error creating test users:", error);
        toast.error("Erro ao criar usuários de teste.");
      }
    };
    
    createTestUsers();
  }, []);
  
  const createUserIfNotExists = async (email: string, password: string, name: string, role: string) => {
    try {
      // Check if user exists in auth
      const { data: existingUsers } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email)
        .single();
      
      if (existingUsers) {
        console.log(`User ${email} already exists, skipping`);
        return null;
      }
      
      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        // The handle_new_user trigger will create a profile, but we update it with the correct role
        await supabase
          .from('profiles')
          .update({ role })
          .eq('id', data.user.id);
        
        toast.success(`Usuário ${email} criado com sucesso`);
        return data.user.id;
      }
      
      return null;
    } catch (error) {
      console.error(`Error creating user ${email}:`, error);
      return null;
    }
  };
  
  const setupManagerRelationship = async (userId: string, managerEmail: string) => {
    try {
      // Get manager ID
      const { data: manager, error: managerError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', managerEmail)
        .single();
      
      if (managerError || !manager) {
        throw new Error(`Manager ${managerEmail} not found`);
      }
      
      // Create relationship
      const { error } = await supabase
        .from('user_managers')
        .insert({
          user_id: userId,
          manager_id: manager.id
        });
      
      if (error) {
        // Check if it's a unique constraint violation (already exists)
        if (error.code === '23505') {
          console.log(`Manager relationship between ${userId} and ${manager.id} already exists`);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error(`Error setting up manager relationship:`, error);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1F2C] flex flex-col items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-xl font-bold mb-4">Criando usuários de teste...</h1>
        <p className="mb-2">Este processo pode levar alguns segundos.</p>
        <p>Você será redirecionado para a página de login automaticamente.</p>
        <div className="mt-4 flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
};

export default Register2UsersPage;
