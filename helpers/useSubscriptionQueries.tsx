import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getSubscriptionPlans } from '../endpoints/subscriptions/plans_GET.schema';
import { getUserSubscription, OutputType as UserSubscriptionType } from '../endpoints/subscriptions/user_GET.schema';
import { postSubscribe, InputType as SubscribeInput } from '../endpoints/subscriptions/subscribe_POST.schema';
import { postCancelSubscription, InputType as CancelInput } from '../endpoints/subscriptions/cancel_POST.schema';

export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: getSubscriptionPlans,
  });
};

export const useUserSubscription = (options: { enabled: boolean }) => {
  return useQuery({
    queryKey: ['userSubscription'],
    queryFn: getUserSubscription,
    enabled: options.enabled,
    // It's important to refetch on window focus to get the latest subscription status
    refetchOnWindowFocus: true,
  });
};

export const useSubscribe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SubscribeInput) => postSubscribe(data),
    onSuccess: (newSubscription) => {
      toast.success('Successfully subscribed!');
      // Optimistically update the user's subscription data
      const plan = queryClient.getQueryData<Awaited<ReturnType<typeof getSubscriptionPlans>>>(['subscriptionPlans'])
        ?.find(p => p.id === newSubscription.planId);
      
      if (plan) {
        const optimisticData: UserSubscriptionType = {
          ...newSubscription,
          planName: plan.name,
          planPrice: plan.price,
          planFeatures: plan.features,
        };
        queryClient.setQueryData(['userSubscription'], optimisticData);
      } else {
        // If plan details aren't in cache, just invalidate to refetch
        queryClient.invalidateQueries({ queryKey: ['userSubscription'] });
      }
    },
    onError: (error) => {
      toast.error(`Subscription failed: ${error.message}`);
    },
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CancelInput) => postCancelSubscription(data),
    onSuccess: () => {
      toast.success('Your subscription has been canceled. You will retain access until the end of the current billing period.');
      // Set user subscription to null as it's no longer active
      queryClient.setQueryData(['userSubscription'], null);
    },
    onError: (error) => {
      toast.error(`Cancellation failed: ${error.message}`);
    },
  });
};