package com.example.konveksios.ui.premium

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.konveksios.auth.AuthRepository
import com.example.konveksios.payment.PaymentGateway
import kotlinx.coroutines.launch

@Composable
fun PremiumScreen(
    authRepository: AuthRepository,
    paymentGateway: PaymentGateway,
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val currentUser by authRepository.currentUser.collectAsState()
    val isPremium = currentUser?.isPremium == true
    val coroutineScope = rememberCoroutineScope()

    var isProcessing by remember { mutableStateOf(false) }
    var upgradeSuccess by remember { mutableStateOf(false) }
    var selectedPlan by remember { mutableStateOf("annual") } // monthly, annual

    val bgGradient = Brush.verticalGradient(
        colors = listOf(Color(0xFF0C0926), Color(0xFF191244))
    )
    val goldBrush = Brush.horizontalGradient(
        colors = listOf(Color(0xFFFBBF24), Color(0xFFF59E0B))
    )
    
    val premiumBenefits = listOf(
        "Akses Multi-User (Tim & Karyawan)",
        "Laporan & Grafik Keuangan Detail",
        "Kirim Invoice Otomatis via WhatsApp/Email",
        "Pencatatan Kasbon Taylor Tanpa Batas",
        "Backup Database Cloud Aman",
        "Fitur Barcode Scanner & Tracking Produksi"
    )

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(bgGradient)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
                .verticalScroll(rememberScrollState())
        ) {
            // Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onNavigateBack) {
                    Icon(
                        imageVector = Icons.Default.ArrowBack,
                        contentDescription = "Back",
                        tint = Color.White
                    )
                }
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Konveksi OS Premium",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Premium Header Section
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))
                    .background(Color(0xFF1E1B4B).copy(alpha = 0.5f))
                    .border(1.dp, Color(0xFF312E81).copy(alpha = 0.4f), RoundedCornerShape(20.dp))
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box(
                    modifier = Modifier
                        .size(56.dp)
                        .clip(RoundedCornerShape(50))
                        .background(goldBrush),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Star,
                        contentDescription = null,
                        tint = Color(0xFF78350F),
                        modifier = Modifier.size(32.dp)
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = "Buka Potensi Penuh Konveksi Anda",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Kelola produksi, kasbon, dan invoice secara profesional dan efisien.",
                    fontSize = 13.sp,
                    color = Color(0xFFA5B4FC),
                    textAlign = TextAlign.Center
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Benefits List
            Text(
                text = "Keunggulan Fitur Premium:",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            Spacer(modifier = Modifier.height(12.dp))

            premiumBenefits.forEach { benefit ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Check,
                        contentDescription = null,
                        tint = Color(0xFF10B981),
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = benefit,
                        fontSize = 13.sp,
                        color = Color(0xFFC7D2FE)
                    )
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            if (isPremium) {
                // Already Premium State
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color(0xFF065F46).copy(alpha = 0.4f))
                        .border(1.dp, Color(0xFF059669), RoundedCornerShape(12.dp))
                        .padding(16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Selamat! Akun Anda Telah Aktif sebagai Premium PRO",
                        color = Color(0xFFA7F3D0),
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        textAlign = TextAlign.Center
                    )
                }
            } else {
                // Pricing Selector
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color(0xFF1E1B4B))
                        .padding(4.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (selectedPlan == "monthly") Color(0xFF312E81) else Color.Transparent)
                            .clickable { selectedPlan = "monthly" }
                            .padding(vertical = 12.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Bulanan", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            Text("Rp 49.000 / bln", color = Color(0xFFA5B4FC), fontSize = 11.sp)
                        }
                    }
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (selectedPlan == "annual") Color(0xFF312E81) else Color.Transparent)
                            .clickable { selectedPlan = "annual" }
                            .padding(vertical = 12.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Tahunan", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            Text("Rp 399.000 / thn", color = Color(0xFFA5B4FC), fontSize = 11.sp)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Action Buttons
                Button(
                    onClick = {
                        isProcessing = true
                        coroutineScope.launch {
                            val price = if (selectedPlan == "annual") 399000.0 else 49000.0
                            val success = paymentGateway.processSimulatedPayment(price)
                            isProcessing = false
                            if (success) {
                                authRepository.upgradeUserToPremium()
                                upgradeSuccess = true
                            }
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(54.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF6366F1)),
                    enabled = !isProcessing && !upgradeSuccess
                ) {
                    if (isProcessing) {
                        CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                    } else if (upgradeSuccess) {
                        Text("Upgrade Berhasil!", color = Color.White, fontWeight = FontWeight.Bold)
                    } else {
                        Text(
                            text = "Upgrade Sekarang (" + (if (selectedPlan == "annual") "Rp 399rb/thn" else "Rp 49rb/bln") + ")",
                            color = Color.White,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
                
                Spacer(modifier = Modifier.height(12.dp))
                
                Text(
                    text = "Didukung oleh integrasi Stripe yang aman.",
                    fontSize = 11.sp,
                    color = Color(0xFFA5B4FC).copy(alpha = 0.7f),
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth()
                )
            }

            AnimatedVisibility(visible = upgradeSuccess) {
                Spacer(modifier = Modifier.height(16.dp))
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color(0xFF065F46).copy(alpha = 0.2f))
                        .border(1.dp, Color(0xFF10B981), RoundedCornerShape(12.dp))
                        .padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Pembayaran Berhasil! Fitur premium Anda kini telah aktif. Silakan kembali ke Dashboard.",
                        color = Color(0xFFA7F3D0),
                        fontSize = 13.sp,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Button(
                        onClick = onNavigateBack,
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981))
                    ) {
                        Text("Kembali ke Dashboard", color = Color.White)
                    }
                }
            }
        }
    }
}
