import { SubscriptionStatus } from "@/enums/subscription.enum";
import { useCacheManager } from "@/hooks/useCacheManager";
import { SubscriptionModel } from "@/model/subscription.model";
import { SubscriptionService } from "@/services/subscription.service";
import { message } from "antd";
import { useCallback, useRef, useState } from "react";

const subscriptionService = new SubscriptionService();
const POLLING_INTERVAL = 5_000;
const POLLING_TIMEOUT = 5 * 60_000;

export function usePaymentModalController(subscription: SubscriptionModel, onClose: VoidFunction) {
  const [isPolling, setIsPolling] = useState(false);
  const isPollingRef = useRef(false);
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const { invalidateQuery } = useCacheManager();

  const stopPolling = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    isPollingRef.current = false;
    setIsPolling(false);
  }, []);

  const checkPaymentStatus = useCallback(async () => {
    try {
      const updatedSubscription = await subscriptionService.getById<SubscriptionModel>(
        subscription.id,
      );
      if (!isPollingRef.current) return;
      if (updatedSubscription.status === SubscriptionStatus.PAID) {
        stopPolling();
        invalidateQuery(subscriptionService);
        message.success("Pagamento confirmado!");
        onClose();
      }
    } catch {
      // Keep polling when a status check fails temporarily.
    }
  }, [invalidateQuery, onClose, stopPolling, subscription.id]);

  const startPolling = useCallback(() => {
    if (isPollingRef.current) return;

    isPollingRef.current = true;
    setIsPolling(true);

    // Verifica imediatamente para dar feedback mais rápido
    void checkPaymentStatus();

    intervalRef.current = window.setInterval(() => {
      void checkPaymentStatus();
    }, POLLING_INTERVAL);
    timeoutRef.current = window.setTimeout(() => {
      stopPolling();
      message.info("Pagamento ainda não confirmado. Você pode tentar novamente.");
    }, POLLING_TIMEOUT);
  }, [checkPaymentStatus, stopPolling]);

  const handleClose = useCallback(() => {
    stopPolling();
    onClose();
  }, [onClose, stopPolling]);

  const handleOpenPayment = useCallback(() => {
    if (subscription.externalLink) {
      window.open(subscription.externalLink, "_blank", "noopener,noreferrer");
      // Inicia o polling imediatamente ao abrir o link
      startPolling();
    }
  }, [subscription.externalLink, startPolling]);

  return { isPolling, startPolling, handleClose, handleOpenPayment };
}
