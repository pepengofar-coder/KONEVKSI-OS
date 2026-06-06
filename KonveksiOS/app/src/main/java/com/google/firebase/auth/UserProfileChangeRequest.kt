package com.google.firebase.auth

class UserProfileChangeRequest(
    var displayName: String? = null
) {
    class Builder {
        var displayName: String? = null
            set(value) {
                field = value
            }

        fun build(): UserProfileChangeRequest {
            return UserProfileChangeRequest(displayName)
        }
    }
}

fun userProfileChangeRequest(block: UserProfileChangeRequest.Builder.() -> Unit): UserProfileChangeRequest {
    val builder = UserProfileChangeRequest.Builder()
    builder.block()
    return builder.build()
}
