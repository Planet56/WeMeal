package com.wemeal.app

import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback

class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initialize WebView
        webView = WebView(this).apply {
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                // Improve performance
                cacheMode = WebSettings.LOAD_DEFAULT
            }
            
            // Ensure links open in the WebView, not external browser
            webViewClient = WebViewClient()
            
            // useful for debugging web content
            WebView.setWebContentsDebuggingEnabled(true)
        }

        setContentView(webView)

        // Load the URL
        // Use "http://10.0.2.2:8000" for local emulator testing if server is running
        webView.loadUrl("https://wemeal.online")
        
        // Handle Back Press
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }
}
