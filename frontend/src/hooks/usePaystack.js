import { useCallback } from "react";

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
const FASA_SUBACCOUNT = "ACCT_3sm6eu6rwonnumt";

export function usePaystack() {
  const initializePayment = useCallback(
    ({ email, amount, reference, metadata, onSuccess, onClose }) => {
      if (!window.PaystackPop) {
        console.error("Paystack script not loaded");
        return;
      }
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email,
        amount,
        ref: reference,
        currency: "NGN",
        metadata,
        subaccount: FASA_SUBACCOUNT,
        callback: (response) => onSuccess?.(response),
        onClose: () => onClose?.(),
      });
      handler.openIframe();
    },
    [],
  );
  return { initializePayment };
}
