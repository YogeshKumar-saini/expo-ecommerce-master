import React from 'react';

export const useStripe = () => {
  return {
    initPaymentSheet: async () => ({ error: null }),
    presentPaymentSheet: async () => ({ error: null }),
  };
};

export const StripeProvider = ({ children }) => {
  return <>{children}</>;
};

export default {
  useStripe,
  StripeProvider,
};
