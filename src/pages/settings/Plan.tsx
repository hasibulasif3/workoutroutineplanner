
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

interface UsageType {
  id: string;
  user_id: string;
  downloads_count: number;
  sync_count: number;
  email_count: number; 
  next_reset_date: string;
}

interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

interface PlanFeatures {
  download_limit: number;
  sync_limit: number;
  email_limit: number;
  priority_support?: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: PlanFeatures;
}

export default function PlanSettings() {
  const { user } = useAuth();
  const [usage, setUsage] = useState<UsageType | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      try {
        const { data: usageData, error: usageError } = await supabase
          .from('user_usage')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (usageData) {
          setUsage(usageData as UsageType);
        }

        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (subscriptionData) {
          setSubscription(subscriptionData as UserSubscription);
        }

        const { data: plansData } = await supabase
          .from('subscription_plans')
          .select('*');

        if (plansData) {
          // Parse the features from JSON to objects
          const parsedPlans = plansData.map(plan => ({
            ...plan,
            features: typeof plan.features === 'string' 
              ? JSON.parse(plan.features) 
              : plan.features
          })) as SubscriptionPlan[];
          
          setAvailablePlans(parsedPlans);
          
          if (subscriptionData && parsedPlans) {
            const plan = parsedPlans.find(p => p.id === subscriptionData.plan_id);
            if (plan) setCurrentPlan(plan);
          }
        }
      } catch (err) {
        console.error('Error fetching plan data:', err);
        setError('Failed to load subscription data.');
      }
    }

    fetchData();
  }, [user]);

  const handleUpgrade = async (planId: string) => {
    if (!user) return;
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          plan_id: planId,
          status: 'active',
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancel_at_period_end: false,
        })
        .eq('user_id', user.id);

      if (error) throw error;
      
      const { data: newSubscription, error: fetchError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (fetchError) throw fetchError;
      setSubscription(newSubscription as UserSubscription);
      
      const newPlan = availablePlans.find(p => p.id === planId);
      if (newPlan) setCurrentPlan(newPlan);
      
      toast({
        title: 'Subscription updated',
        description: `You are now subscribed to the ${newPlan?.name} plan.`,
      });
    } catch (err) {
      console.error('Error upgrading plan:', err);
      setError('Failed to upgrade plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user || !subscription) return;
    
    if (!window.confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          cancel_at_period_end: !subscription.cancel_at_period_end,
        })
        .eq('id', subscription.id);

      if (error) throw error;
      
      const { data: updatedSubscription, error: fetchError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (fetchError) throw fetchError;
      setSubscription(updatedSubscription as UserSubscription);
      
      toast({
        title: 'Subscription cancelled',
        description: 'Your subscription will end at the end of your current billing period.',
      });
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      setError('Failed to cancel subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit < 0) return 0; // Unlimited plan
    return Math.min(Math.round((used / limit) * 100), 100);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            Manage your subscription and usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">{currentPlan?.name || 'Free Plan'}</h3>
              <p className="text-sm text-muted-foreground">
                {currentPlan?.description || 'Basic features with limited usage'}
              </p>
            </div>
            {currentPlan?.name === 'Free' ? (
              <Button variant="default">Upgrade</Button>
            ) : (
              <div className="text-sm text-muted-foreground">
                {subscription?.cancel_at_period_end ? (
                  <span className="text-yellow-500 font-medium">Cancels on {formatDate(subscription.current_period_end)}</span>
                ) : (
                  <span className="text-green-500 font-medium">Active</span>
                )}
              </div>
            )}
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h4 className="font-medium">Usage this month</h4>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Downloads</span>
                  <span className="text-sm text-muted-foreground">
                    {usage?.downloads_count || 0} / 
                    {currentPlan?.features.download_limit === -1 ? 'Unlimited' : currentPlan?.features.download_limit || 5}
                  </span>
                </div>
                <Progress value={getUsagePercentage(usage?.downloads_count || 0, currentPlan?.features.download_limit || 5)} />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Syncs</span>
                  <span className="text-sm text-muted-foreground">
                    {usage?.sync_count || 0} / 
                    {currentPlan?.features.sync_limit === -1 ? 'Unlimited' : currentPlan?.features.sync_limit || 5}
                  </span>
                </div>
                <Progress value={getUsagePercentage(usage?.sync_count || 0, currentPlan?.features.sync_limit || 5)} />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Emails</span>
                  <span className="text-sm text-muted-foreground">
                    {usage?.email_count || 0} / 
                    {currentPlan?.features.email_limit === -1 ? 'Unlimited' : currentPlan?.features.email_limit || 5}
                  </span>
                </div>
                <Progress value={getUsagePercentage(usage?.email_count || 0, currentPlan?.features.email_limit || 5)} />
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Your usage will reset on {usage?.next_reset_date ? formatDate(usage.next_reset_date) : 'the first of next month'}.
            </p>
          </div>
        </CardContent>
        {currentPlan?.name !== 'Free' && (
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={handleCancelSubscription}
              disabled={loading || subscription?.cancel_at_period_end}
            >
              {subscription?.cancel_at_period_end ? 'Subscription will end soon' : 'Cancel Subscription'}
            </Button>
          </CardFooter>
        )}
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>
            Choose the best plan for your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="monthly" onValueChange={(v) => setBillingCycle(v as 'monthly' | 'yearly')}>
            <div className="flex justify-end mb-4">
              <TabsList>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly (Save 16%)</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="monthly" className="space-y-4">
              {availablePlans.map((plan) => (
                <Card key={plan.id} className={currentPlan?.id === plan.id ? "border-primary" : ""}>
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span className="text-3xl font-bold">
                        ${plan.price_monthly}
                      </span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <Check className="mr-2 h-4 w-4 text-green-500 mt-1" />
                        <span>
                          {plan.features.download_limit < 0 ? "Unlimited" : plan.features.download_limit} downloads per month
                        </span>
                      </div>
                      <div className="flex items-start">
                        <Check className="mr-2 h-4 w-4 text-green-500 mt-1" />
                        <span>
                          {plan.features.sync_limit < 0 ? "Unlimited" : plan.features.sync_limit} syncs per month
                        </span>
                      </div>
                      <div className="flex items-start">
                        <Check className="mr-2 h-4 w-4 text-green-500 mt-1" />
                        <span>
                          {plan.features.email_limit < 0 ? "Unlimited" : plan.features.email_limit} emails per month
                        </span>
                      </div>
                      {plan.features.priority_support && (
                        <div className="flex items-start">
                          <Check className="mr-2 h-4 w-4 text-green-500 mt-1" />
                          <span>Priority support</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    {currentPlan?.id === plan.id ? (
                      <Button className="w-full" disabled>Current Plan</Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={loading}
                      >
                        {plan.name === 'Free' ? 'Downgrade' : 'Upgrade'}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="yearly" className="space-y-4">
              {availablePlans.map((plan) => (
                <Card key={plan.id} className={currentPlan?.id === plan.id ? "border-primary" : ""}>
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span className="text-3xl font-bold">
                        ${plan.price_yearly}
                      </span>
                      <span className="text-muted-foreground">/year</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <Check className="mr-2 h-4 w-4 text-green-500 mt-1" />
                        <span>
                          {plan.features.download_limit < 0 ? "Unlimited" : plan.features.download_limit} downloads per month
                        </span>
                      </div>
                      <div className="flex items-start">
                        <Check className="mr-2 h-4 w-4 text-green-500 mt-1" />
                        <span>
                          {plan.features.sync_limit < 0 ? "Unlimited" : plan.features.sync_limit} syncs per month
                        </span>
                      </div>
                      <div className="flex items-start">
                        <Check className="mr-2 h-4 w-4 text-green-500 mt-1" />
                        <span>
                          {plan.features.email_limit < 0 ? "Unlimited" : plan.features.email_limit} emails per month
                        </span>
                      </div>
                      {plan.features.priority_support && (
                        <div className="flex items-start">
                          <Check className="mr-2 h-4 w-4 text-green-500 mt-1" />
                          <span>Priority support</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    {currentPlan?.id === plan.id ? (
                      <Button className="w-full" disabled>Current Plan</Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={loading}
                      >
                        {plan.name === 'Free' ? 'Downgrade' : 'Upgrade'}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
