package com.leninyanangomez.buttonpanic

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.os.Build
import android.os.PowerManager
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class MyFirebaseMessagingService : FirebaseMessagingService() {
    
    private val TAG = "PanicFCMService"
    
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
    Log.d(TAG, "FCM Message Received: ${remoteMessage.data}")
    
    // Extraer coordenadas de emergencia (igual que antes)
    val lat = remoteMessage.data["latitude"] 
            ?: remoteMessage.data["lat"]
            ?: remoteMessage.data["Latitude"]
            ?: remoteMessage.data["LAT"]
    
    val lon = remoteMessage.data["longitude"]
            ?: remoteMessage.data["lon"] 
            ?: remoteMessage.data["Longitude"]
            ?: remoteMessage.data["LON"]

    val senderName = remoteMessage.data["sender_name"]
            ?: remoteMessage.data["senderName"]
            ?: remoteMessage.data["sender"]
            ?: remoteMessage.data["Sender"]
    
    // Detectar mensaje de emergencia
    val isEmergency = remoteMessage.data["type"]?.equals("emergencia", ignoreCase = true) ?: false
            || remoteMessage.data["custom_notification"]?.equals("true") ?: false
            || remoteMessage.data.any { (key, value) -> 
                key.contains("emergencia", ignoreCase = true) || 
                value.contains("emergencia", ignoreCase = true) ||
                key.contains("panic", ignoreCase = true) ||
                value.contains("panic", ignoreCase = true)
            }
    
    // Procesar si es emergencia y tenemos coordenadas
    if (isEmergency && !lat.isNullOrEmpty() && !lon.isNullOrEmpty() && senderName != null) {
        Log.d(TAG, "Procesando notificación de emergencia")
        
        // Siempre crear y mostrar nuestra propia notificación personalizada
        // Incluso si hay una notificación del sistema, mostraremos la nuestra
        showCustomEmergencyNotification(lat, lon,  senderName, remoteMessage)
    } else {
        // Si no es emergencia o no podemos procesarla, dejamos que el sistema la maneje
        Log.d(TAG, "Mensaje FCM recibido pero no es una emergencia o faltan coordenadas")
    }
}

private fun showCustomEmergencyNotification(lat: String, lon: String ,senderName: String, remoteMessage: RemoteMessage) {
    // Despertar pantalla
    wakeLockScreen()
    
    // Crear intent para la actividad
    val intent = Intent(this, FullScreenAlertActivity::class.java).apply {
        putExtra("lat", lat)
        putExtra("lon", lon)
        putExtra("senderName", senderName)
        flags = Intent.FLAG_ACTIVITY_NEW_TASK or 
                Intent.FLAG_ACTIVITY_CLEAR_TOP or
                Intent.FLAG_ACTIVITY_CLEAR_TASK
    }
    
    // Intentar iniciar actividad directamente
    try {
        startActivity(intent)
        Log.d(TAG, "Actividad iniciada directamente")
    } catch (e: Exception) {
        Log.e(TAG, "Error al iniciar actividad: ${e.message}")
    }
    
    // Crear PendingIntent como respaldo
    val pendingIntent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        PendingIntent.getActivity(
            this,
            System.currentTimeMillis().toInt(),
            intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
    } else {
        PendingIntent.getActivity(
            this,
            System.currentTimeMillis().toInt(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT
        )
    }
    
    val channelId = createOrUpdateNotificationChannel(this)
    
    // Crear notificación de emergencia
    val alarmSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
    
    val title = remoteMessage.notification?.title ?: "🚨 ¡ALERTA DE EMERGENCIA!"
    val body = remoteMessage.notification?.body ?: 
        remoteMessage.data["message"] ?: 
        remoteMessage.data["body"] ?: 
        "Se ha activado el botón de pánico."
        
    val notificationBuilder = NotificationCompat.Builder(this, channelId)
        .setSmallIcon(R.mipmap.ic_launcher)
        .setContentTitle(title)
        .setContentText(body)
        .setPriority(NotificationCompat.PRIORITY_MAX)
        .setCategory(NotificationCompat.CATEGORY_ALARM)
        .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
        .setSound(null)
        .setVibrate(longArrayOf(0, 1000, 500, 1000, 500, 1000))
        .setAutoCancel(true)
        .setOngoing(false)
        .setFullScreenIntent(pendingIntent, true)
        .setContentIntent(pendingIntent)
        // Mejoras adicionales
        .setUsesChronometer(true)
        .setTimeoutAfter(300000) // 5 minutos
        .setDefaults(NotificationCompat.DEFAULT_ALL)
    
    val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    
    // ID único para esta notificación
    val notificationId = System.currentTimeMillis().toInt()
    manager.notify(notificationId, notificationBuilder.build())
    Log.d(TAG, "Notificación enviada con ID: $notificationId")
}
    
    // Crear o actualizar canal de notificación en tiempo de ejecución
    private fun createOrUpdateNotificationChannel(context: Context): String {
        val channelId = "panic_channel_v2"
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channelName = "Emergencias"
            val importance = NotificationManager.IMPORTANCE_HIGH
            val channel = NotificationChannel(channelId, channelName, importance).apply {
                description = "Canal para alertas de emergencia"
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 1000, 500, 1000, 500, 1000)
                
                setBypassDnd(true)
                setShowBadge(true)
                
                val alarmSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
                val audioAttributes = AudioAttributes.Builder()
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .build()
                setSound(alarmSound, audioAttributes)
                
                enableLights(true)
                lightColor = android.graphics.Color.RED
            }

            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
            Log.d(TAG, "Canal de notificación creado/actualizado: $channelId")
        }
        
        return channelId
    }
    
    private fun wakeLockScreen() {
        try {
            val pm = getSystemService(Context.POWER_SERVICE) as PowerManager
            val wakeLock = pm.newWakeLock(
                PowerManager.FULL_WAKE_LOCK or 
                PowerManager.ACQUIRE_CAUSES_WAKEUP or 
                PowerManager.ON_AFTER_RELEASE, 
                "ButtonPanic:EmergencyWakeLock"
            )
            
            wakeLock.acquire(30*1000L)  // Mantener por 30 segundos para asegurar
            Log.d(TAG, "WakeLock adquirido")
        } catch (e: Exception) {
            Log.e(TAG, "Error al adquirir WakeLock: ${e.message}")
        }
    }
    
    override fun onNewToken(token: String) {
        Log.d(TAG, "Nuevo token FCM: $token")
        // Aquí deberías enviar el token a tu servidor
    }
}