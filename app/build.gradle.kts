import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

val localProps = Properties().apply {
    val f = rootProject.file("local.properties")
    if (f.exists()) f.inputStream().use { load(it) }
}
fun lp(key: String) = (localProps.getProperty(key) ?: "").replace("\"", "")

android {
    namespace = "cz.jarda.matika"
    compileSdk = 35

    defaultConfig {
        applicationId = "cz.jarda.matika"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
        buildConfigField("String", "OPENROUTER_KEY", "\"${lp("OPENROUTER_KEY")}\"")
        buildConfigField("String", "OPENROUTER_MODEL", "\"${lp("OPENROUTER_MODEL")}\"")
    }
    buildFeatures { buildConfig = true }
    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("debug") // rodinné použití, žádný Play Store
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
}

dependencies {
    implementation("androidx.activity:activity-ktx:1.9.3")
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.webkit:webkit:1.12.1")
}
