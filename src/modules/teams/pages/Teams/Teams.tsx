import type { FC } from 'react';
import css from './Teams.module.css';
import { useGetMyTeamsPaginatedQuery } from '../../../../api/teamsApi';
import usePagination from '../../../../shared/components/Pagination/Navigation/usePagination';
import TeamList from '../../components/TeamList/TeamList';


interface IProps { }

const Teams: FC<IProps> = () => {
  const { Pagination, page, limit, setPage, setLimit } = usePagination({
    initialPage: 1,
    initialLimit: 10,
    persistState: true,
    storageKey: 'teams-pagination'
  });
  const { data, isFetching } = useGetMyTeamsPaginatedQuery({ page, limit });

  return (
    <div className={css.wrapper}>
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

    </div>
  );
};

export default Teams;
