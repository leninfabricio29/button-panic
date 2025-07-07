package com.leninyanangomez.buttonpanic

import android.app.Activity
import android.os.Bundle
import android.view.WindowManager
import android.graphics.Color
import android.media.MediaPlayer
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.KeyEvent
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.res.ResourcesCompat
import com.google.android.gms.maps.MapView
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.model.MarkerOptions

class FullScreenAlertActivity : Activity() {
    private var mediaPlayer: MediaPlayer? = null
    private val TAG = "PanicFullScreen"
    private var vibrationHandler: Handler? = null
    private var vibrationRunnable: Runnable? = null
    private var mapView: MapView? = null
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        try {
            Log.d(TAG, "Iniciando actividad de pantalla completa")

            window.addFlags(
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
                WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD or
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
                WindowManager.LayoutParams.FLAG_FULLSCREEN
            )

            val lat = intent.getStringExtra("lat") ?: "0.0"
            val lon = intent.getStringExtra("lon") ?: "0.0"
            val senderName = intent.getStringExtra("senderName") ?: "Desconocido"
            val customFont = ResourcesCompat.getFont(this, R.font.latobold)

            Log.d(TAG, "Coordenadas recibidas: $lat, $lon")

            // MAIN LAYOUT
            val mainLayout = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                setBackgroundColor(Color.parseColor("#F5F5F5")) // gris claro
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.MATCH_PARENT
                )
                setPadding(30, 30, 30, 30)
            }

            // HEADER (barra roja)
            val headerLayout = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                setBackgroundColor(Color.WHITE)
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                )
            }

            val senderText = TextView(this).apply {
                text = "$senderName necesita tu ayuda!"
                setTextColor(Color.RED)
                textSize = 24f
                textAlignment = View.TEXT_ALIGNMENT_CENTER
                setPadding(20, 0, 20, 20)
                typeface = customFont
            }

            headerLayout.addView(senderText)
            mainLayout.addView(headerLayout)

            // MAPA (MapView)
            val mapViewBundle = savedInstanceState?.getBundle("MapViewBundleKey")

            mapView = MapView(this).apply {
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    0
                ).apply {
                    weight = 1f
                    setMargins(0, 20, 0, 20)
                }
                background = ResourcesCompat.getDrawable(resources, R.drawable.rounded_map, null)
                clipToOutline = true
            }
            
            mapView?.onCreate(mapViewBundle)
            mapView?.getMapAsync { googleMap ->
                try {
                    val latLng = com.google.android.gms.maps.model.LatLng(lat.toDouble(), lon.toDouble())
                    googleMap.moveCamera(CameraUpdateFactory.newLatLngZoom(latLng, 17f))
                    googleMap.addMarker(MarkerOptions().position(latLng).title("Ubicación de $senderName"))
                    Log.d(TAG, "Mapa configurado correctamente")
                } catch (e: Exception) {
                    Log.e(TAG, "Error al configurar el mapa: ${e.message}")
                }
            }

            mainLayout.addView(mapView)

            // BOTÓN ENTENDIDO
            val closeButton = Button(this).apply {
                text = "ENTENDIDO"
                textSize = 18f
                setTextColor(Color.WHITE)
                background = ResourcesCompat.getDrawable(resources, R.drawable.rounded_button, null)
                setPadding(30, 30, 30, 30)
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply {
                    setMargins(20, 20, 20, 40)
                }
                setOnClickListener {
                    Log.d(TAG, "Botón Entendido presionado")
                    stopAlarm()
                    finish()
                }
            }

            mainLayout.addView(closeButton)

            setContentView(mainLayout)
            playAlarm()
            startVibration()

            Log.d(TAG, "Actividad de pantalla completa inicializada correctamente")
        } catch (e: Exception) {
            Log.e(TAG, "Error en onCreate: ${e.message}")
            e.printStackTrace()
        }
    }

    private fun playAlarm() {
        try {
            mediaPlayer = MediaPlayer.create(this, R.raw.alarm)
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

    override fun onStart() {
        super.onStart()
        mapView?.onStart()
    }

    override fun onResume() {
        super.onResume()
        mapView?.onResume()
    }

    override fun onPause() {
        mapView?.onPause()
        super.onPause()
    }

    override fun onStop() {
        mapView?.onStop()
        super.onStop()
    }

    override fun onDestroy() {
        mapView?.onDestroy()
        stopAlarm()
        super.onDestroy()
        Log.d(TAG, "Actividad destruida")
    }

    override fun onLowMemory() {
        super.onLowMemory()
        mapView?.onLowMemory()
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        val mapViewBundle = outState.getBundle("MapViewBundleKey") ?: Bundle()
        outState.putBundle("MapViewBundleKey", mapViewBundle)
        mapView?.onSaveInstanceState(mapViewBundle)
    }
}