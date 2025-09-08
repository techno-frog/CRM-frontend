import type { FC } from 'react';
import css from './Teams.module.css';

interface IProps { }

const Teams: FC<IProps> = () => {
  return (
    <div className={css.wrapper}>
      teams
    </div>
  );
};

export default Teams;