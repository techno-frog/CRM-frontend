import type { FC } from 'react';
import css from './Team.module.css';
import { useParams } from 'react-router-dom';

interface IProps { }

const Team: FC<IProps> = () => {

  const { id } = useParams()

  return (
    <div className={css.wrapper}>
      {id}
    </div>
  );
};

export default Team;