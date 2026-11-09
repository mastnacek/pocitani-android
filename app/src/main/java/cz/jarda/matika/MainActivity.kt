package cz.jarda.matika

import android.annotation.SuppressLint
import android.content.ActivityNotFoundException
import android.content.Intent
import android.os.Bundle
import android.print.PrintAttributes
import android.print.PrintManager
import android.webkit.JavascriptInterface
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.webkit.WebViewAssetLoader

class MainActivity : ComponentActivity() {
    private lateinit var web: WebView

    /** Most do stránky: klíč a model z local.properties (přes BuildConfig) a tisk pracovního listu. */
    inner class Bridge {
        @JavascriptInterface fun key(): String = BuildConfig.OPENROUTER_KEY

        @JavascriptInterface fun model(): String = BuildConfig.OPENROUTER_MODEL

        @JavascriptInterface fun print() =
            runOnUiThread {
                val pm = getSystemService(PRINT_SERVICE) as PrintManager
                pm.print("Pracovní list", web.createPrintDocumentAdapter("Pracovni-list"), PrintAttributes.Builder().build())
            }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Stránka běží z https://appassets.androidplatform.net -> funguje localStorage i fetch na OpenRouter.
        val loader =
            WebViewAssetLoader
                .Builder()
                .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
                .build()

        web =
            WebView(this).apply {
                settings.javaScriptEnabled = true
                settings.domStorageEnabled = true
                settings.allowFileAccess = false
                addJavascriptInterface(Bridge(), "AndroidCfg")
                webViewClient =
                    object : WebViewClient() {
                        override fun shouldInterceptRequest(
                            view: WebView,
                            request: WebResourceRequest,
                        ): WebResourceResponse? = loader.shouldInterceptRequest(request.url)

                        // Odkazy mimo aplikaci (třeba openrouter.ai/keys v nastavení) otevíráme
                        // v externím prohlížeči; WebView by je jinak načetl do sebe.
                        override fun shouldOverrideUrlLoading(
                            view: WebView,
                            request: WebResourceRequest,
                        ): Boolean {
                            if (request.url.host == "appassets.androidplatform.net") return false
                            try {
                                startActivity(Intent(Intent.ACTION_VIEW, request.url))
                            } catch (_: ActivityNotFoundException) {
                            }
                            return true
                        }
                    }
            }
        setContentView(web)

        // targetSdk 35 = edge-to-edge. WebView ignoruje setPadding (obsah by se kreslil za
        // lišty i klávesnici), proto systémové lišty a klávesnici řešíme jako okraje
        // (margins) – WebView se skutečně zmenší a stránka končí nad klávesnicí.
        ViewCompat.setOnApplyWindowInsetsListener(web) { v, insets ->
            val sys = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            val ime = insets.getInsets(WindowInsetsCompat.Type.ime())
            val lp = v.layoutParams as android.widget.FrameLayout.LayoutParams
            lp.setMargins(sys.left, sys.top, sys.right, maxOf(sys.bottom, ime.bottom))
            v.requestLayout()
            insets
        }

        if (savedInstanceState == null) {
            web.loadUrl("https://appassets.androidplatform.net/assets/index.html")
        } else {
            web.restoreState(savedInstanceState)
        }

        onBackPressedDispatcher.addCallback(
            this,
            object : OnBackPressedCallback(true) {
                override fun handleOnBackPressed() {
                    if (web.canGoBack()) web.goBack() else finish()
                }
            },
        )
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        web.saveState(outState)
    }
}
