package com.example.konveksios.data

import android.content.Context
import androidx.room.Dao
import androidx.room.Database
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface UserProfileDao {
    @Query("SELECT * FROM user_profiles WHERE uid = :uid LIMIT 1")
    fun getUserProfile(uid: String): Flow<UserProfile?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUserProfile(userProfile: UserProfile)

    @Update
    suspend fun updateUserProfile(userProfile: UserProfile)

    @Query("DELETE FROM user_profiles")
    suspend fun clearAll()
}

@Dao
interface ProductionOrderDao {
    @Query("SELECT * FROM production_orders ORDER BY createdAt DESC")
    fun getAllOrders(): Flow<List<ProductionOrder>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrder(order: ProductionOrder)

    @Update
    suspend fun updateOrder(order: ProductionOrder)

    @Delete
    suspend fun deleteOrder(order: ProductionOrder)

    @Query("DELETE FROM production_orders")
    suspend fun clearAll()
}

@Dao
interface FinancialTransactionDao {
    @Query("SELECT * FROM financial_transactions ORDER BY createdAt DESC")
    fun getAllTransactions(): Flow<List<FinancialTransaction>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTransaction(transaction: FinancialTransaction)

    @Delete
    suspend fun deleteTransaction(transaction: FinancialTransaction)

    @Query("DELETE FROM financial_transactions")
    suspend fun clearAll()
}

@Database(
    entities = [UserProfile::class, ProductionOrder::class, FinancialTransaction::class],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userProfileDao(): UserProfileDao
    abstract fun productionOrderDao(): ProductionOrderDao
    abstract fun financialTransactionDao(): FinancialTransactionDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "konveksi_os_database"
                )
                .fallbackToDestructiveMigration()
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
