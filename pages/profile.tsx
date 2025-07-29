import React from 'react';
import { Helmet } from 'react-helmet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/Tabs';
import { ProfileForm } from '../components/ProfileForm';
import { SettingsSection } from '../components/SettingsSection';
import { useUserProfile } from '../helpers/useUserProfile';
import { Skeleton } from '../components/Skeleton';
import styles from './profile.module.css';

export default function ProfilePage() {
  const { userProfile, settings, updateProfile, updateSettings, isLoading } = useUserProfile();

  const ProfileSkeleton = () => (
    <div className={styles.skeletonContainer}>
      <div className={styles.skeletonHeader}>
        <Skeleton style={{ width: '120px', height: '120px', borderRadius: '50%' }} />
        <div className={styles.skeletonHeaderText}>
          <Skeleton style={{ width: '250px', height: '2rem', marginBottom: 'var(--spacing-2)' }} />
          <Skeleton style={{ width: '200px', height: '1rem' }} />
        </div>
      </div>
      <div className={styles.skeletonForm}>
        <Skeleton style={{ width: '100%', height: '2.5rem' }} />
        <Skeleton style={{ width: '100%', height: '2.5rem' }} />
        <Skeleton style={{ width: '100%', height: '6rem' }} />
        <Skeleton style={{ width: '120px', height: '2.5rem', alignSelf: 'flex-end' }} />
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Profile & Settings - PetPal</title>
        <meta name="description" content="Manage your PetPal profile and application settings." />
      </Helmet>
      <div className={styles.pageContainer}>
        <header className={styles.pageHeader}>
          <h1>Profile & Settings</h1>
          <p>Update your personal information and customize your experience.</p>
        </header>

        <Tabs defaultValue="profile" className={styles.tabs}>
          <TabsList>
            <TabsTrigger value="profile">My Profile</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className={styles.tabContent}>
            {isLoading ? (
              <ProfileSkeleton />
            ) : (
              userProfile && <ProfileForm userProfile={userProfile} onSave={updateProfile} />
            )}
          </TabsContent>
          <TabsContent value="settings" className={styles.tabContent}>
             {isLoading ? (
              <ProfileSkeleton />
            ) : (
              settings && <SettingsSection settings={settings} onSave={updateSettings} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}