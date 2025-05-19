package com.leninyanangomez.buttonpanic

import android.app.Activity
import android.os.Bundle
import android.view.WindowManager
import android.webkit.WebView
import android.webkit.WebViewClient
import android.graphics.Color
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.KeyEvent
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.res.ResourcesCompat


class FullScreenAlertActivity : Activity() {
    private var mediaPlayer: MediaPlayer? = null
    private val TAG = "PanicFullScreen"
    private var vibrationHandler: Handler? = null
    private var vibrationRunnable: Runnable? = null
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        try {
            Log.d(TAG, "Iniciando actividad de pantalla completa")
            
            // Configurar ventana para pantalla completa y activarse sobre el bloqueo de pantalla
            window.addFlags(
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
                WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD or
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
                WindowManager.LayoutParams.FLAG_FULLSCREEN
            )
            
            // Obtener coordenadas
            val lat = intent.getStringExtra("lat") ?: "0.0"
            val lon = intent.getStringExtra("lon") ?: "0.0"
            val senderName = intent.getStringExtra("senderName") ?: "Desconocido"
            val customFont = ResourcesCompat.getFont(this, R.font.latobold)


            Log.d(TAG, "Coordenadas recibidas: $lat, $lon")
            
            // Crear layout principal
            val mainLayout = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                setBackgroundColor(Color.RED)
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.MATCH_PARENT
                )
            }
            
            // Título de alerta
            val alertTitle = TextView(this).apply {
                text = "¡¡ALERTA DE EMERGENCIA!!"
                setTextColor(Color.WHITE)
                textSize = 24f
                textAlignment = View.TEXT_ALIGNMENT_CENTER
                setPadding(20, 40, 20, 40)
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                )
            }
            mainLayout.addView(alertTitle)
            alertTitle.typeface = customFont
            //Nombre del emisor
            // Nombre del emisor
         val senderText = TextView(this).apply {
            text = "Emitido por: $senderName"
                setTextColor(Color.WHITE)
                textSize = 18f
                textAlignment = View.TEXT_ALIGNMENT_CENTER
                setPadding(20, 0, 20, 20)
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                )
            }
            mainLayout.addView(senderText)
            senderText.typeface = customFont

            // Crear WebView para el mapa
            val mapUrl = "https://www.google.com/maps?q=$lat,$lon"
            Log.d(TAG, "Cargando URL del mapa: $mapUrl")
            
            val webView = WebView(this).apply {
                settings.javaScriptEnabled = true
                webViewClient = object : WebViewClient() {
                    override fun onPageFinished(view: WebView?, url: String?) {
                        super.onPageFinished(view, url)
                        Log.d(TAG, "Mapa cargado correctamente")
                    }
                }
                loadUrl(mapUrl)
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    0
                ).apply {
                    weight = 1f
                }
            }
            mainLayout.addView(webView)
            
            // Botón para cerrar la alerta
            val closeButton = Button(this).apply {
                text = "Entendido"
                textSize = 18f
                setBackgroundColor(Color.WHITE)
                setTextColor(Color.RED)
                setPadding(20, 30, 20, 30)
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply {
                    setMargins(40, 20, 40, 40)
                }
                setOnClickListener {
                    Log.d(TAG, "Botón Entendido presionado")
                    stopAlarm()
                    finish()
                }
            }
            mainLayout.addView(closeButton)
            
            setContentView(mainLayout)
            
            // Reproducir sonido de alarma
            playAlarm()
            
            // Iniciar vibración periódica
            startVibration()
            
            Log.d(TAG, "Actividad de pantalla completa inicializada correctamente")
        } catch (e: Exception) {
            Log.e(TAG, "Error en onCreate: ${e.message}")
            e.printStackTrace()
        }
    }
    
    private fun playAlarm() {
    try {
        mediaPlayer = MediaPlayer.create(this, R.raw.alarm) // usa el nombre de tu archivo sin extensión
        mediaPlayer?.apply {
            isLooping = true
            start()
        }
        Log.d(TAG, "Reproducción de sonido personalizado iniciada")
    } catch (e: Exception) {
        Log.e(TAG, "Error al reproducir sonido personalizado: ${e.message}")
        e.printStackTrace()
    }
}
    
    private fun startVibration() {
        vibrationHandler = Handler(Looper.getMainLooper())
        vibrationRunnable = object : Runnable {
            override fun run() {
                try {
                    val vibrator = getSystemService(VIBRATOR_SERVICE) as android.os.Vibrator
                    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                        vibrator.vibrate(android.os.VibrationEffect.createOneShot(500, android.os.VibrationEffect.DEFAULT_AMPLITUDE))
                    } else {
                        @Suppress("DEPRECATION")
                        vibrator.vibrate(500)
                    }
                    vibrationHandler?.postDelayed(this, 1500)
                } catch (e: Exception) {
                    Log.e(TAG, "Error en vibración: ${e.message}")
                }
            }
        }
        vibrationHandler?.post(vibrationRunnable!!)
        Log.d(TAG, "Vibración periódica iniciada")
    }
    
    private fun stopAlarm() {
        try {
            mediaPlayer?.apply {
                if (isPlaying) {
                    stop()
                }
                release()
            }
            mediaPlayer = null
            
            vibrationRunnable?.let { vibrationHandler?.removeCallbacks(it) }
            vibrationHandler = null
            vibrationRunnable = null
            
            Log.d(TAG, "Alarma y vibración detenidas")
        } catch (e: Exception) {
            Log.e(TAG, "Error al detener alarma: ${e.message}")
        }
    }
    
    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        // Interceptar botón de retroceso para evitar salir fácilmente
        return if (keyCode == KeyEvent.KEYCODE_BACK) {
            Log.d(TAG, "Botón de retroceso interceptado")
            true
        } else {
            super.onKeyDown(keyCode, event)
        }
    }
    
    override fun onDestroy() {
        stopAlarm()
        Log.d(TAG, "Actividad destruida")
        super.onDestroy()
    }
}