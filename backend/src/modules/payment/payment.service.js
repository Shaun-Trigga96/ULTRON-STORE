// payment.service.js
// Simulating an external payment gateway integration (e.g. Stripe, Paystack)

exports.processPayment = async ({ amountCents, currency, source }) => {
  return new Promise((resolve) => {
    // Simulate network delay to payment gateway
    setTimeout(() => {
      // 95% success rate for simulation
      const isSuccess = Math.random() < 0.95;
      if (isSuccess) {
        resolve({
          success: true,
          transactionId: 'txn_' + Math.random().toString(36).substr(2, 9),
          status: 'CAPTURED'
        });
      } else {
        resolve({
          success: false,
          error: 'Card declined by issuing bank'
        });
      }
    }, 1500);
  });
};
