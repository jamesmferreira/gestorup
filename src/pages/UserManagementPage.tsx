
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { PendingUser, UserProfile } from '@/types/user';
import AppLayout from '@/components/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { PendingUsersList } from '@/components/users/PendingUsersList';
import { RegisteredUsersList } from '@/components/users/RegisteredUsersList';

const UserManagementPage = () => {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      if (userProfile?.role !== 'admin' && userProfile?.role !== 'gestor') {
        toast.error('Você não tem permissão para acessar esta página');
        return;
      }

      try {
        setLoading(true);
        
        // Fetch approved users (no more filtering by company_id)
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('*');
        
        if (usersError) throw usersError;
        
        // Fetch pending users
        const { data: pendingData, error: pendingError } = await supabase
          .from('pending_users')
          .select('*');
        
        if (pendingError) throw pendingError;
        
        // Convert the data to match our UserProfile type
        setUsers(usersData as UserProfile[] || []);
        setPendingUsers(pendingData as PendingUser[] || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Erro ao carregar os usuários');
      } finally {
        setLoading(false);
      }
    };

    if (userProfile) {
      fetchUsers();
    }
  }, [userProfile]);

  const approveUser = async (pendingUser: PendingUser) => {
    try {
      // Create user profile
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: pendingUser.id,
          email: pendingUser.email,
          name: pendingUser.name,
          role: 'vendedor', // Default role
          approved: true
        });
      
      if (insertError) throw insertError;
      
      // Remove from pending users
      const { error: deleteError } = await supabase
        .from('pending_users')
        .delete()
        .eq('id', pendingUser.id);
      
      if (deleteError) throw deleteError;
      
      toast.success(`Usuário ${pendingUser.email} aprovado com sucesso!`);
      
      // Update the UI
      setPendingUsers(prev => prev.filter(user => user.id !== pendingUser.id));
      
      // Fetch the newly created profile with full data including timestamps
      const { data: newProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', pendingUser.id)
        .single();
      
      if (newProfile) {
        setUsers(prev => [...prev, newProfile as UserProfile]);
      }
    } catch (error: any) {
      console.error('Error approving user:', error);
      toast.error('Erro ao aprovar usuário: ' + (error.message || 'Tente novamente'));
    }
  };

  const rejectUser = async (pendingUser: PendingUser) => {
    try {
      const { error } = await supabase
        .from('pending_users')
        .delete()
        .eq('id', pendingUser.id);
      
      if (error) throw error;
      
      toast.success(`Solicitação de ${pendingUser.email} rejeitada`);
      setPendingUsers(prev => prev.filter(user => user.id !== pendingUser.id));
    } catch (error: any) {
      console.error('Error rejecting user:', error);
      toast.error('Erro ao rejeitar solicitação: ' + (error.message || 'Tente novamente'));
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
      
      toast.success('Papel do usuário atualizado com sucesso');
      
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast.error('Erro ao atualizar papel do usuário: ' + (error.message || 'Tente novamente'));
    }
  };

  if (userProfile?.role !== 'admin' && userProfile?.role !== 'gestor') {
    return (
      <AppLayout>
        <div className="container mx-auto p-4">
          <p>Você não tem permissão para acessar esta página.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-4">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Usuários</h1>
          <p className="text-gray-600">Aprovar, rejeitar e gerenciar usuários do sistema</p>
        </header>

        <PendingUsersList 
          pendingUsers={pendingUsers}
          onApprove={approveUser}
          onReject={rejectUser}
        />

        <RegisteredUsersList 
          users={users}
          currentUserId={userProfile?.id}
          currentUserRole={userProfile?.role}
          onUpdateRole={updateUserRole}
        />
      </div>
    </AppLayout>
  );
};

export default UserManagementPage;
