import React from 'react';
import { Link } from 'react-router-dom';


export const BackToAccounts: React.FC = () => {
  return (
    <div >
      <Link to="/accounts">
        ← Назад к аккаунтам
      </Link>
    </div>
  );
};