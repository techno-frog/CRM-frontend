import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal, Search } from 'lucide-react';
import css from './Pagination.module.css';

// Интерфейсы
interface PaginationConfig {
  totalItems: number;
  onPageChange?: (page: number, limit: number) => void;
  onLimitChange?: (limit: number) => void;
  itemsPerPageOptions?: number[];
  showSearch?: boolean;
  showItemsPerPage?: boolean;
  showTotal?: boolean;
  showQuickJumper?: boolean;
  maxVisiblePages?: number;
  disabled?: boolean;
  labels?: {
    previous?: string;
    next?: string;
    itemsPerPage?: string;
    jumpTo?: string;
    go?: string;
    total?: string;
    page?: string;
    of?: string;
    searchPlaceholder?: string;
  };
}

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  persistState?: boolean;
  storageKey?: string;
}

interface UsePaginationReturn {
  Pagination: React.FC<PaginationConfig>;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  resetPagination: () => void;
  canGoNext: (totalItems: number) => boolean;
  canGoPrev: () => boolean;
  getTotalPages: (totalItems: number) => number;
  getOffset: () => number;
  getDisplayRange: (totalItems: number) => { start: number; end: number };
}

const usePagination = (options: UsePaginationOptions = {}): UsePaginationReturn => {
  const {
    initialPage = 1,
    initialLimit = 10,
    persistState = true,
    storageKey = 'pagination-state'
  } = options;

  // Инициализация состояния с поддержкой localStorage
  const [page, setPageState] = useState(() => {
    if (persistState) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed.page || initialPage;
        } catch {
          return initialPage;
        }
      }
    }
    return initialPage;
  });

  const [limit, setLimitState] = useState(() => {
    if (persistState) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed.limit || initialLimit;
        } catch {
          return initialLimit;
        }
      }
    }
    return initialLimit;
  });

  // Сохранение состояния в localStorage
  useEffect(() => {
    if (persistState) {
      localStorage.setItem(storageKey, JSON.stringify({ page, limit }));
    }
  }, [page, limit, persistState, storageKey]);

  // Рефы для стабильного компонента
  const pageRef = useRef(page);
  const limitRef = useRef(limit);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    limitRef.current = limit;
  }, [limit]);

  // Утилиты для использования как в родителе, так и внутри компонента
  const getTotalPages = useCallback((totalItems: number) => {
    return Math.ceil(totalItems / Math.max(1, limit));
  }, [limit]);

  const canGoNext = useCallback((totalItems: number) => {
    return page < getTotalPages(totalItems);
  }, [page, getTotalPages]);

  const canGoPrev = useCallback(() => {
    return page > 1;
  }, [page]);

  const getOffset = useCallback(() => {
    return (page - 1) * limit;
  }, [page, limit]);

  const getDisplayRange = useCallback((totalItems: number) => {
    const start = getOffset() + 1;
    const end = Math.min(start + limit - 1, totalItems);
    return { start, end };
  }, [getOffset, limit]);

  // Варианты утилит на базе ref для стабильного компонента
  const getTotalPagesRef = (totalItems: number) => Math.ceil(totalItems / Math.max(1, limitRef.current));
  const canGoNextRef = (totalItems: number) => pageRef.current < getTotalPagesRef(totalItems);
  const canGoPrevRef = () => pageRef.current > 1;
  const getOffsetRef = () => (pageRef.current - 1) * limitRef.current;
  const getDisplayRangeRef = (totalItems: number) => {
    const start = getOffsetRef() + 1;
    const end = Math.min(start + limitRef.current - 1, totalItems);
    return { start, end };
  };

  // Методы управления пагинацией
  const setPage = useCallback((newPage: number) => {
    // Синхронно обновляем ref, чтобы стабильный компонент сразу видел актуальную страницу
    // и не требовался второй клик из-за запоздалого useEffect
    // @ts-ignore
    pageRef.current = newPage;
    setPageState(newPage);
  }, []);

  const setLimit = useCallback((newLimit: number) => {
    // Синхронно обновляем ref лимита и страницы
    // @ts-ignore
    limitRef.current = newLimit;
    pageRef.current = 1;
    setLimitState(newLimit);
    setPageState(1); // Сброс на первую страницу при изменении лимита
  }, []);

  const nextPage = useCallback(() => {
    //@ts-ignore
    setPageState(prev => prev + 1);
  }, []);

  const prevPage = useCallback(() => {
    //@ts-ignore
    setPageState(prev => Math.max(1, prev - 1));
  }, []);

  const resetPagination = useCallback(() => {
    setPageState(initialPage);
    setLimitState(initialLimit);
  }, [initialPage, initialLimit]);

  // Компонент пагинации (стабильная ссылка через useMemo во избежание размонтирования)
  const Pagination: React.FC<PaginationConfig> = useMemo(() => {
    const Comp: React.FC<PaginationConfig> = ({
      totalItems,
      onPageChange,
      onLimitChange,
      itemsPerPageOptions = [10, 20, 50, 100],
      showSearch = false,
      showItemsPerPage = true,
      showTotal = true,
      showQuickJumper = true,
      maxVisiblePages = 7,
      disabled = false,
      labels = {}
    }) => {
      const defaultLabels = {
        previous: 'Назад',
        next: 'Далее',
        itemsPerPage: 'элементов на странице',
        jumpTo: 'Перейти на страницу',
        go: 'Перейти',
        total: 'Всего',
        page: 'Страница',
        of: 'из',
        searchPlaceholder: 'Поиск...',
        ...labels
      };

      const totalPages = getTotalPagesRef(totalItems);
      const [inputPage, setInputPage] = useState(pageRef.current);
      const [searchTerm, setSearchTerm] = useState('');
      const { start, end } = getDisplayRangeRef(totalItems);

      // Обновляем inputPage только при фактической смене страницы
      const lastPageRef = useRef(pageRef.current);
      useEffect(() => {
        if (lastPageRef.current !== pageRef.current) {
          lastPageRef.current = pageRef.current;
          setInputPage(pageRef.current);
        }
      });

    // Обработчики событий
    const handlePageChange = useCallback((newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages && !disabled) {
        setPage(newPage);
        onPageChange?.(newPage, limitRef.current);
      }
    }, [totalPages, disabled, setPage, onPageChange]);

    const handleLimitChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
      const newLimit = parseInt(event.target.value, 10);
      setLimit(newLimit);
      onLimitChange?.(newLimit);
    }, [setLimit, onLimitChange]);

    const handleInputPageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      if (value === '') {
        setInputPage(1);
        return;
      }
      const newPage = parseInt(value, 10);
      if (!isNaN(newPage)) {
        setInputPage(newPage);
      }
    }, []);

    const handleGoToPage = useCallback(() => {
      handlePageChange(inputPage);
    }, [inputPage, handlePageChange]);

    const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleGoToPage();
      }
    }, [handleGoToPage]);

    // Генерация номеров страниц
    const pageNumbers = useMemo(() => {
      const pages: (number | string)[] = [];
      const half = Math.floor(maxVisiblePages / 2);

      let startPage = Math.max(1, pageRef.current - half);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      // Добавляем первую страницу и многоточие
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('ellipsis-start');
        }
      }

      // Добавляем видимые страницы
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Добавляем многоточие и последнюю страницу
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('ellipsis-end');
        }
        pages.push(totalPages);
      }

      return pages;
    }, [totalPages, maxVisiblePages]);

    if (totalItems === 0) {
      return (
        <div className={css.wrapper}>
          <div className={css.emptyState}>
            Нет данных для отображения, бро
          </div>
        </div>
      );
    }

    return (
      <div className={`${css.wrapper} ${disabled ? css.disabled : ''}`}>
        {/* Поиск */}
        {showSearch && (
          <div className={css.searchSection}>
            <div className={css.searchInput}>
              <Search size={16} className={css.searchIcon} />
              <input
                type="text"
                placeholder={defaultLabels.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>
        )}

        {/* Основная пагинация */}
        <div className={css.mainPagination}>
          {/* Информация о странице */}
          {showTotal && (
            <div className={css.pageInfo}>
              <span>
                {defaultLabels.page} {pageRef.current} {defaultLabels.of} {totalPages}
                ({start}-{end} {defaultLabels.of} {totalItems})
              </span>
            </div>
          )}

          {/* Навигация по страницам */}
          <div className={css.navigation}>
            {/* Предыдущая страница */}
            <button
              onClick={() => handlePageChange(pageRef.current - 1)}
              disabled={!canGoPrevRef() || disabled}
              className={`${css.navButton} ${css.prevButton}`}
              aria-label="Предыдущая страница"
            >
              <ChevronLeft size={16} />
              <span className={css.navButtonText}>{defaultLabels.previous}</span>
            </button>

            {/* Номера страниц */}
            <div className={css.pageNumbers}>
              {pageNumbers.map((pageNum, index) => {
                if (typeof pageNum === 'string') {
                  return (
                    <button
                      key={`${pageNum}-${index}`}
                      className={css.ellipsis}
                      disabled
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  );
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`${css.pageButton} ${pageNum === pageRef.current ? css.activePage : ''}`}
                    disabled={disabled}
                    aria-label={`Страница ${pageNum}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Следующая страница */}
            <button
              onClick={() => handlePageChange(pageRef.current + 1)}
              disabled={!canGoNextRef(totalItems) || disabled}
              className={`${css.navButton} ${css.nextButton}`}
              aria-label="Следующая страница"
            >
              <span className={css.navButtonText}>{defaultLabels.next}</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Дополнительные контролы */}
        {(showQuickJumper || showItemsPerPage) && (
          <div className={css.controls}>
            {/* Быстрый переход */}
            {showQuickJumper && (
              <div className={css.quickJump}>
                <span>{defaultLabels.jumpTo}:</span>
                <input
                  type="number"
                  value={inputPage}
                  onChange={handleInputPageChange}
                  onKeyPress={handleKeyPress}
                  min="1"
                  max={totalPages}
                  disabled={disabled}
                  className={css.jumpInput}
                />
                <button
                  onClick={handleGoToPage}
                  disabled={disabled}
                  className={css.goButton}
                >
                  {defaultLabels.go}
                </button>
              </div>
            )}

            {/* Выбор количества элементов на странице */}
            {showItemsPerPage && (
              <div className={css.itemsPerPage}>
                <span>Показать:</span>
                <select
                  value={limit}
                  onChange={handleLimitChange}
                  disabled={disabled}
                  className={css.limitSelect}
                >
                  {itemsPerPageOptions.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <span>{defaultLabels.itemsPerPage}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
    };
    return Comp;
  }, []);

  return {
    Pagination,
    page,
    limit,
    setPage,
    setLimit,
    nextPage,
    prevPage,
    resetPagination,
    canGoNext,
    canGoPrev,
    getTotalPages,
    getOffset,
    getDisplayRange
  };
};

export default usePagination;
