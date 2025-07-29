import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { ArrowRight, PawPrint, Users, Store } from 'lucide-react';
import styles from './_index.module.css';

const IndexPage = () => {
  const features = [
    {
      icon: <PawPrint size={24} className={styles.featureIcon} />,
      title: 'Your Pet Dashboard',
      description: 'Keep all your pets\' information organized in one place. Track their health, age, and important details effortlessly.',
      link: '/pets',
      linkText: 'Go to Dashboard',
    },
    {
      icon: <Users size={24} className={styles.featureIcon} />,
      title: 'Find Local Sitters',
      description: 'Discover trusted and reviewed pet sitters in your area. Filter by price, rating, and availability to find the perfect match.',
      link: '/sitters',
      linkText: 'Browse Sitters',
    },
    {
      icon: <Store size={24} className={styles.featureIcon} />,
      title: 'Nearby Stores & Trainers',
      description: 'Locate the best pet stores, groomers, and professional trainers near you. Your one-stop-shop for all pet needs.',
      link: '/stores',
      linkText: 'Find Services',
    },
  ];

  return (
    <>
      <Helmet>
        <title>PetPal - All-in-One Pet Care</title>
        <meta
          name="description"
          content="Welcome to PetPal, the ultimate app for pet lovers. Manage your pets, find trusted sitters, discover local services, and connect with a vibrant community."
        />
      </Helmet>
      <div className={styles.pageContainer}>
        <header className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              All-in-one care <br />
              for your best friend.
            </h1>
            <p className={styles.heroSubtitle}>
              PetPal simplifies pet ownership. Manage profiles, find trusted sitters, discover local services, and connect with a community that loves pets as much as you do.
            </p>
            <div className={styles.heroActions}>
              <Button asChild size="lg">
                <Link to="/pets">
                  Get Started <ArrowRight size={20} />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link to="/sitters">Find a Sitter</Link>
              </Button>
            </div>
          </div>
          <div className={styles.heroImageContainer}>
            <img
              src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b"
              alt="A happy dog and a person sitting on a bench"
              className={styles.heroImage}
            />
          </div>
        </header>

        <main className={styles.featuresSection}>
          <div className={styles.featuresGrid}>
            {features.map((feature) => (
              <div key={feature.title} className={styles.featureCard}>
                <div className={styles.featureHeader}>
                  {feature.icon}
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                </div>
                <p className={styles.featureDescription}>{feature.description}</p>
                <Button asChild variant="link" className={styles.featureLink}>
                  <Link to={feature.link}>
                    {feature.linkText} <ArrowRight size={16} />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
};

export default IndexPage;