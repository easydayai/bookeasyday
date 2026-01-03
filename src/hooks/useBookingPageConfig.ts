import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BookingPageConfig, defaultBookingPageConfig } from '@/types/bookingPageConfig';
import { useAuth } from '@/contexts/AuthContext';
import type { Json } from '@/integrations/supabase/types';

export function useBookingPageConfig() {
  const { user } = useAuth();
  const [config, setConfig] = useState<BookingPageConfig>(defaultBookingPageConfig);
  const [publishedConfig, setPublishedConfig] = useState<BookingPageConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const fetchConfig = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('booking_page_config')
        .select('config, published_config')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const loadedConfig = data.config as unknown as BookingPageConfig;
        setConfig({ ...defaultBookingPageConfig, ...loadedConfig });
        if (data.published_config) {
          setPublishedConfig(data.published_config as unknown as BookingPageConfig);
        }
      } else {
        // Create default config for new user
        const { error: insertError } = await supabase
          .from('booking_page_config')
          .insert({
            user_id: user.id,
            config: defaultBookingPageConfig as unknown as Json,
          });

        if (insertError) throw insertError;
        setConfig(defaultBookingPageConfig);
      }
    } catch (error) {
      console.error('Error fetching booking page config:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const updateConfig = useCallback((path: string, value: unknown) => {
    setConfig((prev) => {
      const keys = path.split('.');
      const newConfig = JSON.parse(JSON.stringify(prev)) as BookingPageConfig;
      let current: Record<string, unknown> = newConfig as unknown as Record<string, unknown>;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] as Record<string, unknown>;
      }
      current[keys[keys.length - 1]] = value;
      
      return newConfig;
    });
    setHasUnsavedChanges(true);
  }, []);

  const saveConfig = useCallback(async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('booking_page_config')
        .update({ config: config as unknown as Json })
        .eq('user_id', user.id);

      if (error) throw error;
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving config:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [user, config]);

  const publishConfig = useCallback(async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('booking_page_config')
        .update({
          config: config as unknown as Json,
          published_config: config as unknown as Json,
        })
        .eq('user_id', user.id);

      if (error) throw error;
      setPublishedConfig(config);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error publishing config:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [user, config]);

  const discardChanges = useCallback(() => {
    if (publishedConfig) {
      setConfig(publishedConfig);
    } else {
      setConfig(defaultBookingPageConfig);
    }
    setHasUnsavedChanges(false);
  }, [publishedConfig]);

  const resetToDefaults = useCallback(() => {
    setConfig(defaultBookingPageConfig);
    setHasUnsavedChanges(true);
  }, []);

  return {
    config,
    publishedConfig,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    updateConfig,
    saveConfig,
    publishConfig,
    discardChanges,
    resetToDefaults,
  };
}
