package com.leninyanangomez.buttonpanic

import android.app.Activity
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.app.NotificationManager
import android.content.Context
import android.graphics.Color
import android.media.MediaPlayer
import android.os.*
import android.util.Log
import android.view.KeyEvent
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.*
import androidx.core.content.res.ResourcesCompat
import com.mapbox.geojson.Point
import com.mapbox.maps.*
import com.mapbox.maps.plugin.Plugin
import com.mapbox.maps.plugin.annotation.annotations
import com.mapbox.maps.plugin.annotation.generated.*
import com.mapbox.maps.plugin.lifecycle.lifecycle
import com.mapbox.maps.plugin.viewport.viewport
import androidx.appcompat.app.AppCompatActivity


class FullScreenAlertActivity : AppCompatActivity() {
    private val TAG = "PanicFullScreen"
    private var mediaPlayer: MediaPlayer? = null
    private var vibrationHandler: Handler? = null
    private var vibrationRunnable: Runnable? = null
    private lateinit var mapView: MapView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

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

        // Layout principal con ScrollView para mejor adaptabilidad
        val scrollView = ScrollView(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            setBackgroundColor(Color.parseColor("#ffffffff"))
        }

        val mainLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
            )
            setPadding(20, 20, 20, 60) // Más padding abajo (60 en vez de 20)
        }

        // Header mejorado con más espacio y mejor diseño
        val headerLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.WHITE)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            setPadding(25, 30, 25, 30)
            // Agregar elevación/sombra si está disponible
            elevation = 8f
        }

        // Icono de emergencia (opcional)
        val emergencyIcon = TextView(this).apply {
            text = "🚨"
            textSize = 32f
            textAlignment = View.TEXT_ALIGNMENT_CENTER
            setPadding(0, 0, 0, 15)
        }

        val senderText = TextView(this).apply {
            setText("¡Emergencia!\n$senderName\nnecesita tu ayuda")
            setTextColor(Color.parseColor("#D32F2F")) // Rojo más profesional
            textSize = 32f
            textAlignment = View.TEXT_ALIGNMENT_CENTER
            setPadding(0, 0, 0, 10)
            typeface = customFont
        }

        headerLayout.addView(emergencyIcon)
        headerLayout.addView(senderText)
        
        // Espaciado entre header y mapa
        val spacer1 = View(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                25
            )
        }

        mainLayout.addView(headerLayout)
        mainLayout.addView(spacer1)

        // Contenedor del mapa con mejor proporción
        val mapContainer = FrameLayout(this).apply {
            layoutParams = LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            dpToPx(500) // Altura fija más generosa
            )
            setBackgroundColor(Color.WHITE)
            setPadding(10, 10, 10, 10)
            elevation = 4f
        }

        // Mapbox MapView con configuración mejorada y estilos personalizados
        val mapInitOptions = MapInitOptions(
            context = this,
            resourceOptions = ResourceOptionsManager.getDefault(this, getString(R.string.mapbox_access_token)).resourceOptions,
            styleUri = Style.LIGHT // Cambia el estilo por defecto aquí (ejemplo: Style.LIGHT, Style.DARK, Style.SATELLITE)
        )

        mapView = MapView(this, mapInitOptions).apply {
            layoutParams = FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
            )
            background = ResourcesCompat.getDrawable(resources, R.drawable.rounded_map, null)
            clipToOutline = true
        }

        mapContainer.addView(mapView)
        // Espaciado entre mapa y botón
        val spacer2 = View(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                50
            )
        }

        mainLayout.addView(mapContainer)
        mainLayout.addView(spacer2)

        // Botón mejorado
        val closeButton = Button(this).apply {
            text = "ENTENDIDO"
            textSize = 20f
            setTextColor(Color.WHITE)
            background = ResourcesCompat.getDrawable(resources, R.drawable.rounded_button, null)
            setPadding(40, 40, 40, 40)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                setMargins(30, 0, 30, 30)
            }
            elevation = 6f
            setOnClickListener {
                val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                Log.d(TAG, "Botón Entendido presionado")
                stopAlarm()
                finish()
                manager.cancelAll()
            }
        }

        mainLayout.addView(closeButton)
        scrollView.addView(mainLayout)
        setContentView(scrollView)

        // Configurar mapa con pin personalizado mejorado
        mapView.getMapboxMap().loadStyleUri(Style.LIGHT) { style ->
            try {
                val point = Point.fromLngLat(lon.toDouble(), lat.toDouble())
                mapView.getMapboxMap().setCamera(
                    CameraOptions.Builder()
                        .center(point)
                        .zoom(16.0) // Zoom ligeramente menor para mejor contexto
                        .build()
                )

            mapView.setOnTouchListener { _, _ ->
                scrollView.requestDisallowInterceptTouchEvent(true)
                    false
            }

                val annotationApi = mapView.annotations
                val pointAnnotationManager = annotationApi.createPointAnnotationManager(mapView)

                // Crear pin personalizado con tamaño controlado
                val iconBitmap = createCustomPin()

                // Crear y agregar el marcador con configuración mejorada
                val pointAnnotationOptions = PointAnnotationOptions()
                    .withPoint(point)
                    .withIconImage(iconBitmap)
                    .withIconSize(1.0) // Tamaño más controlado
                    //.withIconAnchor(IconAnchor.BOTTOM) // Anclar en la parte inferior del pin

                pointAnnotationManager.create(pointAnnotationOptions)

                Log.d(TAG, "Mapa Mapbox configurado correctamente")
            } catch (e: Exception) {
                Log.e(TAG, "Error al configurar el mapa: ${e.message}")
            }
        }

        playAlarm()
        startVibration()

        Log.d(TAG, "Actividad de pantalla completa inicializada correctamente")
    }

    // Función para crear un pin personalizado con tamaño específico
    private fun createCustomPin(): Bitmap {
        val originalBitmap = BitmapFactory.decodeResource(resources, R.drawable.ic_marcador)
        
        // Definir tamaño deseado en dp y convertir a px
        val targetWidthPx = dpToPx(40)
        val targetHeightPx = dpToPx(50)
        
        return Bitmap.createScaledBitmap(originalBitmap, targetWidthPx, targetHeightPx, true)
    }

    // Función auxiliar para convertir dp a px
    private fun dpToPx(dp: Int): Int {
        return (dp * resources.displayMetrics.density).toInt()
    }

    private fun playAlarm() {
        mediaPlayer = MediaPlayer.create(this, R.raw.alarm)
        mediaPlayer?.apply {
            isLooping = true
            start()
        }
        Log.d(TAG, "Reproducción de sonido personalizada iniciada")
    }

    private fun startVibration() {
        vibrationHandler = Handler(Looper.getMainLooper())
        vibrationRunnable = object : Runnable {
            override fun run() {
                try {
                    val vibrator = getSystemService(VIBRATOR_SERVICE) as Vibrator
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        vibrator.vibrate(
                            VibrationEffect.createOneShot(
                                500,
                                VibrationEffect.DEFAULT_AMPLITUDE
                            )
                        )
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
        mediaPlayer?.apply {
            if (isPlaying) stop()
            release()
        }
        mediaPlayer = null
        vibrationRunnable?.let { vibrationHandler?.removeCallbacks(it) }
        vibrationHandler = null
        vibrationRunnable = null
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        return if (keyCode == KeyEvent.KEYCODE_BACK) {
            Log.d(TAG, "Botón de retroceso interceptado")
            true
        } else {
            super.onKeyDown(keyCode, event)
        }
    }

    override fun onStart() {
        super.onStart()
        mapView.onStart()
    }

    override fun onResume() {
        super.onResume()
        //mapView.onResume()
    }

    override fun onPause() {
        //mapView.onPause()
        super.onPause()
    }

    override fun onStop() {
        mapView.onStop()
        super.onStop()
    }

    override fun onDestroy() {
        mapView.onDestroy()
        stopAlarm()
        super.onDestroy()
    }

    override fun onLowMemory() {
        super.onLowMemory()
        mapView.onLowMemory()
    }
}