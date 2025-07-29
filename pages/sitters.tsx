import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useSitters } from '../helpers/useQueryHooks';
import { SitterCard } from '../components/SitterCard';
import { SitterCardSkeleton } from '../components/SitterCardSkeleton';
import { Slider } from '../components/Slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/Select';
import { Button } from '../components/Button';
import { AlertCircle, SlidersHorizontal } from 'lucide-react';
import styles from './sitters.module.css';

const SittersPage = () => {
  const [filters, setFilters] = useState({
    minRating: 0,
    maxPrice: 100,
    availability: '__any__', // '__any__', 'true', 'false'
  });

  const { data: sitters, isFetching, error } = useSitters({
    minRating: filters.minRating > 0 ? filters.minRating : undefined,
    maxPrice: filters.maxPrice < 100 ? filters.maxPrice : undefined,
    available: filters.availability === '__any__' ? undefined : filters.availability === 'true',
  });

  const handleResetFilters = () => {
    setFilters({
      minRating: 0,
      maxPrice: 100,
      availability: '__any__',
    });
  };

  const renderContent = () => {
    if (isFetching) {
      return (
        <div className={styles.grid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <SitterCardSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.errorState}>
          <AlertCircle size={48} />
          <h2>Error loading sitters</h2>
          <p>{error instanceof Error ? error.message : 'An unknown error occurred.'}</p>
        </div>
      );
    }

    if (!sitters || sitters.length === 0) {
      return (
        <div className={styles.emptyState}>
          <h2>No sitters match your criteria</h2>
          <p>Try adjusting your filters to find the perfect sitter for your pet.</p>
          <Button variant="outline" onClick={handleResetFilters}>Reset Filters</Button>
        </div>
      );
    }

    return (
      <div className={styles.grid}>
        {sitters.map(sitter => (
          <SitterCard key={sitter.id} sitter={sitter} />
        ))}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Find Pet Sitters - PetPal</title>
        <meta name="description" content="Browse and find trusted pet sitters near you." />
      </Helmet>
      <div className={styles.pageContainer}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Find a Pet Sitter</h1>
            <p className={styles.subtitle}>Discover trusted and reviewed sitters in your area.</p>
          </div>
        </div>

        <div className={styles.filtersContainer}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Min. Rating: {filters.minRating.toFixed(1)} ★</label>
            <Slider
              value={[filters.minRating]}
              onValueChange={([val]) => setFilters(f => ({ ...f, minRating: val }))}
              max={5}
              step={0.5}
            />
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Max Price: ${filters.maxPrice}/hr</label>
            <Slider
              value={[filters.maxPrice]}
              onValueChange={([val]) => setFilters(f => ({ ...f, maxPrice: val }))}
              max={100}
              step={5}
            />
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Availability</label>
            <Select
              value={filters.availability}
              onValueChange={(val) => setFilters(f => ({ ...f, availability: val }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__any__">Any</SelectItem>
                <SelectItem value="true">Available Now</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="ghost" onClick={handleResetFilters} className={styles.resetButton}>
            Reset
          </Button>
        </div>

        {renderContent()}
      </div>
    </>
  );
};

export default SittersPage;