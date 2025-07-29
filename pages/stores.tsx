import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { useStores } from '../helpers/useQueryHooks';
import { ServiceCategoryArrayValues } from '../helpers/schema';
import { InputType as StoresInput } from '../endpoints/stores_GET.schema';
import { StoreCard } from '../components/StoreCard';
import { StoreCardSkeleton } from '../components/StoreCardSkeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/Select';
import { Button } from '../components/Button';
import { Frown, SearchX } from 'lucide-react';
import styles from './stores.module.css';

const filtersSchema = z.object({
  category: z.enum(ServiceCategoryArrayValues).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  priceRange: z.enum(['$', '$$', '$$$']).optional(),
});

const StoresPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState<StoresInput>(() => {
    const params: any = {};
    if (searchParams.get('category')) params.category = searchParams.get('category');
    if (searchParams.get('minRating')) params.minRating = Number(searchParams.get('minRating'));
    if (searchParams.get('priceRange')) params.priceRange = searchParams.get('priceRange');
    return filtersSchema.parse(params);
  });

  const { data: stores, isFetching, error } = useStores(filters);

  const handleFilterChange = (key: keyof StoresInput, value: string | number | undefined) => {
    const newFilters = { ...filters, [key]: value };
    
    // Remove undefined or empty values
    const cleanedFilters: any = Object.entries(newFilters).reduce((acc, [k, v]) => {
      if (v !== undefined && v !== '') {
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
            <StoreCardSkeleton key={i} />
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
            We couldn't load the stores. Please try again later.
          </p>
          <p className={styles.errorMessage}>{(error as Error).message}</p>
        </div>
      );
    }

    if (!stores || stores.length === 0) {
      return (
        <div className={styles.messageContainer}>
          <SearchX size={48} className={styles.messageIcon} />
          <h2 className={styles.messageTitle}>No Stores Found</h2>
          <p className={styles.messageText}>
            Try adjusting your filters to find the perfect store for your pet.
          </p>
        </div>
      );
    }

    return (
      <div className={styles.grid}>
        {stores.map((store) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Pet Stores & Services | PetPal</title>
        <meta name="description" content="Browse and filter local pet stores, veterinary clinics, and grooming services." />
      </Helmet>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Pet Stores & Services</h1>
          <p className={styles.subtitle}>
            Find the best places for your pet's needs, from food and toys to grooming and healthcare.
          </p>
        </header>

        <div className={styles.filters}>
          <Select
            value={filters.category}
            onValueChange={(value) => handleFilterChange('category', value === '__empty' ? undefined : value)}
          >
            <SelectTrigger className={styles.filterInput}>
              <SelectValue placeholder="Filter by category..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__empty">All Categories</SelectItem>
              {ServiceCategoryArrayValues.map((cat) => (
                <SelectItem key={cat} value={cat} className={styles.capitalize}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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

          <Select
            value={filters.priceRange}
            onValueChange={(value) => handleFilterChange('priceRange', value === '__empty' ? undefined : value)}
          >
            <SelectTrigger className={styles.filterInput}>
              <SelectValue placeholder="Filter by price..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__empty">Any Price</SelectItem>
              <SelectItem value="$">$ (Affordable)</SelectItem>
              <SelectItem value="$$">$$ (Moderate)</SelectItem>
              <SelectItem value="$$$">$$$ (Premium)</SelectItem>
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

export default StoresPage;