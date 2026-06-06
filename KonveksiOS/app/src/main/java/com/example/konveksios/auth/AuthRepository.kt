package com.example.konveksios.auth

import android.content.Context
import android.util.Log
import com.example.konveksios.data.AppDatabase
import com.example.konveksios.data.UserProfile
import com.google.firebase.FirebaseApp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.tasks.await

class AuthRepository(private val context: Context) {

    private val db = AppDatabase.getDatabase(context)
    private val profileDao = db.userProfileDao()

    private val _currentUser = MutableStateFlow<UserProfile?>(null)
    val currentUser: StateFlow<UserProfile?> = _currentUser.asStateFlow()

    private val _isFirebaseMode = MutableStateFlow(false)
    val isFirebaseMode: StateFlow<Boolean> = _isFirebaseMode.asStateFlow()

    private var firebaseAuth: FirebaseAuth? = null
    private var firestore: FirebaseFirestore? = null

    init {
        // Safe check for Firebase initialization
        try {
            // Check if Firebase was initialized (either automatically via google-services plugin or manually)
            val app = if (FirebaseApp.getApps(context).isEmpty()) {
                // If it is empty, check if we can initialize it (normally needs google-services resources)
                FirebaseApp.initializeApp(context)
            } else {
                FirebaseApp.getInstance()
            }

            if (app != null) {
                firebaseAuth = FirebaseAuth.getInstance()
                firestore = FirebaseFirestore.getInstance()
                _isFirebaseMode.value = true
                Log.d("AuthRepository", "Firebase Initialized Successfully!")
            }
        } catch (e: Exception) {
            Log.e("AuthRepository", "Firebase could not be initialized, falling back to Local Mock Mode", e)
            _isFirebaseMode.value = false
        }

        // Listen for user state changes
        if (_isFirebaseMode.value && firebaseAuth != null) {
            firebaseAuth?.addAuthStateListener { auth ->
                val firebaseUser = auth.currentUser
                if (firebaseUser != null) {
                    // Fetch profile from Firestore or local cache
                    fetchUserProfile(firebaseUser.uid, firebaseUser.email ?: "", firebaseUser.displayName ?: "User")
                } else {
                    _currentUser.value = null
                }
            }
        } else {
            // Local Mock Session Restore
            restoreLocalSession()
        }
    }

    private fun restoreLocalSession() {
        // In local mode, look up if any profile exists in local Room DB
        kotlinx.coroutines.GlobalScope.launch(kotlinx.coroutines.Dispatchers.IO) {
            val localProfile = profileDao.getUserProfile("local_user").firstOrNull()
            if (localProfile != null) {
                _currentUser.value = localProfile
            }
        }
    }

    private fun fetchUserProfile(uid: String, email: String, defaultName: String) {
        kotlinx.coroutines.GlobalScope.launch(kotlinx.coroutines.Dispatchers.IO) {
            // Try fetching from local Room cache first
            val localProfile = profileDao.getUserProfile(uid).firstOrNull()
            if (localProfile != null) {
                _currentUser.value = localProfile
            }

            // Sync with Firestore in background
            if (_isFirebaseMode.value && firestore != null) {
                try {
                    val docRef = firestore!!.collection("users").document(uid)
                    val document = docRef.get().await()
                    if (document.exists()) {
                        val profile = UserProfile(
                            uid = uid,
                            email = document.getString("email") ?: email,
                            displayName = document.getString("displayName") ?: defaultName,
                            isPremium = document.getBoolean("isPremium") ?: false,
                            premiumExpiry = document.getLong("premiumExpiry") ?: 0L,
                            companyName = document.getString("companyName") ?: "Konveksi Saya"
                        )
                        profileDao.insertUserProfile(profile)
                        _currentUser.value = profile
                    } else {
                        // Create profile on Firestore if it doesn't exist
                        val newProfile = UserProfile(uid, email, defaultName)
                        docRef.set(mapOf(
                            "email" to email,
                            "displayName" to defaultName,
                            "isPremium" to false,
                            "premiumExpiry" to 0L,
                            "companyName" to "Konveksi Saya"
                        )).await()
                        profileDao.insertUserProfile(newProfile)
                        _currentUser.value = newProfile
                    }
                } catch (e: Exception) {
                    Log.e("AuthRepository", "Error syncing with Firestore", e)
                }
            }
        }
    }

    suspend fun signIn(email: String, password: String): Result<UserProfile> {
        return if (_isFirebaseMode.value && firebaseAuth != null) {
            try {
                val authResult = firebaseAuth!!.signInWithEmailAndPassword(email, password).await()
                val firebaseUser = authResult.user ?: throw Exception("User is null")
                val uid = firebaseUser.uid
                val displayName = firebaseUser.displayName ?: email.substringBefore("@")
                
                // Fetch and save user profile
                fetchUserProfile(uid, email, displayName)
                // Wait briefly for local cache sync
                val localProfile = profileDao.getUserProfile(uid).firstOrNull() ?: UserProfile(uid, email, displayName)
                Result.success(localProfile)
            } catch (e: Exception) {
                Result.failure(e)
            }
        } else {
            // Mock Login
            if (email.contains("@") && password.length >= 6) {
                val mockProfile = UserProfile(
                    uid = "local_user",
                    email = email,
                    displayName = email.substringBefore("@").replaceFirstChar { it.uppercase() },
                    isPremium = false,
                    companyName = "Konveksi Local"
                )
                profileDao.insertUserProfile(mockProfile)
                _currentUser.value = mockProfile
                Result.success(mockProfile)
            } else {
                Result.failure(Exception("Email tidak valid atau password kurang dari 6 karakter."))
            }
        }
    }

    suspend fun signUp(email: String, password: String, displayName: String): Result<UserProfile> {
        return if (_isFirebaseMode.value && firebaseAuth != null) {
            try {
                val authResult = firebaseAuth!!.createUserWithEmailAndPassword(email, password).await()
                val firebaseUser = authResult.user ?: throw Exception("User is null")
                
                // Update Firebase display name
                val profileUpdates = com.google.firebase.auth.userProfileChangeRequest {
                    this.displayName = displayName
                }
                firebaseUser.updateProfile(profileUpdates).await()
                
                val uid = firebaseUser.uid
                val newProfile = UserProfile(
                    uid = uid,
                    email = email,
                    displayName = displayName
                )
                
                // Save to Firestore
                firestore?.collection("users")?.document(uid)?.set(mapOf(
                    "email" to email,
                    "displayName" to displayName,
                    "isPremium" to false,
                    "premiumExpiry" to 0L,
                    "companyName" to "Konveksi Saya"
                ))?.await()

                profileDao.insertUserProfile(newProfile)
                _currentUser.value = newProfile
                Result.success(newProfile)
            } catch (e: Exception) {
                Result.failure(e)
            }
        } else {
            // Mock Signup
            if (email.contains("@") && password.length >= 6 && displayName.isNotBlank()) {
                val mockProfile = UserProfile(
                    uid = "local_user",
                    email = email,
                    displayName = displayName,
                    isPremium = false,
                    companyName = "Konveksi Local"
                )
                profileDao.insertUserProfile(mockProfile)
                _currentUser.value = mockProfile
                Result.success(mockProfile)
            } else {
                Result.failure(Exception("Input tidak valid. Pastikan email benar, password >= 6 karakter."))
            }
        }
    }

    suspend fun signOut() {
        if (_isFirebaseMode.value && firebaseAuth != null) {
            firebaseAuth!!.signOut()
        }
        profileDao.clearAll()
        _currentUser.value = null
    }

    suspend fun upgradeUserToPremium() {
        val user = _currentUser.value ?: return
        val updatedUser = user.copy(isPremium = true, premiumExpiry = System.currentTimeMillis() + (365L * 24 * 60 * 60 * 1000))
        profileDao.insertUserProfile(updatedUser)
        _currentUser.value = updatedUser

        if (_isFirebaseMode.value && firestore != null) {
            try {
                firestore!!.collection("users").document(user.uid).update(
                    "isPremium", true,
                    "premiumExpiry", updatedUser.premiumExpiry
                ).await()
            } catch (e: Exception) {
                Log.e("AuthRepository", "Failed to update premium on Firestore", e)
            }
        }
    }
}
