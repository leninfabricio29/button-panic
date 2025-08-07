package com.leninyanangomez.buttonpanic

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.os.Build
import android.util.Log


 fun createNotificationChannel(context: Context): String {
    val channelId = "panic_channel_v4"
    
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        val channelName = "Emergencias"
        val importance = NotificationManager.IMPORTANCE_HIGH
        val channel = NotificationChannel(channelId, channelName, importance).apply {
            description = "Canal para alertas de emergencia"
            enableVibration(true)
            vibrationPattern = longArrayOf(0, 1000, 500, 1000, 500, 1000)
            
            setBypassDnd(true)
            setShowBadge(true)
            lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            
            
            setSound(null, null)
            
            enableLights(true)
            lightColor = android.graphics.Color.RED
        }

        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.createNotificationChannel(channel)
        Log.d("Notification", "Canal de notificación creado/actualizado: $channelId")
    }
    
    return channelId
}
