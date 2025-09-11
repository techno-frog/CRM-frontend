import type { FC } from 'react';
import css from './TeamLayout.module.css';
import { Outlet } from 'react-router-dom';

interface IProps { }

const TeamLayout: FC<IProps> = () => {
  return (
    <div className={css.wrapper}>
      <Outlet />
    </div>
  );
};

export default TeamLayout;