import React from 'react';
import { Button } from './Button';
import { Edit, Calendar, Weight, Info } from 'lucide-react';
import type { Selectable } from 'kysely';
import type { Pets } from '../helpers/schema';
import styles from './PetCard.module.css';

interface PetCardProps {
  pet: Selectable<Pets>;
  onEdit?: (pet: Selectable<Pets>) => void;
}

export const PetCard = ({ pet, onEdit }: PetCardProps) => {
  const handleEdit = () => {
    if (onEdit) {
      onEdit(pet);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        {pet.imageUrl ? (
          <img src={pet.imageUrl} alt={pet.name} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span className={styles.petType}>{pet.type.toUpperCase()}</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          className={styles.editButton}
          onClick={handleEdit}
          aria-label={`Edit ${pet.name}`}
        >
          <Edit size={14} />
        </Button>
      </div>
      
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.name}>{pet.name}</h3>
          <span className={styles.type}>{pet.type}</span>
        </div>
        
        {pet.breed && (
          <p className={styles.breed}>{pet.breed}</p>
        )}
        
        <div className={styles.details}>
          {pet.age && (
            <div className={styles.detail}>
              <Calendar size={14} />
              <span>{pet.age} years old</span>
            </div>
          )}
          {pet.weight && (
            <div className={styles.detail}>
              <Weight size={14} />
              <span>{pet.weight} lbs</span>
            </div>
          )}
        </div>
        
        {pet.description && (
          <div className={styles.description}>
            <Info size={14} />
            <p>{pet.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};