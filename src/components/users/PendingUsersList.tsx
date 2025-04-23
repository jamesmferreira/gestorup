
import { User, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PendingUser } from '@/types/user';

interface PendingUsersListProps {
  pendingUsers: PendingUser[];
  onApprove: (user: PendingUser) => void;
  onReject: (user: PendingUser) => void;
}

export const PendingUsersList = ({ pendingUsers, onApprove, onReject }: PendingUsersListProps) => {
  if (pendingUsers.length === 0) return null;

  return (
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
                onClick={() => onApprove(user)}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Aprovar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
                onClick={() => onReject(user)}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Recusar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
