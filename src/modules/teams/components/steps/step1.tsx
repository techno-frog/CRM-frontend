import React from 'react';
import { Building2, Plus, UserPlus, ChevronRight, Sparkles } from 'lucide-react';
import css from '../../pages/CreateTeam/CreateTeam.module.css';
import type { StepOneProps } from '../../../../types/teams.types';

export const StepOne: React.FC<StepOneProps> = ({ onActionSelect }) => (
  <div className={css.stepContainer}>
    <div className={css.header}>
      <div className={css.iconWrapper}>
        <Sparkles className={css.sparkleIcon} size={32} />
      </div>
      <h1 className={css.title}>
        Добро пожаловать, <span className={css.gradientText}>бро</span>!
      </h1>
      <p className={css.subtitle}>
        Для работы с платформой тебе нужно присоединиться к команде или создать свою
      </p>
    </div>

    <div className={css.cardsGrid}>
      <div
        className={`${css.actionCard} ${css.createTeam}`}
        onClick={() => onActionSelect('create')}
      >
        <div className={css.cardBg}></div>
        <div className={css.cardContent}>
          <div className={css.cardIcon}>
            <Plus size={24} />
          </div>
          <h3>Создать команду</h3>
          <p>Стань лидером и собери свою команду мечты</p>
          <div className={css.cardArrow}>
            <ChevronRight size={20} />
          </div>
        </div>
      </div>

      <div
        className={`${css.actionCard} ${css.joinTeam}`}
        onClick={() => onActionSelect('join')}
      >
        <div className={css.cardBg}></div>
        <div className={css.cardContent}>
          <div className={css.cardIcon}>
            <UserPlus size={24} />
          </div>
          <h3>Вступить в команду</h3>
          <p>Присоединись к существующей команде по коду</p>
          <div className={css.cardArrow}>
            <ChevronRight size={20} />
          </div>
        </div>
      </div>

      <div
        className={`${css.actionCard} ${css.registerCompany}`}
        onClick={() => onActionSelect('company')}
      >
        <div className={css.cardBg}></div>
        <div className={css.cardContent}>
          <div className={css.cardIcon}>
            <Building2 size={24} />
          </div>
          <h3>Зарегистрировать компанию</h3>
          <p>Создай корпоративный аккаунт для бизнеса</p>
          <div className={css.cardArrow}>
            <ChevronRight size={20} />
          </div>
        </div>
      </div>
    </div>

    <div className={css.decorationDots}>
      <div className={css.dot}></div>
      <div className={css.dot}></div>
      <div className={css.dot}></div>
    </div>
  </div>
);