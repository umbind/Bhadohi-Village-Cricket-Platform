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
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
  onItemClick: (NavKey) -> Unit,
  modifier: Modifier = Modifier
) {
  var selectedTab by remember { mutableStateOf(0) }
  val context = LocalContext.current

  val tabs = listOf("टूर्नामेंट्स", "खिलाड़ी खोज", "मेरा स्क्वाड", "नियम व सुरक्षा")

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
                  1 -> "👥"
                  2 -> "🛡️"
                  else -> "📜"
                },
                fontSize = 18.sp
              )
            },
            label = {
              Text(
                label,
                fontSize = 10.sp,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                color = if (isSelected) AmberHighlight else White.copy(alpha = 0.7f)
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
        0 -> TournamentsView()
        1 -> PlayersView()
        2 -> SquadView()
        3 -> RulesView()
      }
    }
  }
}

@Composable
fun TournamentsView() {
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

@Composable
fun PlayersView() {
  val context = LocalContext.current
  var selectedRole by remember { mutableStateOf("सभी") }
  val roles = listOf("सभी", "बल्लेबाज", "गेंदबाज", "ऑल-राउंडर")

  val samplePlayers = listOf(
    PlayerItem("1", "अमित सिंह", "खमरिया", "ज्ञानपुर", "ऑल-राउंडर", "98XXXXXX21", "दाएं हाथ", "दाएं हाथ मध्यम गति"),
    PlayerItem("2", "रोहित बिन्द", "गोपीगंज", "ज्ञानपुर", "बल्लेबाज", "98XXXXXX22", "बाएं हाथ", "ऑफ स्पिन"),
    PlayerItem("3", "दीपक यादव", "औराई खास", "औराई", "गेंदबाज", "98XXXXXX23", "दाएं हाथ", "तेज गेंदबाज"),
    PlayerItem("4", "सुरेश पाल", "बाबूसराय", "औराई", "ऑल-राउंडर", "98XXXXXX24", "दाएं हाथ", "मध्यम तेज"),
    PlayerItem("5", "विकास मौर्य", "सुरियावां स्टेशन", "सुरियावां", "बल्लेबाज", "98XXXXXX25", "दाएं हाथ", "लेग स्पिन"),
    PlayerItem("6", "पंकज तिवारी", "मिश्राइनपुर", "डीघ", "गेंदबाज", "98XXXXXX26", "बाएं हाथ", "बाएं हाथ तेज")
  )

  val filtered = if (selectedRole == "सभी") samplePlayers else samplePlayers.filter { it.role == selectedRole }

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
