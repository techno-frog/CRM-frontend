import type { FC } from 'react';
import { useState } from 'react';
import { Plus, UserPlus } from 'lucide-react';
import css from './Teams.module.css';
import { useGetMyTeamsPaginatedQuery } from '../../../../api/teamsApi';
import usePagination from '../../../../shared/components/Pagination/Navigation/usePagination';
import TeamList from '../../components/TeamList/TeamList';
import { CreateTeamModal } from '../../components/CreateTeamModal/CreateTeamModal';
import { JoinTeamModal } from '../../components/JoinTeamModal/JoinTeamModal';


interface IProps { }

const Teams: FC<IProps> = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const { Pagination, page, limit, setPage, setLimit } = usePagination({
    initialPage: 1,
    initialLimit: 10,
    persistState: true,
    storageKey: 'teams-pagination'
  });
  const { data, isFetching } = useGetMyTeamsPaginatedQuery({ page, limit });

  return (
    <div className={css.wrapper}>
      <div className={css.header}>
        <h1 className={css.title}>Команды</h1>
        <div className={css.actions}>
          <button
            className={css.joinBtn}
            onClick={() => setIsJoinModalOpen(true)}
          >
            <UserPlus size={20} />
            Присоединиться к команде
          </button>
          <button
            className={css.createBtn}
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={20} />
            Создать команду
          </button>
        </div>
      </div>

      <TeamList items={data?.items} loading={isFetching} />

      <div className={css.footer}>
        <Pagination
          totalItems={data?.total || 0}
          onPageChange={(p) => setPage(p)}
          onLimitChange={(l) => setLimit(l)}
          itemsPerPageOptions={[10, 20, 50, 100]}
          showItemsPerPage={false}
          showTotal={false}
          showQuickJumper={false}
          maxVisiblePages={7}
          disabled={isFetching}
          labels={{
            previous: 'Назад',
            next: 'Далее',
            itemsPerPage: 'на страницу',
            jumpTo: 'Перейти к странице',
            go: 'Вперёд'
          }}
        />
      </div>

      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <JoinTeamModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />
    </div>
  );
};

export default Teams;
