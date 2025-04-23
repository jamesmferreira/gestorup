
import { User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserProfile } from '@/types/user';

interface RegisteredUsersListProps {
  users: UserProfile[];
  currentUserId?: string;
  currentUserRole?: string;
  onUpdateRole: (userId: string, newRole: string) => void;
}

export const RegisteredUsersList = ({ 
  users, 
  currentUserId, 
  currentUserRole, 
  onUpdateRole 
}: RegisteredUsersListProps) => {
  return (
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
                  disabled={user.id === currentUserId || (user.role === 'admin' && currentUserRole !== 'admin')}
                  defaultValue={user.role}
                  onValueChange={(value) => onUpdateRole(user.id, value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currentUserRole === 'admin' && <SelectItem value="admin">Admin</SelectItem>}
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
  );
};
