package com.example.konveksios

import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation3.runtime.entryProvider
import androidx.navigation3.runtime.rememberNavBackStack
import androidx.navigation3.ui.NavDisplay
import com.example.konveksios.auth.AuthRepository
import com.example.konveksios.payment.PaymentGateway
import com.example.konveksios.ui.auth.AuthScreen
import com.example.konveksios.ui.dashboard.DashboardScreen
import com.example.konveksios.ui.premium.PremiumScreen

@Composable
fun MainNavigation() {
  val context = androidx.compose.ui.platform.LocalContext.current
  val authRepository = remember { AuthRepository(context) }
  val paymentGateway = remember { PaymentGateway(context) }
  val currentUser by authRepository.currentUser.collectAsState()

  // Use the authenticated state to decide the starting screen.
  // We wrap it in remember with a key so it updates if auth state changes at startup.
  val startKey = remember(currentUser) {
    if (currentUser == null) AuthKey else DashboardKey
  }

  val backStack = rememberNavBackStack(startKey)

  NavDisplay(
    backStack = backStack,
    onBack = { backStack.removeLastOrNull() },
    entryProvider =
      entryProvider {
        entry<AuthKey> {
          AuthScreen(
            authRepository = authRepository,
            onAuthSuccess = {
              backStack.add(DashboardKey)
            }
          )
        }
        entry<DashboardKey> {
          DashboardScreen(
            authRepository = authRepository,
            onNavigateToPremium = {
              backStack.add(PremiumKey)
            },
            onLogout = {
              backStack.add(AuthKey)
            }
          )
        }
        entry<PremiumKey> {
          PremiumScreen(
            authRepository = authRepository,
            paymentGateway = paymentGateway,
            onNavigateBack = {
              backStack.removeLastOrNull()
            }
          )
        }
      },
  )
}
