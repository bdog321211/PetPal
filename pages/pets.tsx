import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { usePets } from '../helpers/useQueryHooks';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { PetCard } from '../components/PetCard';
import { PetCardSkeleton } from '../components/PetCardSkeleton';
import { AddPetDialog } from '../components/AddPetDialog';
import { EditPetDialog } from '../components/EditPetDialog';
import { Plus, Search, AlertCircle } from 'lucide-react';
import type { Selectable } from 'kysely';
import type { Pets } from '../helpers/schema';
import styles from './pets.module.css';

const PetsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddPetDialogOpen, setAddPetDialogOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Selectable<Pets> | null>(null);

  // For now, we fetch all pets. In a real app, this would be scoped to the logged-in user.
  const { data: pets, isFetching, error } = usePets({});

  const filteredPets = pets?.filter(pet =>
    pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderContent = () => {
    if (isFetching) {
      return (
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <PetCardSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.errorState}>
          <AlertCircle size={48} />
          <h2>Error loading pets</h2>
          <p>{error instanceof Error ? error.message : 'An unknown error occurred.'}</p>
        </div>
      );
    }

    if (!filteredPets || filteredPets.length === 0) {
      return (
        <div className={styles.emptyState}>
          <h2>No pets found</h2>
          <p>Your pet dashboard is empty. Add your first pet to get started!</p>
          <Button onClick={() => setAddPetDialogOpen(true)}>
            <Plus size={16} /> Add Pet
          </Button>
        </div>
      );
    }

    return (
      <div className={styles.grid}>
        {filteredPets.map(pet => (
          <PetCard 
            key={pet.id} 
            pet={pet} 
            onEdit={(pet) => setEditingPet(pet)}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>My Pets - PetPal</title>
        <meta name="description" content="Manage all your pets in one place." />
      </Helmet>
      <div className={styles.pageContainer}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>My Pets</h1>
            <p className={styles.subtitle}>Your personal pet dashboard.</p>
          </div>
          <Button onClick={() => setAddPetDialogOpen(true)}>
            <Plus size={16} /> Add New Pet
          </Button>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <Input
              type="search"
              placeholder="Search by name, breed, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        {renderContent()}
      </div>
      <AddPetDialog
        isOpen={isAddPetDialogOpen}
        onOpenChange={setAddPetDialogOpen}
      />
      {editingPet && (
        <EditPetDialog
          pet={editingPet}
          isOpen={!!editingPet}
          onOpenChange={(open) => {
            if (!open) {
              setEditingPet(null);
            }
          }}
        />
      )}
    </>
  );
};

export default PetsPage;