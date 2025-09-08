import React from 'react';
import { Link } from 'react-router-dom';
import css from './AccountsPage.module.css';

export const AccountsPage: React.FC = () => {
  const mockAccounts = [
    { id: '1', name: 'Account 1', status: 'active' },
    { id: '2', name: 'Account 2', status: 'inactive' },
    { id: '3', name: 'Account 3', status: 'active' },
  ];

  return (
    <div className={css.container}>
      <h1>Управление аккаунтами</h1>
      <div className={css.accountsList}>
        {mockAccounts.map(account => (
          <div key={account.id} className={css.accountCard}>
            <h3>{account.name}</h3>
            <p>Статус: {account.status}</p>
            <Link to={`/accounts/chats/${account.id}`} className={css.link}>
              Открыть диалоги
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};