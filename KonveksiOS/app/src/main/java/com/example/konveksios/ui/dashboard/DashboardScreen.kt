package com.example.konveksios.ui.dashboard

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.TabRowDefaults
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
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
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.konveksios.auth.AuthRepository
import com.example.konveksios.data.AppDatabase
import com.example.konveksios.data.FinancialTransaction
import com.example.konveksios.data.ProductionOrder
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.NumberFormat
import java.util.Locale

@Composable
fun DashboardScreen(
    authRepository: AuthRepository,
    onNavigateToPremium: () -> Unit,
    onLogout: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = androidx.compose.ui.platform.LocalContext.current
    val db = remember { AppDatabase.getDatabase(context) }
    val orderDao = db.productionOrderDao()
    val txDao = db.financialTransactionDao()

    val currentUser by authRepository.currentUser.collectAsState()
    val orders by orderDao.getAllOrders().collectAsState(initial = emptyList())
    val transactions by txDao.getAllTransactions().collectAsState(initial = emptyList())

    val coroutineScope = rememberCoroutineScope()
    var selectedTab by remember { mutableStateOf(0) } // 0 = Produksi, 1 = Keuangan

    var showOrderDialog by remember { mutableStateOf(false) }
    var showTxDialog by remember { mutableStateOf(false) }

    // Dashboard calculations
    val totalOrders = orders.size
    val onProgressOrders = orders.count { it.status == "On Progress" }
    val pendingOrders = orders.count { it.status == "Pending" }
    val completedOrders = orders.count { it.status == "Completed" }

    val totalIncome = transactions.filter { it.type == "Income" }.sumOf { it.amount }
    val totalExpense = transactions.filter { it.type == "Expense" }.sumOf { it.amount }
    val netCash = totalIncome - totalExpense

    // Theme values
    val bgGradient = Brush.verticalGradient(
        colors = listOf(Color(0xFF0C0926), Color(0xFF191244))
    )
    val accentColor = Color(0xFF6366F1)
    val isPremium = currentUser?.isPremium == true

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(bgGradient)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
            // Header Row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = currentUser?.companyName ?: "Konveksi OS",
                        fontSize = 14.sp,
                        color = Color(0xFFA5B4FC),
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = "Halo, ${currentUser?.displayName ?: "User"}",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    // Premium badge
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(20.dp))
                            .background(
                                if (isPremium) Brush.horizontalGradient(
                                    listOf(Color(0xFFFBBF24), Color(0xFFF59E0B))
                                ) else Brush.horizontalGradient(
                                    listOf(Color(0xFF4B5563), Color(0xFF374151))
                                )
                            )
                            .clickable { if (!isPremium) onNavigateToPremium() }
                            .padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Star,
                                contentDescription = null,
                                tint = if (isPremium) Color(0xFF78350F) else Color.LightGray,
                                modifier = Modifier.size(14.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = if (isPremium) "PRO" else "FREE",
                                fontSize = 11.sp,
                                color = if (isPremium) Color(0xFF78350F) else Color.White,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    IconButton(
                        onClick = {
                            coroutineScope.launch {
                                authRepository.signOut()
                                onLogout()
                            }
                        }
                    ) {
                        Icon(
                            imageVector = Icons.Default.ExitToApp,
                            contentDescription = "Logout",
                            tint = Color(0xFFFCA5A5)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Metrics Grid Summary Card
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E1B4B).copy(alpha = 0.5f)),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, Color(0xFF312E81).copy(alpha = 0.4f), RoundedCornerShape(16.dp))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Ringkasan Finansial",
                        fontSize = 12.sp,
                        color = Color(0xFFA5B4FC),
                        fontWeight = FontWeight.SemiBold
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("Pemasukan", fontSize = 11.sp, color = Color(0xFFA5B4FC))
                            Text(formatRupiah(totalIncome), fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Color(0xFF10B981))
                        }
                        Column {
                            Text("Pengeluaran", fontSize = 11.sp, color = Color(0xFFA5B4FC))
                            Text(formatRupiah(totalExpense), fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Color(0xFFEF4444))
                        }
                        Column {
                            Text("Kas Bersih", fontSize = 11.sp, color = Color(0xFFA5B4FC))
                            Text(
                                text = formatRupiah(netCash),
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (netCash >= 0) Color(0xFF60A5FA) else Color(0xFFFCA5A5)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))
                    Box(modifier = Modifier.height(1.dp).fillMaxWidth().background(Color(0xFF312E81).copy(alpha = 0.5f)))
                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = "Status Produksi",
                        fontSize = 12.sp,
                        color = Color(0xFFA5B4FC),
                        fontWeight = FontWeight.SemiBold
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Total Order", fontSize = 11.sp, color = Color(0xFFA5B4FC))
                            Text("$totalOrders", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Antrean", fontSize = 11.sp, color = Color(0xFFA5B4FC))
                            Text("$pendingOrders", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color(0xFFF59E0B))
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Diproses", fontSize = 11.sp, color = Color(0xFFA5B4FC))
                            Text("$onProgressOrders", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color(0xFF6366F1))
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Selesai", fontSize = 11.sp, color = Color(0xFFA5B4FC))
                            Text("$completedOrders", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color(0xFF10B981))
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Navigation Tabs (Produksi / Keuangan)
            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = Color.Transparent,
                contentColor = Color.White,
                indicator = { tabPositions ->
                    TabRowDefaults.SecondaryIndicator(
                        Modifier.tabIndicatorOffset(tabPositions[selectedTab]),
                        color = accentColor
                    )
                },
                divider = {}
            ) {
                Tab(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    text = { Text("Antrean Produksi", fontSize = 14.sp, fontWeight = FontWeight.Bold) }
                )
                Tab(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    text = { Text("Laporan Keuangan", fontSize = 14.sp, fontWeight = FontWeight.Bold) }
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Tab contents
            Box(modifier = Modifier.weight(1f)) {
                if (selectedTab == 0) {
                    if (orders.isEmpty()) {
                        EmptyListScreen("Belum ada antrean produksi.", "Tekan tombol + di kanan bawah untuk menambahkan order baru.")
                    } else {
                        LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            items(orders, key = { it.id }) { order ->
                                OrderCardItem(
                                    order = order,
                                    isPremium = isPremium,
                                    onStatusCycle = {
                                        val nextStatus = when (order.status) {
                                            "Pending" -> "On Progress"
                                            "On Progress" -> "Completed"
                                            else -> "Pending"
                                        }
                                        coroutineScope.launch {
                                            withContext(Dispatchers.IO) {
                                                orderDao.updateOrder(order.copy(status = nextStatus))
                                            }
                                        }
                                    },
                                    onDelete = {
                                        coroutineScope.launch {
                                            withContext(Dispatchers.IO) {
                                                orderDao.deleteOrder(order)
                                            }
                                        }
                                    }
                                )
                            }
                        }
                    }
                } else {
                    if (transactions.isEmpty()) {
                        EmptyListScreen("Belum ada riwayat keuangan.", "Tekan tombol + di kanan bawah untuk mencatat kas/transaksi baru.")
                    } else {
                        LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            items(transactions, key = { it.id }) { tx ->
                                TransactionCardItem(
                                    transaction = tx,
                                    onDelete = {
                                        coroutineScope.launch {
                                            withContext(Dispatchers.IO) {
                                                txDao.deleteTransaction(tx)
                                            }
                                        }
                                    }
                                )
                            }
                        }
                    }
                }
            }
        }

        // Floating Action Button
        FloatingActionButton(
            onClick = {
                if (selectedTab == 0) showOrderDialog = true else showTxDialog = true
            },
            containerColor = accentColor,
            contentColor = Color.White,
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(24.dp)
        ) {
            Icon(Icons.Default.Add, contentDescription = "Add Item")
        }

        // Dialog views
        if (showOrderDialog) {
            OrderFormDialog(
                onDismiss = { showOrderDialog = false },
                onConfirm = { newOrder ->
                    coroutineScope.launch {
                        withContext(Dispatchers.IO) {
                            orderDao.insertOrder(newOrder)
                        }
                        showOrderDialog = false
                    }
                }
            )
        }

        if (showTxDialog) {
            TransactionFormDialog(
                onDismiss = { showTxDialog = false },
                onConfirm = { newTx ->
                    coroutineScope.launch {
                        withContext(Dispatchers.IO) {
                            txDao.insertTransaction(newTx)
                        }
                        showTxDialog = false
                    }
                }
            )
        }
    }
}

@Composable
fun OrderCardItem(
    order: ProductionOrder,
    isPremium: Boolean,
    onStatusCycle: () -> Unit,
    onDelete: () -> Unit
) {
    val statusColor = when (order.status) {
        "Pending" -> Color(0xFFF59E0B)
        "On Progress" -> Color(0xFF6366F1)
        else -> Color(0xFF10B981)
    }

    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E1B4B).copy(alpha = 0.4f)),
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, Color(0xFF312E81).copy(alpha = 0.3f), RoundedCornerShape(12.dp))
    ) {
        Row(
            modifier = Modifier
                .padding(14.dp)
                .fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = order.clientName,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    if (isPremium) {
                        Spacer(modifier = Modifier.width(6.dp))
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = "Verified Premium Order",
                            tint = Color(0xFF34D399),
                            modifier = Modifier.size(12.dp)
                        )
                    }
                }
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = "${order.orderType} • ${order.quantity} Pcs",
                    fontSize = 12.sp,
                    color = Color(0xFFA5B4FC)
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = formatRupiah(order.totalPrice),
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }

            Row(verticalAlignment = Alignment.CenterVertically) {
                // Status badge
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(statusColor.copy(alpha = 0.2f))
                        .border(1.dp, statusColor, RoundedCornerShape(8.dp))
                        .clickable { onStatusCycle() }
                        .padding(horizontal = 10.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = order.status,
                        color = statusColor,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                Spacer(modifier = Modifier.width(8.dp))

                IconButton(onClick = onDelete) {
                    Icon(
                        imageVector = Icons.Default.Delete,
                        contentDescription = "Delete",
                        tint = Color(0xFFEF4444).copy(alpha = 0.7f),
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun TransactionCardItem(
    transaction: FinancialTransaction,
    onDelete: () -> Unit
) {
    val isIncome = transaction.type == "Income"
    val color = if (isIncome) Color(0xFF10B981) else Color(0xFFEF4444)

    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E1B4B).copy(alpha = 0.4f)),
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, Color(0xFF312E81).copy(alpha = 0.3f), RoundedCornerShape(12.dp))
    ) {
        Row(
            modifier = Modifier
                .padding(14.dp)
                .fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = transaction.title,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = transaction.category,
                    fontSize = 11.sp,
                    color = Color(0xFFA5B4FC)
                )
            }

            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = (if (isIncome) "+" else "-") + formatRupiah(transaction.amount),
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = color
                )
                Spacer(modifier = Modifier.width(12.dp))
                IconButton(onClick = onDelete) {
                    Icon(
                        imageVector = Icons.Default.Delete,
                        contentDescription = "Delete",
                        tint = Color(0xFFEF4444).copy(alpha = 0.7f),
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun EmptyListScreen(
    title: String,
    subtitle: String
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            imageVector = Icons.Default.Info,
            contentDescription = null,
            tint = Color(0xFF4F46E5),
            modifier = Modifier.size(48.dp)
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = title,
            fontSize = 16.sp,
            color = Color.White,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = subtitle,
            fontSize = 12.sp,
            color = Color(0xFFA5B4FC),
            textAlign = TextAlign.Center
        )
    }
}

fun formatRupiah(number: Double): String {
    val format = NumberFormat.getCurrencyInstance(Locale("in", "ID"))
    return format.format(number).replace("Rp", "Rp ").replace(",00", "")
}
