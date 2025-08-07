############################
# Core React Native
############################
-keep class com.facebook.react.** { *; }
-dontwarn com.facebook.react.**

-keep class com.facebook.hermes.** { *; }
-dontwarn com.facebook.hermes.**

-keep class com.facebook.jni.** { *; }
-dontwarn com.facebook.jni.**

-keepclassmembers class * {
  @com.facebook.react.uimanager.annotations.ReactProp <methods>;
}

############################
# react-native-reanimated
############################
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

############################
# Firebase (mensajería, core)
############################
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

-keep class com.google.common.** { *; }
-dontwarn com.google.common.**

############################
# Mapbox
############################
-keep class com.mapbox.** { *; }
-dontwarn com.mapbox.**

############################
# Gson (usado por muchas libs)
############################
-keepattributes Signature
-keepattributes *Annotation*
-keep class sun.misc.Unsafe { *; }
-keep class com.google.gson.** { *; }
-dontwarn com.google.gson.**

############################
# Glide (por si alguna lib lo usa internamente)
############################
-keep class com.bumptech.glide.** { *; }
-dontwarn com.bumptech.glide.**

############################
# Prevent stripping of EntryPoint classes
############################
-keep class * extends com.facebook.react.ReactActivity
-keep class * extends android.app.Application

############################
# General fallback
############################
-dontwarn okhttp3.**
-dontwarn javax.annotation.**
-dontwarn org.codehaus.mojo.animal_sniffer.**
-dontwarn kotlin.**
