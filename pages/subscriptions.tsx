import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Star, ShieldCheck, BarChart2, Loader2, AlertTriangle } from 'lucide-react';
import { useSubscriptionPlans, useUserSubscription, useSubscribe, useCancelSubscription } from '../helpers/useSubscriptionQueries';
import { useAuth } from '../helpers/useAuth';
import { Button } from '../components/Button';
import { Skeleton } from '../components/Skeleton';
import { Badge } from '../components/Badge';
import { Separator } from '../components/Separator';
import styles from './subscriptions.module.css';
import type { Selectable } from 'kysely';
import type { SubscriptionPlans, JsonObject } from '../helpers/schema';

const PlanCardSkeleton = () => (
  <div className={styles.planCard}>
    <Skeleton style={{ height: '2rem', width: '60%', marginBottom: 'var(--spacing-2)' }} />
    <Skeleton style={{ height: '3rem', width: '40%', marginBottom: 'var(--spacing-4)' }} />
    <Skeleton style={{ height: '1.25rem', width: '80%', marginBottom: 'var(--spacing-6)' }} />
    <div className={styles.featuresList}>
      {[...Array(3)].map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)' }}>
          <Skeleton style={{ width: '1.5rem', height: '1.5rem', borderRadius: 'var(--radius-full)' }} />
          <Skeleton style={{ height: '1rem', width: '70%' }} />
        </div>
      ))}
    </div>
    <Skeleton style={{ height: '2.5rem', width: '100%', marginTop: 'auto' }} />
  </div>
);

const CurrentPlanSkeleton = () => (
  <div className={styles.currentPlan}>
    <Skeleton style={{ height: '1.5rem', width: '200px', marginBottom: 'var(--spacing-4)' }} />
    <div className={styles.currentPlanDetails}>
      <Skeleton style={{ height: '2rem', width: '150px' }} />
      <Skeleton style={{ height: '1rem', width: '250px' }} />
    </div>
    <Skeleton style={{ height: '2.5rem', width: '150px' }} />
  </div>
);

const FeatureIcon = ({ feature }: { feature: string }) => {
  if (feature.toLowerCase().includes('priority')) return <Star className={styles.featureIcon} />;
  if (feature.toLowerCase().includes('analytics')) return <BarChart2 className={styles.featureIcon} />;
  if (feature.toLowerCase().includes('verified')) return <ShieldCheck className={styles.featureIcon} />;
  return <CheckCircle className={styles.featureIcon} />;
};

const PlanCard = ({
  plan,
  onSubscribe,
  isSubscribing,
  isCurrentPlan,
  isLoggedIn,
}: {
  plan: Selectable<SubscriptionPlans>;
  onSubscribe: (planId: number) => void;
  isSubscribing: boolean;
  isCurrentPlan: boolean;
  isLoggedIn: boolean;
}) => {
  const features = (plan.features as JsonObject)?.features as string[] || [];
  return (
    <div className={`${styles.planCard} ${isCurrentPlan ? styles.current : ''}`}>
      {isCurrentPlan && <div className={styles.currentBadge}>Current Plan</div>}
      <h3 className={styles.planName}>{plan.name}</h3>
      <div className={styles.planPrice}>
        ${Number(plan.price).toFixed(2)}
        <span className={styles.priceInterval}>/ month</span>
      </div>
      <p className={styles.planDescription}>{plan.description}</p>
      <ul className={styles.featuresList}>
        {features.map((feature, index) => (
          <li key={index}>
            <FeatureIcon feature={feature} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button
        onClick={() => onSubscribe(plan.id)}
        disabled={isSubscribing || isCurrentPlan || !isLoggedIn}
        className={styles.subscribeButton}
        variant={plan.name === 'Premium' ? 'primary' : 'outline'}
      >
        {isSubscribing && <Loader2 className="animate-spin" />}
        {isCurrentPlan ? 'Subscribed' : 'Choose Plan'}
      </Button>
    </div>
  );
};

const SubscriptionsPage = () => {
  const { authState } = useAuth();
  const isLoggedIn = authState.type === 'authenticated';

  const { data: plans, isFetching: isLoadingPlans, error: plansError } = useSubscriptionPlans();
  const { data: userSubscription, isFetching: isLoadingUserSub, error: userSubError } = useUserSubscription({ enabled: isLoggedIn });

  const subscribeMutation = useSubscribe();
  const cancelMutation = useCancelSubscription();

  const handleSubscribe = (planId: number) => {
    if (!isLoggedIn) {
      toast.error('Please log in to subscribe.');
      return;
    }
    subscribeMutation.mutate({ planId });
  };

  const handleCancel = () => {
    if (userSubscription) {
      cancelMutation.mutate({ userSubscriptionId: userSubscription.id });
    }
  };

  const renderCurrentPlan = () => {
    if (!isLoggedIn) {
      return (
        <div className={styles.currentPlan}>
          <h4>Your Subscription</h4>
          <p>Please <Link to="/login" className={styles.inlineLink}>log in</Link> to see your subscription status.</p>
        </div>
      );
    }

    if (isLoadingUserSub) return <CurrentPlanSkeleton />;
    if (userSubError) return <div className={styles.errorState}><AlertTriangle /> Failed to load subscription status.</div>;

    if (userSubscription) {
      return (
        <div className={styles.currentPlan}>
          <h4>Your Current Plan</h4>
          <div className={styles.currentPlanDetails}>
            <Badge variant="success">{userSubscription.planName}</Badge>
            <p>
              Renews on: {new Date(userSubscription.endDate).toLocaleDateString()}
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleCancel}
            disabled={cancelMutation.isPending}
          >
            {cancelMutation.isPending && <Loader2 className="animate-spin" />}
            Cancel Subscription
          </Button>
        </div>
      );
    }

    return (
      <div className={styles.currentPlan}>
        <h4>Your Subscription</h4>
        <p>You are currently on the Free plan. Upgrade to unlock more features!</p>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Subscriptions - Floot</title>
        <meta name="description" content="Manage your Floot subscription and unlock premium features." />
      </Helmet>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Choose Your Plan</h1>
          <p>Unlock powerful features to give your pets the best care.</p>
        </header>

        {renderCurrentPlan()}

        <Separator />

        <section className={styles.plansGrid}>
          {isLoadingPlans && [...Array(3)].map((_, i) => <PlanCardSkeleton key={i} />)}
          {plansError && <div className={styles.errorState}><AlertTriangle /> Failed to load subscription plans. Please try again later.</div>}
          {plans?.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onSubscribe={handleSubscribe}
              isSubscribing={subscribeMutation.isPending && subscribeMutation.variables?.planId === plan.id}
              isCurrentPlan={userSubscription?.planId === plan.id}
              isLoggedIn={isLoggedIn}
            />
          ))}
        </section>

        <Separator />

        <section className={styles.featureComparison}>
          <h2>Feature Comparison</h2>
          <div className={styles.tableContainer}>
            <table className={styles.comparisonTable}>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Free</th>
                  <th>Pro</th>
                  <th>Premium</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Pet Profiles</td>
                  <td><CheckCircle className={styles.check} /></td>
                  <td><CheckCircle className={styles.check} /></td>
                  <td><CheckCircle className={styles.check} /></td>
                </tr>
                <tr>
                  <td>Basic Search</td>
                  <td><CheckCircle className={styles.check} /></td>
                  <td><CheckCircle className={styles.check} /></td>
                  <td><CheckCircle className={styles.check} /></td>
                </tr>
                <tr>
                  <td>Community Access</td>
                  <td><CheckCircle className={styles.check} /></td>
                  <td><CheckCircle className={styles.check} /></td>
                  <td><CheckCircle className={styles.check} /></td>
                </tr>
                <tr>
                  <td>Advanced Service Filters</td>
                  <td><XCircle className={styles.cross} /></td>
                  <td><CheckCircle className={styles.check} /></td>
                  <td><CheckCircle className={styles.check} /></td>
                </tr>
                <tr>
                  <td>Verified Sitter/Trainer Badge</td>
                  <td><XCircle className={styles.cross} /></td>
                  <td><CheckCircle className={styles.check} /></td>
                  <td><CheckCircle className={styles.check} /></td>
                </tr>
                <tr>
                  <td>Booking Priority</td>
                  <td><XCircle className={styles.cross} /></td>
                  <td><XCircle className={styles.cross} /></td>
                  <td><CheckCircle className={styles.check} /></td>
                </tr>
                <tr>
                  <td>Advanced Pet Health Analytics</td>
                  <td><XCircle className={styles.cross} /></td>
                  <td><XCircle className={styles.cross} /></td>
                  <td><CheckCircle className={styles.check} /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
};

export default SubscriptionsPage;