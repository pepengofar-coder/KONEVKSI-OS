package com.google.firebase.auth

import android.content.Context
import kotlinx.coroutines.tasks.await
import java.util.concurrent.CopyOnWriteArrayList

class FirebaseAuth private constructor() {

    interface AuthStateListener {
        fun onAuthStateChanged(auth: FirebaseAuth)
    }

    private val listeners = CopyOnWriteArrayList<AuthStateListener>()
    
    var currentUser: FirebaseUser? = null
        private set(value) {
            field = value
            notifyListeners()
        }

    fun addAuthStateListener(listener: AuthStateListener) {
        listeners.add(listener)
        listener.onAuthStateChanged(this)
    }

    fun removeAuthStateListener(listener: AuthStateListener) {
        listeners.remove(listener)
    }

    private fun notifyListeners() {
        for (listener in listeners) {
            listener.onAuthStateChanged(this)
        }
    }

    // Emulated Tasks for signIn
    fun signInWithEmailAndPassword(email: String, password: String): EmulatedAuthTask {
        val uid = "mock_uid_${email.hashCode()}"
        val user = FirebaseUser(uid, email, email.substringBefore("@"))
        return EmulatedAuthTask(user) {
            currentUser = user
        }
    }

    // Emulated Tasks for signUp
    fun createUserWithEmailAndPassword(email: String, password: String): EmulatedAuthTask {
        val uid = "mock_uid_${email.hashCode()}"
        val user = FirebaseUser(uid, email, email.substringBefore("@"))
        return EmulatedAuthTask(user) {
            currentUser = user
        }
    }

    fun signOut() {
        currentUser = null
    }

    // Helper for profile updates
    internal fun updateCurrentUserProfile(user: FirebaseUser) {
        if (currentUser?.uid == user.uid) {
            currentUser = user
        }
    }

    companion object {
        @Volatile
        private var INSTANCE: FirebaseAuth? = null

        @JvmStatic
        fun getInstance(): FirebaseAuth {
            return INSTANCE ?: synchronized(this) {
                val instance = FirebaseAuth()
                INSTANCE = instance
                instance
            }
        }
    }
}

class EmulatedAuthResult(val user: FirebaseUser?)

class EmulatedAuthTask(
    private val user: FirebaseUser,
    private val onSuccess: () -> Unit
) {
    suspend fun await(): EmulatedAuthResult {
        onSuccess()
        return EmulatedAuthResult(user)
    }
}
