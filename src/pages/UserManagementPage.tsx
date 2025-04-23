
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { Card } from '@/components/ui/card';
import { PendingUser, UserProfile } from '@/types/user';
import AppLayout from '@/components/AppLayout';
import { supabase } from '@/integrations/supabase/client';

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
        
        // Fetch approved users
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('*')
          .eq('company_id', userProfile.company_id);
        
        if (usersError) throw usersError;
        
        // Fetch pending users
        const { data: pendingData, error: pendingError } = await supabase
          .from('pending_users')
          .select('*');
        
        if (pendingError) throw pendingError;
        
        setUsers(usersData || []);
        setPendingUsers(pendingData || []);
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
          approved: true,
          company_id: userProfile?.company_id
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
        setUsers(prev => [...prev, newProfile]);
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

  const updateUserRole = async (userId: string, newRole: 'admin' | 'gestor' | 'vendedor') => {
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

        {pendingUsers.length > 0 && (
          <Card className="bg-white p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <User className="w-6 h-6 text-yellow-500 mr-2" />
              Solicitações Pendentes
            </h2>
            
            <div className="space-y-4">
              {pendingUsers.map(user => (
                <div key={user.id} className="border rounded-md p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">
                      Solicitado em: {new Date(user.requested_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-600 hover:bg-green-50"
                      onClick={() => approveUser(user)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => rejectUser(user)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Recusar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="bg-white p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <User className="w-6 h-6 text-blue-500 mr-2" />
            Usuários Registrados
          </h2>
          
          {users.length === 0 ? (
            <p className="text-gray-500">Nenhum usuário aprovado encontrado</p>
          ) : (
            <div className="space-y-4">
              {users.map(user => (
                <div key={user.id} className="border rounded-md p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">
                      Criado em: {new Date(user.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 mr-2">Papel:</span>
                    <Select
                      disabled={user.id === userProfile?.id || (user.role === 'admin' && userProfile?.role !== 'admin')}
                      defaultValue={user.role}
                      onValueChange={(value) => updateUserRole(user.id, value as 'admin' | 'gestor' | 'vendedor')}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {userProfile?.role === 'admin' && <SelectItem value="admin">Admin</SelectItem>}
                        <SelectItem value="gestor">Gestor</SelectItem>
                        <SelectItem value="vendedor">Vendedor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
};

export default UserManagementPage;
