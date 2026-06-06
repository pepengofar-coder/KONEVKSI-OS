package com.example.konveksios.payment

import android.content.Context
import android.util.Log
import com.stripe.android.PaymentConfiguration
import com.stripe.android.paymentsheet.PaymentSheet
import kotlinx.coroutines.delay

class PaymentGateway(private val context: Context) {

    private var isStripeInitialized = false

    init {
        try {
            // Safe initialize of Stripe SDK
            // We use a dummy key to prevent crash on startup if the user hasn't configured it
            val dummyPublishableKey = "pk_test_51MockKeyVal1234567890"
            PaymentConfiguration.init(context, dummyPublishableKey)
            isStripeInitialized = true
            Log.d("PaymentGateway", "Stripe SDK Initialized safely.")
        } catch (e: Exception) {
            Log.e("PaymentGateway", "Stripe SDK could not be initialized", e)
            isStripeInitialized = false
        }
    }

    /**
     * Simulate a Stripe checkout session flow in the app.
     * This makes it easy to test premium upgrades without hitting real credit cards or servers.
     */
    suspend fun processSimulatedPayment(amount: Double): Boolean {
        // Mocking network delay
        delay(1500)
        // Simulate a successful payment
        return true
    }

    /**
     * Real Stripe integration helper (guideline for live environment)
     */
    fun configureRealPaymentSheet(
        paymentSheet: PaymentSheet,
        customerId: String,
        customerEphemeralKeySecret: String,
        paymentIntentClientSecret: String
    ) {
        if (!isStripeInitialized) return
        
        val configuration = PaymentSheet.Configuration(
            merchantDisplayName = "Konveksi OS Inc.",
            customer = PaymentSheet.CustomerConfiguration(
                id = customerId,
                ephemeralKeySecret = customerEphemeralKeySecret
            ),
            // Set dark/light configuration
            allowsDelayedPaymentMethods = false
        )
        
        paymentSheet.presentWithPaymentIntent(
            paymentIntentClientSecret,
            configuration
        )
    }
}
