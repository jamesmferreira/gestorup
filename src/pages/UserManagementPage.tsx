
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, Users, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { Card } from '@/components/ui/card';
import { PendingUser, UserProfile } from '@/types/user';
import AppLayout from '@/components/AppLayout';

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
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const pendingSnapshot = await getDocs(collection(db, 'pendingUsers'));
        
        const usersData: UserProfile[] = [];
        usersSnapshot.forEach(doc => {
          usersData.push(doc.data() as UserProfile);
        });
        
        const pendingData: PendingUser[] = [];
        pendingSnapshot.forEach(doc => {
          pendingData.push(doc.data() as PendingUser);
        });
        
        setUsers(usersData);
        setPendingUsers(pendingData);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Erro ao carregar os usuários');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [userProfile]);

  const approveUser = async (pendingUser: PendingUser) => {
    try {
      // Create user profile
      const newUserProfile: UserProfile = {
        uid: pendingUser.uid,
        email: pendingUser.email || '',
        name: pendingUser.name || '',
        role: 'vendedor', // Default role
        approved: true,
        createdAt: Date.now()
      };
      
      await setDoc(doc(db, 'users', pendingUser.uid), newUserProfile);
      await deleteDoc(doc(db, 'pendingUsers', pendingUser.uid));
      
      toast.success(`Usuário ${pendingUser.email} aprovado com sucesso!`);
      
      // Update the UI
      setPendingUsers(prev => prev.filter(user => user.uid !== pendingUser.uid));
      setUsers(prev => [...prev, newUserProfile]);
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Erro ao aprovar usuário');
    }
  };

  const rejectUser = async (pendingUser: PendingUser) => {
    try {
      await deleteDoc(doc(db, 'pendingUsers', pendingUser.uid));
      toast.success(`Solicitação de ${pendingUser.email} rejeitada`);
      setPendingUsers(prev => prev.filter(user => user.uid !== pendingUser.uid));
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast.error('Erro ao rejeitar solicitação');
    }
  };

  const updateUserRole = async (uid: string, newRole: 'admin' | 'gestor' | 'vendedor') => {
    try {
      await updateDoc(doc(db, 'users', uid), {
        role: newRole
      });
      
      toast.success('Papel do usuário atualizado com sucesso');
      
      setUsers(prev => prev.map(user => 
        user.uid === uid ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Erro ao atualizar papel do usuário');
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
              <Users className="w-6 h-6 text-yellow-500 mr-2" />
              Solicitações Pendentes
            </h2>
            
            <div className="space-y-4">
              {pendingUsers.map(user => (
                <div key={user.uid} className="border rounded-md p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">
                      Solicitado em: {new Date(user.requestedAt).toLocaleString()}
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
                <div key={user.uid} className="border rounded-md p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">
                      Criado em: {new Date(user.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 mr-2">Papel:</span>
                    <Select
                      disabled={user.uid === userProfile?.uid || (user.role === 'admin' && userProfile?.role !== 'admin')}
                      defaultValue={user.role}
                      onValueChange={(value) => updateUserRole(user.uid, value as 'admin' | 'gestor' | 'vendedor')}
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
