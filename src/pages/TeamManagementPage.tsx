import React from 'react';
import { useForm } from 'react-hook-form';

// Definindo interface corretamente
interface ColaboradorFormData {
  nome: string;
  email: string;
  cargo?: string;
}

const TeamManagementPage = () => {
  const { handleSubmit, register } = useForm<ColaboradorFormData>();

  const onSubmit = (data: ColaboradorFormData) => {
    // Submitting form data without type transformation
    console.log(data);
  };

  return (
    <div>
      <h1>Gerenciamento da Equipe</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Nome:</label>
          <input type="text" {...register('nome', { required: true })} />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" {...register('email', { required: true })} />
        </div>
        <div>
          <label>Cargo:</label>
          <input type="text" {...register('cargo')} />
        </div>
        <button type="submit">Adicionar Colaborador</button>
      </form>
    </div>
  );
};

export default TeamManagementPage;
