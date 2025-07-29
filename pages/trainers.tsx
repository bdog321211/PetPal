import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { useTrainers } from '../helpers/useQueryHooks';
import { InputType as TrainersInput } from '../endpoints/trainers_GET.schema';
import { TrainerCard } from '../components/TrainerCard';
import { TrainerCardSkeleton } from '../components/TrainerCardSkeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/Select';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Frown, SearchX } from 'lucide-react';
import styles from './trainers.module.css';

const filtersSchema = z.object({
  minRating: z.coerce.number().min(0).max(5).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  available: z.preprocess((val) => val === 'true', z.boolean()).optional(),
});

const TrainersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState<TrainersInput>(() => {
    const params: any = {};
    if (searchParams.get('minRating')) params.minRating = Number(searchParams.get('minRating'));
    if (searchParams.get('maxPrice')) params.maxPrice = Number(searchParams.get('maxPrice'));
    if (searchParams.get('available')) params.available = searchParams.get('available') === 'true';
    return filtersSchema.parse(params);
  });

  const { data: trainers, isFetching, error } = useTrainers(filters);

  const handleFilterChange = (key: keyof TrainersInput, value: string | number | boolean | undefined) => {
    const newFilters = { ...filters, [key]: value };
    
            const cleanedFilters: any = Object.entries(newFilters).reduce((acc, [k, v]) => {
      if (v !== undefined && v !== null && (typeof v !== 'string' || v !== '')) {
        acc[k] = v;
      }
      return acc;
    }, {} as any);

    setFilters(cleanedFilters);
    setSearchParams(cleanedFilters, { replace: true });
  };

  const handleReset = () => {
    setFilters({});
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters = useMemo(() => Object.keys(filters).length > 0, [filters]);

  const renderContent = () => {
    if (isFetching) {
      return (
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <TrainerCardSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.messageContainer}>
          <Frown size={48} className={styles.messageIcon} />
          <h2 className={styles.messageTitle}>Oops! Something went wrong.</h2>
          <p className={styles.messageText}>
            We couldn't load the trainers. Please try again later.
          </p>
          <p className={styles.errorMessage}>{(error as Error).message}</p>
        </div>
      );
    }

    if (!trainers || trainers.length === 0) {
      return (
        <div className={styles.messageContainer}>
          <SearchX size={48} className={styles.messageIcon} />
          <h2 className={styles.messageTitle}>No Trainers Found</h2>
          <p className={styles.messageText}>
            Try adjusting your filters to find the perfect trainer for your pet.
          </p>
        </div>
      );
    }

    return (
      <div className={styles.grid}>
        {trainers.map((trainer) => (
          <TrainerCard key={trainer.id} trainer={trainer} />
        ))}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Pet Trainers | PetPal</title>
        <meta name="description" content="Find and filter professional pet trainers for your furry friend." />
      </Helmet>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Professional Pet Trainers</h1>
          <p className={styles.subtitle}>
            Discover experienced trainers to help your pet learn new skills and behaviors.
          </p>
        </header>

        <div className={styles.filters}>
          <Select
            value={filters.minRating?.toString()}
            onValueChange={(value) => handleFilterChange('minRating', value === '__empty' ? undefined : Number(value))}
          >
            <SelectTrigger className={styles.filterInput}>
              <SelectValue placeholder="Filter by rating..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__empty">Any Rating</SelectItem>
              <SelectItem value="4">4 stars & up</SelectItem>
              <SelectItem value="3">3 stars & up</SelectItem>
              <SelectItem value="2">2 stars & up</SelectItem>
              <SelectItem value="1">1 star & up</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="number"
            placeholder="Max price per hour"
            className={styles.filterInput}
            value={filters.maxPrice ?? ''}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
            min="0"
          />

          <Select
            value={filters.available?.toString()}
            onValueChange={(value) => handleFilterChange('available', value === '__empty' ? undefined : value === 'true')}
          >
            <SelectTrigger className={styles.filterInput}>
              <SelectValue placeholder="Filter by availability..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__empty">Any Availability</SelectItem>
              <SelectItem value="true">Available Now</SelectItem>
              <SelectItem value="false">Not Available</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" onClick={handleReset}>
              Reset
            </Button>
          )}
        </div>

        <main>{renderContent()}</main>
      </div>
    </>
  );
};

export default TrainersPage;