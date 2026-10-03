package org.bvcp.bhadohi_cricket.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme = darkColorScheme(
  primary = PrimaryGreen,
  secondary = AmberHighlight,
  tertiary = CreamBackground,
  background = DeepForest,
  surface = DarkCard,
  onPrimary = White,
  onSecondary = DeepForest,
  onBackground = CreamBackground,
  onSurface = White
)

private val LightColorScheme = lightColorScheme(
  primary = PrimaryGreen,
  secondary = DeepForest,
  tertiary = AmberHighlight,
  background = CreamBackground,
  surface = CardBackground,
  onPrimary = White,
  onSecondary = White,
  onBackground = MainText,
  onSurface = MainText
)

@Composable
fun BhadohiCricketTheme(
  darkTheme: Boolean = isSystemInDarkTheme(),
  dynamicColor: Boolean = false, // Use our authentic branded palette
  content: @Composable () -> Unit,
) {
  val colorScheme =
    when {
      dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
        val context = LocalContext.current
        if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
      }
      darkTheme -> DarkColorScheme
      else -> LightColorScheme
    }

  MaterialTheme(colorScheme = colorScheme, typography = Typography, content = content)
}
