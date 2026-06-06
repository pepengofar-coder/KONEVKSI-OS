package com.example.konveksios.data

import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.serialization.Serializable

@Serializable
@Entity(tableName = "user_profiles")
data class UserProfile(
    @PrimaryKey val uid: String,
    val email: String,
    val displayName: String,
    val isPremium: Boolean = false,
    val premiumExpiry: Long = 0L,
    val companyName: String = "Konveksi Saya"
)

@Serializable
@Entity(tableName = "production_orders")
data class ProductionOrder(
    @PrimaryKey val id: String,
    val clientName: String,
    val orderType: String, // e.g. "Kaos", "Kemeja", "Jaket"
    val quantity: Int,
    val pricePerUnit: Double,
    val totalPrice: Double,
    val status: String, // "Pending", "On Progress", "Completed"
    val notes: String = "",
    val createdAt: Long = System.currentTimeMillis(),
    val dueDate: Long = System.currentTimeMillis() + (7 * 24 * 60 * 60 * 1000) // 1 week default
)

@Serializable
@Entity(tableName = "financial_transactions")
data class FinancialTransaction(
    @PrimaryKey val id: String,
    val title: String,
    val amount: Double,
    val type: String, // "Income", "Expense"
    val category: String, // "Kasbon Taylor", "Bahan Baku", "Invoice", "Lainnya"
    val createdAt: Long = System.currentTimeMillis()
)
