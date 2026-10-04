package org.bvcp.bhadohi_cricket.ui.main

import android.content.Intent
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation3.runtime.NavKey
import org.bvcp.bhadohi_cricket.theme.*

data class TournamentItem(
  val id: String,
  val title: String,
  val block: String,
  val ground: String,
  val dates: String,
  val maxTeams: Int,
  val entryNotice: String,
  val status: String
)

data class PlayerItem(
  val id: String,
  val name: String,
  val village: String,
  val block: String,
  val role: String,
  val maskedPhone: String,
  val batting: String,
  val bowling: String
)

data class RegisteredPlayer(
  val fullName: String,
  val mobile: String,
  val maskedMobile: String,
  val village: String,
  val block: String,
  val role: String,
  val battingStyle: String,
  val bowlingStyle: String,
  val recoveryCode: String,
  val isAvailable: Boolean = true,
  val allowWhatsapp: Boolean = true
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
  onItemClick: (NavKey) -> Unit,
  modifier: Modifier = Modifier
) {
  var selectedTab by remember { mutableStateOf(0) }
  val context = LocalContext.current

  // Global app state for registered player profile and scouting list
  var registeredProfile by remember { mutableStateOf<RegisteredPlayer?>(null) }

  val playersList = remember {
    mutableStateListOf(
      PlayerItem("1", "अमित सिंह", "खमरिया", "ज्ञानपुर", "ऑल-राउंडर", "98XXXXXX21", "दाएं हाथ", "दाएं हाथ मध्यम गति"),
      PlayerItem("2", "रोहित बिन्द", "गोपीगंज", "ज्ञानपुर", "बल्लेबाज", "98XXXXXX22", "बाएं हाथ", "ऑफ स्पिन"),
      PlayerItem("3", "दीपक यादव", "औराई खास", "औराई", "गेंदबाज", "98XXXXXX23", "दाएं हाथ", "तेज गेंदबाज"),
      PlayerItem("4", "सुरेश पाल", "बाबूसराय", "औराई", "ऑल-राउंडर", "98XXXXXX24", "दाएं हाथ", "मध्यम तेज"),
      PlayerItem("5", "विकास मौर्य", "सुरियावां स्टेशन", "सुरियावां", "बल्लेबाज", "98XXXXXX25", "दाएं हाथ", "लेग स्पिन"),
      PlayerItem("6", "पंकज तिवारी", "मिश्राइनपुर", "डीघ", "गेंदबाज", "98XXXXXX26", "बाएं हाथ", "बाएं हाथ तेज")
    )
  }

  val tabs = listOf("टूर्नामेंट्स", "पंजीकरण / प्रोफाइल", "खिलाड़ी खोज", "मेरा स्क्वाड", "नियम")

  Scaffold(
    topBar = {
      TopAppBar(
        title = {
          Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
              modifier = Modifier
                .size(38.dp)
                .background(PrimaryGreen, RoundedCornerShape(10.dp)),
              contentAlignment = Alignment.Center
            ) {
              Text("🏏", fontSize = 20.sp)
            }
            Spacer(modifier = Modifier.width(10.dp))
            Column {
              Text(
                "भदोही ग्रामीण क्रिकेट",
                fontWeight = FontWeight.Bold,
                fontSize = 17.sp,
                color = White
              )
              Text(
                "जिला भदोही (संत रविदास नगर) • 18+ केवल",
                fontSize = 11.sp,
                color = AmberHighlight
              )
            }
          }
        },
        colors = TopAppBarDefaults.topAppBarColors(
          containerColor = DeepForest,
          titleContentColor = White
        )
      )
    },
    bottomBar = {
      NavigationBar(
        containerColor = DeepForest,
        contentColor = White
      ) {
        tabs.forEachIndexed { index, label ->
          val isSelected = selectedTab == index
          NavigationBarItem(
            selected = isSelected,
            onClick = { selectedTab = index },
            icon = {
              Text(
                when (index) {
                  0 -> "🏆"
                  1 -> "👤"
                  2 -> "👥"
                  3 -> "🛡️"
                  else -> "📜"
                },
                fontSize = 18.sp
              )
            },
            label = {
              Text(
                label,
                fontSize = 9.sp,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                color = if (isSelected) AmberHighlight else White.copy(alpha = 0.7f),
                maxLines = 1
              )
            },
            colors = NavigationBarItemDefaults.colors(
              indicatorColor = PrimaryGreen,
              selectedIconColor = White,
              unselectedIconColor = White.copy(alpha = 0.6f)
            )
          )
        }
      }
    }
  ) { padding ->
    Box(
      modifier = Modifier
        .fillMaxSize()
        .padding(padding)
        .background(CreamBackground)
    ) {
      when (selectedTab) {
        0 -> TournamentsView(onNavigateToRegister = { selectedTab = 1 })
        1 -> PlayerRegistrationAndProfileView(
          currentProfile = registeredProfile,
          onProfileSaved = { newProfile ->
            registeredProfile = newProfile
            // Add or update in public scouting directory
            val existingIdx = playersList.indexOfFirst { it.name == newProfile.fullName && it.village == newProfile.village }
            val newItem = PlayerItem(
              id = "p-${System.currentTimeMillis()}",
              name = newProfile.fullName,
              village = newProfile.village,
              block = newProfile.block,
              role = newProfile.role,
              maskedPhone = newProfile.maskedMobile,
              batting = newProfile.battingStyle,
              bowling = newProfile.bowlingStyle
            )
            if (existingIdx >= 0) {
              playersList[existingIdx] = newItem
            } else {
              playersList.add(0, newItem)
            }
          }
        )
        2 -> PlayersView(players = playersList)
        3 -> SquadView()
        4 -> RulesView()
      }
    }
  }
}

// =========================================================================
// 1. TOURNAMENTS VIEW
// =========================================================================
@Composable
fun TournamentsView(onNavigateToRegister: () -> Unit) {
  val context = LocalContext.current
  var selectedBlock by remember { mutableStateOf("सभी") }
  val blocks = listOf("सभी", "ज्ञानपुर", "औराई", "भदोही", "सुरियावां", "डीघ", "अभोली")

  val sampleTournaments = listOf(
    TournamentItem(
      "1",
      "खमरिया ग्रामीण क्रिकेट कप 2026",
      "ज्ञानपुर",
      "खमरिया इंटर कॉलेज मैदान",
      "15 से 20 नवंबर 2026",
      16,
      "₹500 प्रति टीम - केवल मैदान पर नकद",
      "पंजीकरण खुला"
    ),
    TournamentItem(
      "2",
      "औराई नगर पंचायत प्रीमियर लीग",
      "औराई",
      "औराई नगर पंचायत मैदान",
      "18 से 24 नवंबर 2026",
      8,
      "₹400 प्रति टीम - केवल मैदान पर नकद",
      "पंजीकरण खुला"
    ),
    TournamentItem(
      "3",
      "सुरियावां ग्रामीण नॉकआउट कप",
      "सुरियावां",
      "सुरियावां स्टेशन रोड मैदान",
      "22 से 27 नवंबर 2026",
      8,
      "₹350 प्रति टीम - केवल मैदान पर नकद",
      "पंजीकरण खुला"
    )
  )

  val filtered = if (selectedBlock == "सभी") sampleTournaments else sampleTournaments.filter { it.block == selectedBlock }

  LazyColumn(
    modifier = Modifier.fillMaxSize().padding(12.dp),
    verticalArrangement = Arrangement.spacedBy(10.dp)
  ) {
    item {
      // Call to action: New Player Registration Prompt
      Card(
        colors = CardDefaults.cardColors(containerColor = DeepForest),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth().clickable { onNavigateToRegister() }
      ) {
        Row(
          modifier = Modifier.padding(12.dp),
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.SpaceBetween
        ) {
          Column(modifier = Modifier.weight(1f)) {
            Text("👤 क्या आप नए खिलाड़ी हैं?", fontWeight = FontWeight.Bold, color = AmberHighlight, fontSize = 13.sp)
            Text("अपना प्रोफाइल बनाएं व 15 दिन उपलब्धता दर्ज करें →", color = White, fontSize = 11.sp)
          }
          Surface(
            color = PrimaryGreen,
            shape = RoundedCornerShape(8.dp)
          ) {
            Text("पंजीकरण करें", color = White, fontSize = 10.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 8.dp, vertical = 5.dp))
          }
        }
      }
    }

    item {
      // Offline Notice Alert
      Card(
        colors = CardDefaults.cardColors(containerColor = Color(0xFFFEF3C7)),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth().border(1.dp, Color(0xFFF59E0B), RoundedCornerShape(12.dp))
      ) {
        Row(modifier = Modifier.padding(10.dp), verticalAlignment = Alignment.Top) {
          Text("⚠️", fontSize = 16.sp)
          Spacer(modifier = Modifier.width(8.dp))
          Text(
            "शून्य ऑनलाइन भुगतान: प्रवेश शुल्क केवल मैदान पर नकद (Cash on Ground) लिया जाएगा। ऐप में कोई UPI या वॉलेट नहीं है।",
            fontSize = 11.sp,
            color = Color(0xFF92400E),
            lineHeight = 16.sp
          )
        }
      }
    }

    item {
      // Block Filter Chips
      LazyRow(
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        modifier = Modifier.fillMaxWidth()
      ) {
        items(blocks) { block ->
          val isSelected = selectedBlock == block
          FilterChip(
            selected = isSelected,
            onClick = { selectedBlock = block },
            label = { Text(block, fontSize = 11.sp, fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal) },
            colors = FilterChipDefaults.filterChipColors(
              selectedContainerColor = PrimaryGreen,
              selectedLabelColor = White,
              containerColor = White,
              labelColor = MainText
            )
          )
        }
      }
    }

    items(filtered) { tour ->
      Card(
        colors = CardDefaults.cardColors(containerColor = White),
        shape = RoundedCornerShape(14.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = Modifier.fillMaxWidth().border(1.dp, BorderColor, RoundedCornerShape(14.dp))
      ) {
        Column(modifier = Modifier.padding(14.dp)) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Surface(
              color = PrimaryGreen.copy(alpha = 0.15f),
              shape = RoundedCornerShape(6.dp)
            ) {
              Text(
                "📍 ब्लॉक: ${tour.block}",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = PrimaryGreen,
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
              )
            }
            Surface(
              color = Color(0xFFD1FAE5),
              shape = RoundedCornerShape(12.dp)
            ) {
              Text(
                tour.status,
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF065F46),
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
              )
            }
          }

          Spacer(modifier = Modifier.height(8.dp))
          Text(tour.title, fontWeight = FontWeight.Bold, fontSize = 16.sp, color = MainText)

          Spacer(modifier = Modifier.height(6.dp))
          Column(
            modifier = Modifier
              .fillMaxWidth()
              .background(CreamBackground, RoundedCornerShape(8.dp))
              .padding(8.dp),
            verticalArrangement = Arrangement.spacedBy(3.dp)
          ) {
            Text("🏟️ मैदान: ${tour.ground}", fontSize = 11.sp, color = MainText)
            Text("👥 टीम सीमा: ${tour.maxTeams} टीमें", fontSize = 11.sp, color = MainText)
            Text("💵 शुल्क सूचना: ${tour.entryNotice}", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFFB45309))
            Text("📅 अवधि: ${tour.dates}", fontSize = 11.sp, color = MutedText)
          }

          Spacer(modifier = Modifier.height(10.dp))
          Button(
            onClick = {
              val shareIntent = Intent(Intent.ACTION_SEND).apply {
                type = "text/plain"
                putExtra(Intent.EXTRA_TEXT, "🏏 *${tour.title}*\nस्थान: ${tour.ground}\nब्लॉक: ${tour.block}\nअधिकतम टीमें: ${tour.maxTeams}\nशुल्क: ${tour.entryNotice}\n\nभदोही ग्रामीण क्रिकेट प्लेटफ़ॉर्म पर देखें!")
              }
              context.startActivity(Intent.createChooser(shareIntent, "WhatsApp पर साझा करें"))
            },
            colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
            shape = RoundedCornerShape(10.dp),
            modifier = Modifier.fillMaxWidth().height(42.dp)
          ) {
            Text("📲 WhatsApp पर शेयर करें", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = White)
          }
        }
      }
    }
  }
}

// =========================================================================
// 2. PLAYER REGISTRATION & PROFILE VIEW (NEW: Interactive Player Flow)
// =========================================================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PlayerRegistrationAndProfileView(
  currentProfile: RegisteredPlayer?,
  onProfileSaved: (RegisteredPlayer) -> Unit
) {
  val context = LocalContext.current
  var isEditing by remember { mutableStateOf(currentProfile == null) }

  // Form Fields State
  var mobileNumber by remember { mutableStateOf(currentProfile?.mobile ?: "") }
  var pin by remember { mutableStateOf("") }
  var confirmPin by remember { mutableStateOf("") }
  var isAgeVerified by remember { mutableStateOf(currentProfile != null) }

  var fullName by remember { mutableStateOf(currentProfile?.fullName ?: "") }
  var village by remember { mutableStateOf(currentProfile?.village ?: "") }
  var selectedBlock by remember { mutableStateOf(currentProfile?.block ?: "ज्ञानपुर") }
  var selectedRole by remember { mutableStateOf(currentProfile?.role ?: "ऑल-राउंडर") }
  var selectedBatting by remember { mutableStateOf(currentProfile?.battingStyle ?: "दाएं हाथ") }
  var selectedBowling by remember { mutableStateOf(currentProfile?.bowlingStyle ?: "मध्यम गति") }
  var isAvailable15Days by remember { mutableStateOf(currentProfile?.isAvailable ?: true) }
  var allowWhatsapp by remember { mutableStateOf(currentProfile?.allowWhatsapp ?: true) }

  // Dialog State
  var showSuccessDialog by remember { mutableStateOf(false) }
  var generatedRecoveryCode by remember { mutableStateOf("") }
  var errorMessage by remember { mutableStateOf<String?>(null) }

  val blocks = listOf("ज्ञानपुर", "औराई", "भदोही", "सुरियावां", "डीघ", "अभोली")
  val roles = listOf("बल्लेबाज", "गेंदबाज", "ऑल-राउंडर")
  val battingStyles = listOf("दाएं हाथ", "बाएं हाथ")
  val bowlingStyles = listOf("तेज गेंदबाज", "मध्यम गति", "स्पिन गेंदबाज", "गेंदबाजी नहीं")

  // Success Dialog with Emergency Recovery Code
  if (showSuccessDialog) {
    AlertDialog(
      onDismissRequest = { showSuccessDialog = false },
      title = {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Text("🎉", fontSize = 22.sp)
          Spacer(modifier = Modifier.width(8.dp))
          Text("खिलाड़ी पंजीकरण सफल!", fontWeight = FontWeight.Bold, fontSize = 16.sp)
        }
      },
      text = {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
          Text("खिलाड़ी: ${fullName}", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = MainText)
          Text("स्थान: ग्राम ${village}, ब्लॉक ${selectedBlock}", fontSize = 12.sp, color = MutedText)

          Card(
            colors = CardDefaults.cardColors(containerColor = Color(0xFFFEF3C7)),
            shape = RoundedCornerShape(10.dp),
            modifier = Modifier.fillMaxWidth().border(1.5.dp, Color(0xFFD97706), RoundedCornerShape(10.dp))
          ) {
            Column(modifier = Modifier.padding(12.dp)) {
              Text("🔑 आपातकालीन रिकवरी कोड:", fontWeight = FontWeight.Bold, fontSize = 11.sp, color = Color(0xFF92400E))
              Spacer(modifier = Modifier.height(4.dp))
              Text(
                generatedRecoveryCode,
                fontWeight = FontWeight.Black,
                fontSize = 20.sp,
                color = Color(0xFFB45309),
                letterSpacing = 2.sp
              )
              Spacer(modifier = Modifier.height(6.dp))
              Text(
                "⚠️ अति आवश्यक: इस कोड को अपनी डायरी या कागज़ पर लिख लें। यदि आप पिन भूल जाते हैं तो इसी कोड से खाता वापस खुलेगा (कोई SMS OTP नहीं आता)।",
                fontSize = 10.sp,
                color = Color(0xFF78350F),
                lineHeight = 14.sp
              )
            }
          }
        }
      },
      confirmButton = {
        Button(
          onClick = {
            showSuccessDialog = false
            isEditing = false
          },
          colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)
        ) {
          Text("मैंने कोड लिख लिया है (Done)", color = White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
        }
      }
    )
  }

  // If already registered and not currently editing, show the Profile Card!
  if (!isEditing && currentProfile != null) {
    LazyColumn(
      modifier = Modifier.fillMaxSize().padding(14.dp),
      verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
      item {
        Card(
          colors = CardDefaults.cardColors(containerColor = DeepForest),
          shape = RoundedCornerShape(16.dp),
          modifier = Modifier.fillMaxWidth()
        ) {
          Column(modifier = Modifier.padding(16.dp)) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                  modifier = Modifier
                    .size(48.dp)
                    .background(PrimaryGreen, CircleShape),
                  contentAlignment = Alignment.Center
                ) {
                  Text(currentProfile.fullName.take(1), fontWeight = FontWeight.Bold, color = White, fontSize = 22.sp)
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                  Text(currentProfile.fullName, fontWeight = FontWeight.Bold, fontSize = 18.sp, color = White)
                  Text("ग्राम: ${currentProfile.village} (ब्लॉक: ${currentProfile.block})", fontSize = 12.sp, color = AmberHighlight)
                }
              }
              Surface(
                color = if (currentProfile.isAvailable) Color(0xFF10B981) else Color(0xFF6B7280),
                shape = RoundedCornerShape(12.dp)
              ) {
                Text(
                  if (currentProfile.isAvailable) "सक्रिय" else "अक्रिय",
                  fontSize = 11.sp,
                  fontWeight = FontWeight.Bold,
                  color = White,
                  modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                )
              }
            }

            Spacer(modifier = Modifier.height(14.dp))
            HorizontalDivider(color = PrimaryGreen.copy(alpha = 0.5f))
            Spacer(modifier = Modifier.height(14.dp))

            // Profile Details Grid
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
              Column {
                Text("भूमिका:", fontSize = 11.sp, color = AmberHighlight)
                Text(currentProfile.role, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = White)
              }
              Column {
                Text("बल्लेबाजी:", fontSize = 11.sp, color = AmberHighlight)
                Text(currentProfile.battingStyle, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = White)
              }
              Column {
                Text("गेंदबाजी:", fontSize = 11.sp, color = AmberHighlight)
                Text(currentProfile.bowlingStyle, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = White)
              }
            }

            Spacer(modifier = Modifier.height(12.dp))
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Text("मोबाइल (गोपनीय): ${currentProfile.maskedMobile}", fontSize = 11.sp, color = White.copy(alpha = 0.8f))
              Text("रिकवरी कोड: ${currentProfile.recoveryCode}", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = AmberHighlight)
            }
          }
        }
      }

      item {
        // Availability Status Card
        Card(
          colors = CardDefaults.cardColors(containerColor = White),
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier.fillMaxWidth().border(1.dp, BorderColor, RoundedCornerShape(12.dp))
        ) {
          Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
          ) {
            Column(modifier = Modifier.weight(1f)) {
              Text("📅 15-दिन उपलब्धता स्थिति", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = MainText)
              Text("खिलाड़ी खोज में कप्तानों को अगले 15 दिन उपलब्ध दिखेंगे।", fontSize = 11.sp, color = MutedText)
            }
            Button(
              onClick = {
                Toast.makeText(context, "उपलब्धता अगले 15 दिनों के लिए नवीनीकृत कर दी गई!", Toast.LENGTH_SHORT).show()
              },
              colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
              shape = RoundedCornerShape(8.dp),
              contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
            ) {
              Text("नवीनीकृत करें", fontSize = 11.sp, color = White)
            }
          }
        }
      }

      item {
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
          Button(
            onClick = { isEditing = true },
            colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
            shape = RoundedCornerShape(10.dp),
            modifier = Modifier.weight(1f).height(42.dp)
          ) {
            Text("✏️ प्रोफ़ाइल संपादित करें", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = White)
          }

          OutlinedButton(
            onClick = {
              // Reset form to register another player
              mobileNumber = ""
              pin = ""
              confirmPin = ""
              fullName = ""
              village = ""
              isEditing = true
            },
            shape = RoundedCornerShape(10.dp),
            modifier = Modifier.weight(1f).height(42.dp)
          ) {
            Text("+ नया खिलाड़ी जोड़ें", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = PrimaryGreen)
          }
        }
      }
    }
    return
  }

  // =========================================================================
  // REGISTRATION FORM
  // =========================================================================
  LazyColumn(
    modifier = Modifier.fillMaxSize().padding(14.dp),
    verticalArrangement = Arrangement.spacedBy(12.dp)
  ) {
    item {
      Card(
        colors = CardDefaults.cardColors(containerColor = DeepForest),
        shape = RoundedCornerShape(14.dp),
        modifier = Modifier.fillMaxWidth()
      ) {
        Column(modifier = Modifier.padding(14.dp)) {
          Text("📝 खिलाड़ी पंजीकरण फॉर्म", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = AmberHighlight)
          Spacer(modifier = Modifier.height(4.dp))
          Text(
            "अपना 10-अंकीय मोबाइल नंबर व 6-अंकीय गुप्त पिन बनाकर भदोही जिले की किसी भी टीम में शामिल हों।",
            fontSize = 11.sp,
            color = White.copy(alpha = 0.9f)
          )
        }
      }
    }

    if (errorMessage != null) {
      item {
        Card(
          colors = CardDefaults.cardColors(containerColor = Color(0xFFFEE2E2)),
          shape = RoundedCornerShape(8.dp),
          modifier = Modifier.fillMaxWidth().border(1.dp, Color(0xFFEF4444), RoundedCornerShape(8.dp))
        ) {
          Row(modifier = Modifier.padding(10.dp), verticalAlignment = Alignment.CenterVertically) {
            Text("⚠️", fontSize = 16.sp)
            Spacer(modifier = Modifier.width(8.dp))
            Text(errorMessage!!, fontSize = 12.sp, color = Color(0xFFB91C1C), fontWeight = FontWeight.Bold)
          }
        }
      }
    }

    // Step 1: Account & Security
    item {
      Card(
        colors = CardDefaults.cardColors(containerColor = White),
        shape = RoundedCornerShape(14.dp),
        modifier = Modifier.fillMaxWidth().border(1.dp, BorderColor, RoundedCornerShape(14.dp))
      ) {
        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
          Text("भाग १: खाता सुरक्षा (पिन व आयु)", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = PrimaryGreen)

          OutlinedTextField(
            value = mobileNumber,
            onValueChange = { if (it.length <= 10 && it.all { c -> c.isDigit() }) mobileNumber = it },
            label = { Text("10-अंकीय मोबाइल नंबर") },
            placeholder = { Text("उदा. 9876543210") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
          )

          Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
            OutlinedTextField(
              value = pin,
              onValueChange = { if (it.length <= 6 && it.all { c -> c.isDigit() }) pin = it },
              label = { Text("6-अंकीय गुप्त पिन") },
              visualTransformation = PasswordVisualTransformation(),
              keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
              modifier = Modifier.weight(1f),
              singleLine = true
            )
            OutlinedTextField(
              value = confirmPin,
              onValueChange = { if (it.length <= 6 && it.all { c -> c.isDigit() }) confirmPin = it },
              label = { Text("पिन की पुष्टि") },
              visualTransformation = PasswordVisualTransformation(),
              keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
              modifier = Modifier.weight(1f),
              singleLine = true
            )
          }

          Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
            Checkbox(
              checked = isAgeVerified,
              onCheckedChange = { isAgeVerified = it },
              colors = CheckboxDefaults.colors(checkedColor = PrimaryGreen)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
              "मेरी आयु 18 वर्ष या उससे अधिक है (18+ केवल)",
              fontSize = 12.sp,
              fontWeight = FontWeight.Bold,
              color = if (isAgeVerified) MainText else Color(0xFFDC2626)
            )
          }
        }
      }
    }

    // Step 2: Cricket Profile Details
    item {
      Card(
        colors = CardDefaults.cardColors(containerColor = White),
        shape = RoundedCornerShape(14.dp),
        modifier = Modifier.fillMaxWidth().border(1.dp, BorderColor, RoundedCornerShape(14.dp))
      ) {
        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
          Text("भाग २: खिलाड़ी विवरण (क्रिकेट प्रोफ़ाइल)", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = PrimaryGreen)

          OutlinedTextField(
            value = fullName,
            onValueChange = { fullName = it },
            label = { Text("खिलाड़ी का पूरा नाम") },
            placeholder = { Text("उदा. राहुल बिन्द") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
          )

          OutlinedTextField(
            value = village,
            onValueChange = { village = it },
            label = { Text("गांव / कस्बा") },
            placeholder = { Text("उदा. खमरिया") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
          )

          // Block Selection
          Text("ब्लॉक का चयन करें:", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MainText)
          LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            items(blocks) { b ->
              val isSel = selectedBlock == b
              FilterChip(
                selected = isSel,
                onClick = { selectedBlock = b },
                label = { Text(b, fontSize = 11.sp) },
                colors = FilterChipDefaults.filterChipColors(
                  selectedContainerColor = PrimaryGreen,
                  selectedLabelColor = White
                )
              )
            }
          }

          // Primary Role Selection
          Text("प्राथमिक भूमिका:", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MainText)
          Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            roles.forEach { r ->
              val isSel = selectedRole == r
              FilterChip(
                selected = isSel,
                onClick = { selectedRole = r },
                label = { Text(r, fontSize = 11.sp) },
                colors = FilterChipDefaults.filterChipColors(
                  selectedContainerColor = PrimaryGreen,
                  selectedLabelColor = White
                )
              )
            }
          }

          // Batting Style
          Text("बल्लेबाजी शैली:", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MainText)
          Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            battingStyles.forEach { bat ->
              val isSel = selectedBatting == bat
              FilterChip(
                selected = isSel,
                onClick = { selectedBatting = bat },
                label = { Text(bat, fontSize = 11.sp) },
                colors = FilterChipDefaults.filterChipColors(
                  selectedContainerColor = PrimaryGreen,
                  selectedLabelColor = White
                )
              )
            }
          }

          // Bowling Style
          Text("गेंदबाजी शैली:", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MainText)
          LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            items(bowlingStyles) { bowl ->
              val isSel = selectedBowling == bowl
              FilterChip(
                selected = isSel,
                onClick = { selectedBowling = bowl },
                label = { Text(bowl, fontSize = 11.sp) },
                colors = FilterChipDefaults.filterChipColors(
                  selectedContainerColor = PrimaryGreen,
                  selectedLabelColor = White
                )
              )
            }
          }

          // 15-Day Availability & WhatsApp Checkboxes
          Row(verticalAlignment = Alignment.CenterVertically) {
            Checkbox(
              checked = isAvailable15Days,
              onCheckedChange = { isAvailable15Days = it },
              colors = CheckboxDefaults.colors(checkedColor = PrimaryGreen)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text("अगले 15 दिन मैच खेलने के लिए उपलब्ध हूँ", fontSize = 12.sp, color = MainText)
          }

          Row(verticalAlignment = Alignment.CenterVertically) {
            Checkbox(
              checked = allowWhatsapp,
              onCheckedChange = { allowWhatsapp = it },
              colors = CheckboxDefaults.colors(checkedColor = PrimaryGreen)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text("टीम चयन पर कप्तान को WhatsApp संपर्क की अनुमति दें", fontSize = 12.sp, color = MainText)
          }
        }
      }
    }

    // Submit Button
    item {
      Button(
        onClick = {
          errorMessage = null
          if (mobileNumber.length != 10) {
            errorMessage = "कृपया ठीक 10-अंकीय वैध मोबाइल नंबर दर्ज करें।"
            return@Button
          }
          if (pin.length != 6) {
            errorMessage = "पिन ठीक 6 अंकों का होना चाहिए।"
            return@Button
          }
          if (pin != confirmPin) {
            errorMessage = "दोनों पिन एक जैसे होने चाहिए।"
            return@Button
          }
          if (!isAgeVerified) {
            errorMessage = "कृपया 18+ आयु सत्यापन बॉक्स पर टिक करें।"
            return@Button
          }
          if (fullName.trim().length < 2) {
            errorMessage = "कृपया खिलाड़ी का पूरा नाम दर्ज करें।"
            return@Button
          }
          if (village.trim().isEmpty()) {
            errorMessage = "कृपया अपना गांव या कस्बा दर्ज करें।"
            return@Button
          }

          // Generate Recovery Code & Masked Mobile
          val chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
          val part1 = (1..4).map { chars.random() }.joinToString("")
          val part2 = (1..4).map { chars.random() }.joinToString("")
          val recCode = currentProfile?.recoveryCode ?: "$part1-$part2"

          val masked = if (mobileNumber.length == 10) {
            "${mobileNumber.take(2)}XXXXXX${mobileNumber.takeLast(2)}"
          } else "98XXXXXX21"

          val profile = RegisteredPlayer(
            fullName = fullName.trim(),
            mobile = mobileNumber.trim(),
            maskedMobile = masked,
            village = village.trim(),
            block = selectedBlock,
            role = selectedRole,
            battingStyle = selectedBatting,
            bowlingStyle = selectedBowling,
            recoveryCode = recCode,
            isAvailable = isAvailable15Days,
            allowWhatsapp = allowWhatsapp
          )

          generatedRecoveryCode = recCode
          onProfileSaved(profile)
          showSuccessDialog = true
        },
        colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth().height(48.dp)
      ) {
        Text("पंजीकरण पूरा करें (Register Profile)", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = White)
      }
      Spacer(modifier = Modifier.height(20.dp))
    }
  }
}

// =========================================================================
// 3. PLAYERS SCOUTING VIEW
// =========================================================================
@Composable
fun PlayersView(players: List<PlayerItem>) {
  val context = LocalContext.current
  var selectedRole by remember { mutableStateOf("सभी") }
  val roles = listOf("सभी", "बल्लेबाज", "गेंदबाज", "ऑल-राउंडर")

  val filtered = if (selectedRole == "सभी") players else players.filter { it.role == selectedRole }

  LazyColumn(
    modifier = Modifier.fillMaxSize().padding(12.dp),
    verticalArrangement = Arrangement.spacedBy(10.dp)
  ) {
    item {
      // Privacy Notice
      Card(
        colors = CardDefaults.cardColors(containerColor = Color(0xFFECFDF5)),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth().border(1.dp, Color(0xFF10B981), RoundedCornerShape(12.dp))
      ) {
        Row(modifier = Modifier.padding(10.dp), verticalAlignment = Alignment.Top) {
          Text("🔒", fontSize = 16.sp)
          Spacer(modifier = Modifier.width(8.dp))
          Text(
            "गोपनीयता सुरक्षा: खिलाड़ियों के मोबाइल नंबर कभी सार्वजनिक नहीं किए जाते (98XXXXXX21)। केवल आमंत्रण स्वीकार होने पर कप्तान से व्हाट्सएप लिंक जुड़ता है।",
            fontSize = 11.sp,
            color = Color(0xFF065F46),
            lineHeight = 16.sp
          )
        }
      }
    }

    item {
      LazyRow(
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        modifier = Modifier.fillMaxWidth()
      ) {
        items(roles) { role ->
          val isSelected = selectedRole == role
          FilterChip(
            selected = isSelected,
            onClick = { selectedRole = role },
            label = { Text(role, fontSize = 11.sp, fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal) },
            colors = FilterChipDefaults.filterChipColors(
              selectedContainerColor = PrimaryGreen,
              selectedLabelColor = White,
              containerColor = White,
              labelColor = MainText
            )
          )
        }
      }
    }

    items(filtered) { p ->
      Card(
        colors = CardDefaults.cardColors(containerColor = White),
        shape = RoundedCornerShape(14.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = Modifier.fillMaxWidth().border(1.dp, BorderColor, RoundedCornerShape(14.dp))
      ) {
        Column(modifier = Modifier.padding(12.dp)) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Box(
                modifier = Modifier
                  .size(36.dp)
                  .background(PrimaryGreen, CircleShape),
                contentAlignment = Alignment.Center
              ) {
                Text(p.name.take(1), fontWeight = FontWeight.Bold, color = White, fontSize = 15.sp)
              }
              Spacer(modifier = Modifier.width(10.dp))
              Column {
                Text(p.name, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = MainText)
                Text("ग्राम: ${p.village} (${p.block})", fontSize = 11.sp, color = MutedText)
              }
            }

            Surface(
              color = if (p.role == "ऑल-राउंडर") Color(0xFFFEF3C7) else Color(0xFFDCFCE7),
              shape = RoundedCornerShape(8.dp)
            ) {
              Text(
                p.role,
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                color = if (p.role == "ऑल-राउंडर") Color(0xFF92400E) else Color(0xFF166534),
                modifier = Modifier.padding(horizontal = 7.dp, vertical = 3.dp)
              )
            }
          }

          Spacer(modifier = Modifier.height(8.dp))
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
          ) {
            Text("🏏 ${p.batting}", fontSize = 11.sp, color = MainText)
            Text("🎯 ${p.bowling}", fontSize = 11.sp, color = MainText)
          }

          Spacer(modifier = Modifier.height(8.dp))
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Text("मोबाइल: ${p.maskedPhone}", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MutedText)
            Button(
              onClick = {
                Toast.makeText(context, "${p.name} को आमंत्रण भेजा गया! खिलाड़ी के स्वीकार करने पर WhatsApp चैट लिंक उपलब्ध होगा।", Toast.LENGTH_LONG).show()
              },
              colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
              shape = RoundedCornerShape(8.dp),
              contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
              modifier = Modifier.height(34.dp)
            ) {
              Text("+ टीम में आमंत्रित करें", fontSize = 11.sp, color = White)
            }
          }
        }
      }
    }
  }
}

// =========================================================================
// 4. MY SQUAD VIEW
// =========================================================================
@Composable
fun SquadView() {
  val context = LocalContext.current
  var teamName by remember { mutableStateOf("ज्ञानपुर लायंस") }
  var village by remember { mutableStateOf("खमरिया") }

  Column(
    modifier = Modifier.fillMaxSize().padding(14.dp),
    verticalArrangement = Arrangement.spacedBy(12.dp)
  ) {
    Card(
      colors = CardDefaults.cardColors(containerColor = White),
      shape = RoundedCornerShape(14.dp),
      elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
      modifier = Modifier.fillMaxWidth().border(1.dp, BorderColor, RoundedCornerShape(14.dp))
    ) {
      Column(modifier = Modifier.padding(14.dp)) {
        Text("🛡️ मेरी टीम (सक्रिय प्रतियोगिता: खमरिया कप)", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = MainText)
        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
          value = teamName,
          onValueChange = { teamName = it },
          label = { Text("टीम का नाम") },
          modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
          value = village,
          onValueChange = { village = it },
          label = { Text("गांव / नगर") },
          modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(12.dp))
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text("स्क्वाड क्षमता:", fontSize = 12.sp, color = MainText)
          Text("11 / 15 खिलाड़ी (स्वीकृत)", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = PrimaryGreen)
        }

        Spacer(modifier = Modifier.height(10.dp))
        Button(
          onClick = {
            Toast.makeText(context, "आयोजक को टूर्नामेंट आवेदन भेजा गया! स्थिति: PENDING", Toast.LENGTH_LONG).show()
          },
          colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
          shape = RoundedCornerShape(10.dp),
          modifier = Modifier.fillMaxWidth().height(42.dp)
        ) {
          Text("टूर्नामेंट में आवेदन भेजें (Submit Application)", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = White)
        }
      }
    }
  }
}

// =========================================================================
// 5. RULES & NOTICE VIEW
// =========================================================================
@Composable
fun RulesView() {
  LazyColumn(
    modifier = Modifier.fillMaxSize().padding(14.dp),
    verticalArrangement = Arrangement.spacedBy(10.dp)
  ) {
    item {
      Card(
        colors = CardDefaults.cardColors(containerColor = DeepForest),
        shape = RoundedCornerShape(14.dp),
        modifier = Modifier.fillMaxWidth()
      ) {
        Column(modifier = Modifier.padding(14.dp)) {
          Text("📜 भदोही ग्रामीण क्रिकेट - कड़े नियम", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = AmberHighlight)
          Spacer(modifier = Modifier.height(6.dp))
          Text("यह प्लेटफ़ॉर्म केवल प्रतियोगिता समन्वय के लिए है। किसी भी प्रकार के ऑनलाइन विवादों और वित्तीय धोखाधड़ी से मुक्त।", fontSize = 12.sp, color = White.copy(alpha = 0.9f))
        }
      }
    }

    val invariants = listOf(
      "शून्य ऑनलाइन भुगतान: कोई UPI, वॉलेट या ऑनलाइन धन स्वीकार नहीं किया जाता।" to "💵",
      "शून्य लाइव स्कोरिंग: गेंद-दर-गेंद स्कोरिंग नहीं होती। स्कोरिंग मैदान पर भौतिक रूप से होगी।" to "🏏",
      "शून्य व्यक्तिगत आंकड़े / रैंकिंग: कोई रन, विकेट या स्ट्राइक रेट रैंकिंग नहीं रखी जाती।" to "🚫",
      "100% मोबाइल नंबर गोपनीयता: फोन नंबर केवल लॉगिन के लिए है, कभी सार्वजनिक नहीं होता।" to "🔒",
      "केवल 18+ वयस्क: 18 वर्ष से कम आयु का पंजीकरण प्रतिबंधित है।" to "🔞",
      "शून्य SMS OTP: 6-अंकीय पिन और भौतिक रिकवरी पर्ची से खाता सुरक्षित रहता है।" to "🔑"
    )

    items(invariants) { (rule, icon) ->
      Card(
        colors = CardDefaults.cardColors(containerColor = White),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth().border(1.dp, BorderColor, RoundedCornerShape(12.dp))
      ) {
        Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
          Text(icon, fontSize = 22.sp)
          Spacer(modifier = Modifier.width(12.dp))
          Text(rule, fontSize = 12.sp, color = MainText, lineHeight = 17.sp)
        }
      }
    }
  }
}
