package com.google.firebase.auth

class FirebaseUser(
    val uid: String,
    val email: String?,
    var displayName: String?
) {
    fun updateProfile(request: UserProfileChangeRequest): EmulatedVoidTask {
        return EmulatedVoidTask {
            request.displayName?.let { this.displayName = it }
            FirebaseAuth.getInstance().updateCurrentUserProfile(this)
        }
    }
}

class EmulatedVoidTask(private val action: () -> Unit) {
    suspend fun await() {
        action()
    }
}
