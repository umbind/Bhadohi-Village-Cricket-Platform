package org.bvcp.bhadohi_cricket.ui.main

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.foundation.BorderStroke
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
import org.bvcp.bhadohi_cricket.data.*
import org.bvcp.bhadohi_cricket.theme.*

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

  // 1. Load persistent user profile
  var registeredProfile by remember {
    mutableStateOf(LocalDataManager.loadProfile(context))
  }

  // 2. Load persistent tournaments
  val initialTournaments = remember {
    val loaded = LocalDataManager.loadTournaments(context)
    if (loaded.isNotEmpty()) loaded else {
      val defaultList = listOf(
        StoredTournament(
          id = "1",
          title = "खमरिया ग्रामीण क्रिकेट कप 2026",
          organizerName = "खमरिया युवा स्पोर्ट्स क्लब (श्री संतोष सिंह)",
          block = "ज्ञानपुर",
          ground = "खमरिया इंटर कॉलेज मैदान",
          dates = "15 से 20 नवंबर 2026",
          maxTeams = 16,
          entryNotice = "₹500 प्रति टीम - केवल मैदान पर नकद",
          status = "पंजीकरण खुला",
          ballType = "टेनिस बॉल (भारी)",
          overs = 12,
          organizerContact = "98XXXXXX21"
        ),
        StoredTournament(
          id = "2",
          title = "औराई नगर पंचायत प्रीमियर लीग",
          organizerName = "औराई क्रिकेट एसोसिएशन (विकास यादव)",
          block = "औराई",
          ground = "औराई नगर पंचायत मैदान",
          dates = "18 से 24 नवंबर 2026",
          maxTeams = 8,
          entryNotice = "₹400 प्रति टीम - केवल मैदान पर नकद",
          status = "पंजीकरण खुला",
          ballType = "कॉस्को बॉल (हल्की)",
          overs = 10,
          organizerContact = "98XXXXXX22"
        ),
        StoredTournament(
          id = "3",
          title = "सुरियावां ग्रामीण नॉकआउट कप",
          organizerName = "सुरियावां ग्राम विकास समिति (मुकेश बिन्द)",
          block = "सुरियावां",
          ground = "सुरियावां स्टेशन रोड मैदान",
          dates = "22 से 27 नवंबर 2026",
          maxTeams = 8,
          entryNotice = "₹350 प्रति टीम - केवल मैदान पर नकद",
          status = "पंजीकरण खुला",
          ballType = "लेदर बॉल (चमड़ा)",
          overs = 12,
          organizerContact = "98XXXXXX23"
        )
      )
      LocalDataManager.saveTournaments(context, defaultList)
      defaultList
    }
  }
  val tournamentsList = remember { mutableStateListOf<StoredTournament>().apply { addAll(initialTournaments) } }

  // 3. Load persistent teams
  val initialTeams = remember {
    val loaded = LocalDataManager.loadTeams(context)
    if (loaded.isNotEmpty()) loaded else {
      val defaultTeams = listOf(
        StoredTeam(
          id = "team-1",
          teamName = "खमरिया टाइटन्स",
          tournamentId = "1",
          tournamentTitle = "खमरिया ग्रामीण क्रिकेट कप 2026",
          village = "खमरिया",
          block = "ज्ञानपुर",
          captainName = "अमित सिंह",
          status = "स्वीकृत (ACCEPTED)",
          members = listOf(
            StoredSquadMember("m1", "अमित सिंह", "कप्तान", "खमरिया", "98XXXXXX21"),
            StoredSquadMember("m2", "रोहित बिन्द", "बल्लेबाज", "गोपीगंज", "98XXXXXX22"),
            StoredSquadMember("m3", "विकास यादव", "ऑल-राउंडर", "खमरिया खास", "98XXXXXX23"),
            StoredSquadMember("m4", "संजय पाल", "गेंदबाज", "ज्ञानपुर रोड", "98XXXXXX24"),
            StoredSquadMember("m5", "अखिलेश मौर्य", "बल्लेबाज", "चकवा", "98XXXXXX25"),
            StoredSquadMember("m6", "अनिल तिवारी", "गेंदबाज", "काशीपुर", "98XXXXXX26"),
            StoredSquadMember("m7", "प्रदीप सरोज", "ऑल-राउंडर", "खमरिया", "98XXXXXX27"),
            StoredSquadMember("m8", "सूरज गुप्ता", "बल्लेबाज", "गोपीगंज", "98XXXXXX28"),
            StoredSquadMember("m9", "मुकेश बिन्द", "गेंदबाज", "रामपुर", "98XXXXXX29"),
            StoredSquadMember("m10", "धर्मेन्द्र सिंह", "बल्लेबाज", "ज्ञानपुर", "98XXXXXX30"),
            StoredSquadMember("m11", "संदीप दुबे", "गेंदबाज", "खमरिया", "98XXXXXX31")
          )
        ),
        StoredTeam(
          id = "team-2",
          teamName = "औराई वॉरियर्स",
          tournamentId = "2",
          tournamentTitle = "औराई नगर पंचायत प्रीमियर लीग",
          village = "औराई खास",
          block = "औराई",
          captainName = "दीपक यादव",
          status = "गठन जारी (FORMING)",
          members = listOf(
            StoredSquadMember("m21", "दीपक यादव", "कप्तान", "औराई खास", "98XXXXXX23"),
            StoredSquadMember("m22", "सुरेश पाल", "ऑल-राउंडर", "बाबूसराय", "98XXXXXX24"),
            StoredSquadMember("m23", "विनोद मौर्य", "बल्लेबाज", "घोसी", "98XXXXXX32"),
            StoredSquadMember("m24", "अशोक सिंह", "गेंदबाज", "औराई", "98XXXXXX33"),
            StoredSquadMember("m25", "कमलेश बिन्द", "बल्लेबाज", "खमरिया", "98XXXXXX34")
          )
        )
      )
      LocalDataManager.saveTeams(context, defaultTeams)
      defaultTeams
    }
  }
  val myTeamsList = remember { mutableStateListOf<StoredTeam>().apply { addAll(initialTeams) } }

  // 4. Load persistent invitations
  val initialInvitations = remember {
    val loaded = LocalDataManager.loadInvitations(context)
    if (loaded.isNotEmpty()) loaded else {
      val defaultInvites = listOf(
        StoredInvitation(
          id = "inv-1",
          teamName = "खमरिया टाइटन्स",
          captainName = "अमित सिंह",
          tournamentTitle = "खमरिया ग्रामीण क्रिकेट कप 2026",
          ground = "खमरिया इंटर कॉलेज मैदान",
          roleOffered = "ऑल-राउंडर",
          status = "PENDING"
        )
      )
      LocalDataManager.saveInvitations(context, defaultInvites)
      defaultInvites
    }
  }
  val invitationsList = remember { mutableStateListOf<StoredInvitation>().apply { addAll(initialInvitations) } }

  // 5. Pre-seeded player scout directory
  val playersList = remember {
    mutableStateListOf(
      PlayerItem("1", "अमित सिंह", "खमरिया", "ज्ञानपुर", "ऑल-राउंडर", "98XXXXXX21", "दाएं हाथ", "दाएं हाथ मध्यम गति"),
      PlayerItem("2", "रोहित बिन्द", "गोपीगंज", "ज्ञानपुर", "बल्लेबाज", "98XXXXXX22", "बाएं हाथ", "ऑफ स्पिन"),
      PlayerItem("3", "दीपक यादव", "औराई खास", "औराई", "गेंदबाज", "98XXXXXX23", "दाएं हाथ", "तेज गेंदबाज"),
      PlayerItem("4", "सुरेश पाल", "बाबूसराय", "औराई", "ऑल-राउंडर", "98XXXXXX24", "दाएं हाथ", "मध्यम तेज"),
      PlayerItem("5", "विकास मौर्य", "सुरियावां स्टेशन", "सुरियावां", "बल्लेबाज", "98XXXXXX25", "दाएं हाथ", "लेग स्पिन"),
      PlayerItem("6", "पंकज तिवारी", "मिश्राइनपुर", "डीघ", "गेंदबाज", "98XXXXXX26", "बाएं हाथ", "बाएं हाथ तेज"),
      PlayerItem("7", "राहुल बिन्द", "कोइरौना", "डीघ", "ऑल-राउंडर", "98XXXXXX27", "दाएं हाथ", "लेग कटर"),
      PlayerItem("8", "सत्यम दुबे", "अभोली", "अभोली", "विकेट-कीपर", "98XXXXXX28", "दाएं हाथ", "विकेट-कीपर")
    )
  }

  // Pre-selected tournament when creating a team from Tournament view
  var preselectedTournamentId by remember { mutableStateOf<String?>(null) }
  var triggerCreateTeamDialog by remember { mutableStateOf(false) }
  var showLegalDialog by remember { mutableStateOf(false) }

  val tabs = listOf("होम", "मेरी टीमें", "खिलाड़ी पंजीकरण", "खिलाड़ी खोज", "नियम व अस्वीकरण")

  Scaffold(
    topBar = {
      TopAppBar(
        navigationIcon = {
          if (selectedTab != 0) {
            IconButton(onClick = { selectedTab = 0 }) {
              Text("←", fontSize = 22.sp, color = White, fontWeight = FontWeight.Bold)
            }
          }
        },
        title = {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.clickable { selectedTab = 0 }
          ) {
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
        actions = {
          // Dedicated Legal Disclaimers Button in Top Bar
          Surface(
            color = Color(0xFF1E3A8A).copy(alpha = 0.85f),
            shape = RoundedCornerShape(8.dp),
            modifier = Modifier
              .padding(end = 6.dp)
              .clickable { showLegalDialog = true }
          ) {
            Row(
              modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp),
              verticalAlignment = Alignment.CenterVertically
            ) {
              Text("⚖️", fontSize = 12.sp)
              Spacer(modifier = Modifier.width(3.dp))
              Text(
                "अस्वीकरण",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = White
              )
            }
          }

          // Dedicated Home Button in Top Bar
          Surface(
            color = if (selectedTab == 0) AmberHighlight else PrimaryGreen,
            shape = RoundedCornerShape(8.dp),
            modifier = Modifier
              .padding(end = 12.dp)
              .clickable { selectedTab = 0 }
          ) {
            Row(
              modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
              verticalAlignment = Alignment.CenterVertically
            ) {
              Text("🏠", fontSize = 14.sp)
              Spacer(modifier = Modifier.width(4.dp))
              Text(
                "होम",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = if (selectedTab == 0) DeepForest else White
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
                  0 -> "🏠" // Home icon
                  1 -> "🛡️"
                  2 -> "👤"
                  3 -> "👥"
                  else -> "⚖️"
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
    if (showLegalDialog) {
      LegalDisclaimersDialog(onDismiss = { showLegalDialog = false })
    }

    Box(
      modifier = Modifier
        .fillMaxSize()
        .padding(padding)
        .background(CreamBackground)
    ) {
      when (selectedTab) {
        0 -> TournamentsView(
          tournaments = tournamentsList,
          onNavigateToRegister = { selectedTab = 2 },
          onNavigateToRules = { selectedTab = 4 },
          onCreateTeamForTournament = { tourId ->
            preselectedTournamentId = tourId
            triggerCreateTeamDialog = true
            selectedTab = 1
          },
          onTournamentAdded = { newTour ->
            tournamentsList.add(0, newTour)
            LocalDataManager.saveTournaments(context, tournamentsList)
            Toast.makeText(context, "नया टूर्नामेंट सफलतापूर्वक प्रकाशित किया गया!", Toast.LENGTH_SHORT).show()
          }
        )
        1 -> MultiTeamManagementView(
          teams = myTeamsList,
          tournaments = tournamentsList,
          players = playersList,
          registeredProfile = registeredProfile,
          initialOpenCreateDialog = triggerCreateTeamDialog,
          preselectedTournamentId = preselectedTournamentId,
          onDialogOpened = { triggerCreateTeamDialog = false },
          onTeamCreated = { newTeam ->
            myTeamsList.add(0, newTeam)
            LocalDataManager.saveTeams(context, myTeamsList)
          },
          onTeamsUpdated = {
            LocalDataManager.saveTeams(context, myTeamsList)
          }
        )
        2 -> PlayerRegistrationAndProfileView(
          currentProfile = registeredProfile,
          invitations = invitationsList,
          onProfileSaved = { newProfile ->
            registeredProfile = newProfile
            LocalDataManager.saveProfile(context, newProfile)

            // Update or insert into players directory
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
          },
          onProfileCleared = {
            registeredProfile = null
            LocalDataManager.clearProfile(context)
          },
          onInvitationAction = { inviteId, isAccepted ->
            val idx = invitationsList.indexOfFirst { it.id == inviteId }
            if (idx >= 0) {
              val current = invitationsList[idx]
              if (isAccepted) {
                invitationsList[idx] = current.copy(status = "ACCEPTED")
                Toast.makeText(context, "${current.teamName} का आमंत्रण स्वीकार किया गया! आप टीम में शामिल हो गए हैं।", Toast.LENGTH_LONG).show()
              } else {
                invitationsList.removeAt(idx)
                Toast.makeText(context, "आमंत्रण अस्वीकार किया गया।", Toast.LENGTH_SHORT).show()
              }
              LocalDataManager.saveInvitations(context, invitationsList)
            }
          }
        )
        3 -> PlayersView(
          players = playersList,
          onInvitePlayer = { player ->
            val newInv = StoredInvitation(
              id = "inv-${System.currentTimeMillis()}",
              teamName = if (myTeamsList.isNotEmpty()) myTeamsList[0].teamName else "मेरी टीम",
              captainName = registeredProfile?.fullName ?: "टीम संचालक",
              tournamentTitle = if (myTeamsList.isNotEmpty()) myTeamsList[0].tournamentTitle else "भदोही ग्रामीण कप",
              ground = "स्थानीय मैदान",
              roleOffered = player.role,
              status = "PENDING"
            )
            invitationsList.add(0, newInv)
            LocalDataManager.saveInvitations(context, invitationsList)
            Toast.makeText(context, "${player.name} को आमंत्रण भेजा गया!", Toast.LENGTH_LONG).show()
          }
        )
        4 -> RulesView()
      }
    }
  }
}

// =========================================================================
// 1. TOURNAMENTS & MATCH SCHEDULE VIEW
// =========================================================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TournamentsView(
  tournaments: List<StoredTournament>,
  onNavigateToRegister: () -> Unit,
  onNavigateToRules: () -> Unit = {},
  onCreateTeamForTournament: (String) -> Unit,
  onTournamentAdded: (StoredTournament) -> Unit
) {
  val context = LocalContext.current
  var subTab by remember { mutableStateOf(0) } // 0: टूर्नामेंट्स, 1: मैच शेड्यूल
  var selectedBlock by remember { mutableStateOf("सभी") }
  val blocks = listOf("सभी", "ज्ञानपुर", "औराई", "भदोही", "सुरियावां", "डीघ", "अभोली")

  var showCreateTournamentDialog by remember { mutableStateOf(false) }

  // Create Tournament Form State
  var newTitle by remember { mutableStateOf("") }
  var newOrganizerName by remember { mutableStateOf("") }
  var newBlock by remember { mutableStateOf("ज्ञानपुर") }
  var newGround by remember { mutableStateOf("") }
  var newDates by remember { mutableStateOf("") }
  val ballTypes = listOf("टेनिस बॉल (भारी)", "कॉस्को बॉल (हल्की)", "लेदर बॉल (चमड़ा)", "टेप / विंडर बॉल")
  var newBallType by remember { mutableStateOf(ballTypes[0]) }
  var newOvers by remember { mutableStateOf("12") }
  var newMaxTeams by remember { mutableStateOf("16") }
  var newEntryFee by remember { mutableStateOf("₹500 प्रति टीम - केवल मैदान पर नकद") }
  var tourFormError by remember { mutableStateOf<String?>(null) }

  // Sample match fixtures for Bhadohi
  val matchFixtures = remember {
    listOf(
      StoredMatchFixture(
        id = "f-1",
        tournamentTitle = "खमरिया ग्रामीण क्रिकेट कप 2026",
        matchRound = "लीग मैच (पूल A)",
        team1 = "खमरिया टाइटन्स",
        team2 = "औराई वॉरियर्स",
        date = "16 नवंबर 2026",
        time = "सुबह 09:30 AM",
        ground = "खमरिया इंटर कॉलेज मैदान",
        groundLandmark = "निकट खमरिया डाकघर, ज्ञानपुर रोड",
        overs = "12 ओवर्स",
        ballType = "टेनिस बॉल",
        pitchStatus = "☀️ पिच सूखी और तैयार है • टॉस ठीक 09:15 बजे होगा"
      ),
      StoredMatchFixture(
        id = "f-2",
        tournamentTitle = "सुरियावां ग्रामीण नॉकआउट कप",
        matchRound = "पहला राउंड नॉकआउट",
        team1 = "सुरियावां सुपर किंग्स",
        team2 = "गोपीगंज स्ट्राइकर्स",
        date = "22 नवंबर 2026",
        time = "दोपहर 01:30 PM",
        ground = "सुरियावां स्टेशन रोड मैदान",
        groundLandmark = "रेलवे स्टेशन के पास, सुरियावां",
        overs = "10 ओवर्स",
        ballType = "टेनिस बॉल",
        pitchStatus = "⛅ मौसम साफ रहने का अनुमान है • टीमें समय पर पहुंचें"
      ),
      StoredMatchFixture(
        id = "f-3",
        tournamentTitle = "औराई नगर पंचायत प्रीमियर लीग",
        matchRound = "क्वार्टर फाइनल",
        team1 = "बाबूसराय स्टार्स",
        team2 = "डीघ पैंथर्स",
        date = "24 नवंबर 2026",
        time = "सुबह 10:00 AM",
        ground = "औराई नगर पंचायत मैदान",
        groundLandmark = "राष्ट्रीय राजमार्ग के पास, औराई",
        overs = "12 ओवर्स",
        ballType = "टेनिस बॉल",
        pitchStatus = "☀️ सुबह की हल्की धूप • ग्राउंड पर पानी की व्यवस्था उपलब्ध"
      )
    )
  }

  val filteredTournaments = if (selectedBlock == "सभी") tournaments else tournaments.filter { it.block == selectedBlock }

  // DIALOG: CREATE NEW TOURNAMENT (Organizer Self-Service)
  if (showCreateTournamentDialog) {
    AlertDialog(
      onDismissRequest = { showCreateTournamentDialog = false },
      title = {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Text("🏆", fontSize = 20.sp)
          Spacer(modifier = Modifier.width(8.dp))
          Text("नया टूर्नामेंट आयोजित करें", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = DeepForest)
        }
      },
      text = {
        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
          item {
            Text("प्रतियोगिता विवरण भरें (आयोजक):", fontSize = 11.sp, color = MutedText)
          }
          if (tourFormError != null) {
            item {
              Surface(color = Color(0xFFFEE2E2), shape = RoundedCornerShape(6.dp)) {
                Text(tourFormError!!, color = Color(0xFFB91C1C), fontSize = 11.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(8.dp))
              }
            }
          }
          item {
            OutlinedTextField(
              value = newTitle,
              onValueChange = { newTitle = it },
              label = { Text("प्रतियोगिता का नाम") },
              placeholder = { Text("उदा. गोपीगंज विलेज कप") },
              modifier = Modifier.fillMaxWidth(),
              singleLine = true
            )
          }
          item {
            OutlinedTextField(
              value = newOrganizerName,
              onValueChange = { newOrganizerName = it },
              label = { Text("आयोजक व्यक्ति या क्लब का नाम") },
              placeholder = { Text("उदा. खमरिया युवा स्पोर्ट्स क्लब / राहुल बिन्द") },
              modifier = Modifier.fillMaxWidth(),
              singleLine = true
            )
          }
          item {
            Text("ब्लॉक का चयन:", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MainText)
            LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
              items(blocks.filter { it != "सभी" }) { b ->
                val isSel = newBlock == b
                FilterChip(
                  selected = isSel,
                  onClick = { newBlock = b },
                  label = { Text(b, fontSize = 11.sp) },
                  colors = FilterChipDefaults.filterChipColors(selectedContainerColor = PrimaryGreen, selectedLabelColor = White)
                )
              }
            }
          }
          item {
            OutlinedTextField(
              value = newGround,
              onValueChange = { newGround = it },
              label = { Text("मैदान का नाम व लैंडमार्क") },
              placeholder = { Text("उदा. जूनियर हाईस्कूल मैदान, गोपीगंज") },
              modifier = Modifier.fillMaxWidth(),
              singleLine = true
            )
          }
          item {
            OutlinedTextField(
              value = newDates,
              onValueChange = { newDates = it },
              label = { Text("मैच की तारीखें") },
              placeholder = { Text("उदा. 25 से 30 नवंबर 2026") },
              modifier = Modifier.fillMaxWidth(),
              singleLine = true
            )
          }
          item {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
              OutlinedTextField(
                value = newOvers,
                onValueChange = { if (it.all { c -> c.isDigit() }) newOvers = it },
                label = { Text("ओवर्स") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                modifier = Modifier.weight(1f),
                singleLine = true
              )
              OutlinedTextField(
                value = newMaxTeams,
                onValueChange = { if (it.all { c -> c.isDigit() }) newMaxTeams = it },
                label = { Text("कुल टीमें") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                modifier = Modifier.weight(1f),
                singleLine = true
              )
            }
          }
          item {
            Text("⚾ गेंद का प्रकार (Ball Type):", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MainText)
            LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
              items(ballTypes) { ball ->
                val isSel = newBallType == ball
                FilterChip(
                  selected = isSel,
                  onClick = { newBallType = ball },
                  label = { Text(ball, fontSize = 10.sp) },
                  colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = PrimaryGreen,
                    selectedLabelColor = White,
                    containerColor = CreamBackground,
                    labelColor = MainText
                  )
                )
              }
            }
          }
          item {
            OutlinedTextField(
              value = newEntryFee,
              onValueChange = { newEntryFee = it },
              label = { Text("प्रवेश शुल्क (मैदान पर नकद)") },
              modifier = Modifier.fillMaxWidth(),
              singleLine = true
            )
          }
          item {
            Surface(color = Color(0xFFFEF3C7), shape = RoundedCornerShape(8.dp)) {
              Text(
                "⚠️ विधिक अस्वीकरण: कोई ऑनलाइन भुगतान नहीं। सट्टेबाजी या जुआ सख्त वर्जित है। शारीरिक चोट (Volenti Non Fit Injuria) व नकद लेन-देन के लिए आयोजक व टीमें स्वयं जिम्मेदार हैं। ऐप की कोई विधिक जवाबदेही नहीं है।",
                fontSize = 10.sp,
                color = Color(0xFF92400E),
                modifier = Modifier.padding(8.dp),
                lineHeight = 14.sp
              )
            }
          }
        }
      },
      confirmButton = {
        Button(
          onClick = {
            tourFormError = null
            if (newTitle.trim().length < 3) {
              tourFormError = "कृपया प्रतियोगिता का सही नाम दर्ज करें।"
              return@Button
            }
            if (newOrganizerName.trim().length < 3) {
              tourFormError = "कृपया आयोजक व्यक्ति या क्लब का नाम दर्ज करें।"
              return@Button
            }
            if (newGround.trim().length < 3) {
              tourFormError = "कृपया खेल मैदान का नाम दर्ज करें।"
              return@Button
            }
            if (newDates.trim().length < 3) {
              tourFormError = "कृपया मैच की तारीखें दर्ज करें।"
              return@Button
            }
            val ov = newOvers.toIntOrNull() ?: 12
            val maxT = newMaxTeams.toIntOrNull() ?: 16

            val created = StoredTournament(
              id = "tour-${System.currentTimeMillis()}",
              title = newTitle.trim(),
              organizerName = newOrganizerName.trim(),
              block = newBlock,
              ground = newGround.trim(),
              dates = newDates.trim(),
              maxTeams = maxT,
              entryNotice = newEntryFee.trim(),
              status = "पंजीकरण खुला",
              ballType = newBallType,
              overs = ov,
              organizerContact = "98XXXXXX21"
            )
            onTournamentAdded(created)
            showCreateTournamentDialog = false
            newTitle = ""
            newOrganizerName = ""
            newGround = ""
            newDates = ""
            newBallType = ballTypes[0]
          },
          colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)
        ) {
          Text("टूर्नामेंट प्रकाशित करें", color = White, fontWeight = FontWeight.Bold)
        }
      },
      dismissButton = {
        TextButton(onClick = { showCreateTournamentDialog = false }) {
          Text("रद्द करें", color = MainText)
        }
      }
    )
  }

  LazyColumn(
    modifier = Modifier.fillMaxSize().padding(12.dp),
    verticalArrangement = Arrangement.spacedBy(10.dp)
  ) {
    // Sub-segment toggle (टूर्नामेंट्स vs मैच शेड्यूल)
    item {
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .background(White, RoundedCornerShape(12.dp))
          .padding(4.dp)
          .border(1.dp, BorderColor, RoundedCornerShape(12.dp)),
        horizontalArrangement = Arrangement.SpaceEvenly
      ) {
        Surface(
          color = if (subTab == 0) PrimaryGreen else Color.Transparent,
          shape = RoundedCornerShape(8.dp),
          modifier = Modifier
            .weight(1f)
            .clickable { subTab = 0 }
        ) {
          Box(contentAlignment = Alignment.Center, modifier = Modifier.padding(vertical = 8.dp)) {
            Text(
              "🏆 प्रतियोगिताएं (${filteredTournaments.size})",
              fontSize = 12.sp,
              fontWeight = FontWeight.Bold,
              color = if (subTab == 0) White else MainText
            )
          }
        }
        Surface(
          color = if (subTab == 1) PrimaryGreen else Color.Transparent,
          shape = RoundedCornerShape(8.dp),
          modifier = Modifier
            .weight(1f)
            .clickable { subTab = 1 }
        ) {
          Box(contentAlignment = Alignment.Center, modifier = Modifier.padding(vertical = 8.dp)) {
            Text(
              "📅 मैच शेड्यूल व मैदान (${matchFixtures.size})",
              fontSize = 12.sp,
              fontWeight = FontWeight.Bold,
              color = if (subTab == 1) White else MainText
            )
          }
        }
      }
    }

    if (subTab == 0) {
      // -------------------------------------------------------------
      // SUB-TAB 0: TOURNAMENTS
      // -------------------------------------------------------------
      item {
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
        // Organizer Action Bar
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text("प्रतियोगिताएं खोजें", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = MainText)
          Button(
            onClick = { showCreateTournamentDialog = true },
            colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
            shape = RoundedCornerShape(8.dp),
            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
          ) {
            Text("+ नया टूर्नामेंट आयोजित करें", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = White)
          }
        }
      }

      item {
        // Zero Payment Policy Alert
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

      items(filteredTournaments) { tour ->
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
              Row(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
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
                  color = Color(0xFFEFF6FF),
                  shape = RoundedCornerShape(6.dp)
                ) {
                  Text(
                    "⚾ ${tour.ballType}",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF1D4ED8),
                    modifier = Modifier.padding(horizontal = 7.dp, vertical = 3.dp)
                  )
                }
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

            Spacer(modifier = Modifier.height(4.dp))
            Surface(
              color = Color(0xFFFEF3C7),
              shape = RoundedCornerShape(6.dp)
            ) {
              Row(
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                verticalAlignment = Alignment.CenterVertically
              ) {
                Text("👑", fontSize = 11.sp)
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                  "आयोजक: ${tour.organizerName}",
                  fontSize = 11.sp,
                  fontWeight = FontWeight.Bold,
                  color = Color(0xFF92400E)
                )
              }
            }

            Spacer(modifier = Modifier.height(6.dp))
            Column(
              modifier = Modifier
                .fillMaxWidth()
                .background(CreamBackground, RoundedCornerShape(8.dp))
                .padding(8.dp),
              verticalArrangement = Arrangement.spacedBy(3.dp)
            ) {
              Text("👑 आयोजक / क्लब: ${tour.organizerName}", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = DeepForest)
              Text("🏟️ मैदान: ${tour.ground}", fontSize = 11.sp, color = MainText)
              Text("⚾ गेंद (Ball): ${tour.ballType}", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1D4ED8))
              Text("🏏 फॉर्मेट: ${tour.overs} ओवर्स", fontSize = 11.sp, color = MainText)
              Text("👥 टीम सीमा: ${tour.maxTeams} टीमें", fontSize = 11.sp, color = MainText)
              Text("💵 शुल्क सूचना: ${tour.entryNotice}", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFFB45309))
              Text("📅 अवधि: ${tour.dates}", fontSize = 11.sp, color = MutedText)
            }

            Spacer(modifier = Modifier.height(10.dp))
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
              // Button 1: Create Team
              Button(
                onClick = { onCreateTeamForTournament(tour.id) },
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.weight(1f).height(42.dp)
              ) {
                Text("🛡️ टीम बनाएं", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = White)
              }

              // Button 2: Google Maps Ground Navigation Intent
              OutlinedButton(
                onClick = {
                  try {
                    val mapUri = Uri.parse("geo:0,0?q=" + Uri.encode("${tour.ground}, Bhadohi, Uttar Pradesh"))
                    val mapIntent = Intent(Intent.ACTION_VIEW, mapUri)
                    context.startActivity(mapIntent)
                  } catch (_: Exception) {
                    Toast.makeText(context, "मैदान: ${tour.ground}, ब्लॉक: ${tour.block}", Toast.LENGTH_SHORT).show()
                  }
                },
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.height(42.dp)
              ) {
                Text("🗺️ रास्ता", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = DeepForest)
              }

              // Button 3: WhatsApp Share
              OutlinedButton(
                onClick = {
                  val shareIntent = Intent(Intent.ACTION_SEND).apply {
                    type = "text/plain"
                    putExtra(Intent.EXTRA_TEXT, "🏏 *${tour.title}*\n👑 आयोजक: ${tour.organizerName}\n⚾ गेंद (Ball): ${tour.ballType}\n🏟️ स्थान: ${tour.ground}\n📍 ब्लॉक: ${tour.block}\n🏏 प्रारूप: ${tour.overs} ओवर्स\n💵 शुल्क: ${tour.entryNotice}\n\nभदोही ग्रामीण क्रिकेट प्लेटफ़ॉर्म पर देखें!")
                  }
                  context.startActivity(Intent.createChooser(shareIntent, "WhatsApp पर साझा करें"))
                },
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.height(42.dp)
              ) {
                Text("📲 शेयर", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = PrimaryGreen)
              }
            }
          }
        }
      }
    } else {
      // -------------------------------------------------------------
      // SUB-TAB 1: MATCH SCHEDULES & GROUND FIXTURES
      // -------------------------------------------------------------
      item {
        Card(
          colors = CardDefaults.cardColors(containerColor = Color(0xFFEFF6FF)),
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier.fillMaxWidth().border(1.dp, Color(0xFF3B82F6), RoundedCornerShape(12.dp))
        ) {
          Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.Top) {
            Text("📢", fontSize = 18.sp)
            Spacer(modifier = Modifier.width(8.dp))
            Column {
              Text("मैच समय एवं मैदान दिशा-निर्देश", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = Color(0xFF1E40AF))
              Text("सभी टीमें टॉस के समय से 30 मिनट पहले मैदान पर उपस्थिति सुनिश्चित करें। मैच में देरी पर ओवर कम किए जा सकते हैं।", fontSize = 11.sp, color = Color(0xFF1E3A8A), lineHeight = 16.sp)
            }
          }
        }
      }

      items(matchFixtures) { fixture ->
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
                color = AmberHighlight.copy(alpha = 0.2f),
                shape = RoundedCornerShape(6.dp)
              ) {
                Text(
                  fixture.matchRound,
                  fontSize = 11.sp,
                  fontWeight = FontWeight.Bold,
                  color = Color(0xFFB45309),
                  modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                )
              }
              Text("${fixture.date} • ${fixture.time}", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = PrimaryGreen)
            }

            Spacer(modifier = Modifier.height(10.dp))
            // Match Teams Clash Card
            Row(
              modifier = Modifier
                .fillMaxWidth()
                .background(CreamBackground, RoundedCornerShape(10.dp))
                .padding(12.dp),
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.SpaceBetween
            ) {
              Column(modifier = Modifier.weight(1f), horizontalAlignment = Alignment.CenterHorizontally) {
                Text("🛡️", fontSize = 20.sp)
                Text(fixture.team1, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = MainText, maxLines = 1)
              }
              Text("VS", fontSize = 14.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFFDC2626), modifier = Modifier.padding(horizontal = 8.dp))
              Column(modifier = Modifier.weight(1f), horizontalAlignment = Alignment.CenterHorizontally) {
                Text("🛡️", fontSize = 20.sp)
                Text(fixture.team2, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = MainText, maxLines = 1)
              }
            }

            Spacer(modifier = Modifier.height(8.dp))
            Column(verticalArrangement = Arrangement.spacedBy(3.dp)) {
              Text("🏆 प्रतियोगिता: ${fixture.tournamentTitle}", fontSize = 11.sp, color = MutedText)
              Text("🏟️ मैदान: ${fixture.ground}", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MainText)
              Text("📍 लैंडमार्क: ${fixture.groundLandmark}", fontSize = 10.sp, color = MutedText)
              Text("🏏 प्रारूप: ${fixture.overs} • ${fixture.ballType}", fontSize = 11.sp, color = PrimaryGreen, fontWeight = FontWeight.Bold)
            }

            Spacer(modifier = Modifier.height(6.dp))
            Surface(
              color = Color(0xFFFEF3C7),
              shape = RoundedCornerShape(6.dp),
              modifier = Modifier.fillMaxWidth()
            ) {
              Text(
                fixture.pitchStatus,
                fontSize = 10.sp,
                color = Color(0xFF92400E),
                modifier = Modifier.padding(6.dp)
              )
            }

            Spacer(modifier = Modifier.height(10.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
              OutlinedButton(
                onClick = {
                  try {
                    val mapUri = Uri.parse("geo:0,0?q=" + Uri.encode("${fixture.ground}, Bhadohi, Uttar Pradesh"))
                    val mapIntent = Intent(Intent.ACTION_VIEW, mapUri)
                    context.startActivity(mapIntent)
                  } catch (_: Exception) {
                    Toast.makeText(context, "मैदान: ${fixture.ground}", Toast.LENGTH_SHORT).show()
                  }
                },
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.weight(1f).height(38.dp)
              ) {
                Text("🗺️ मैदान का नक्शा", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = DeepForest)
              }

              Button(
                onClick = {
                  val shareIntent = Intent(Intent.ACTION_SEND).apply {
                    type = "text/plain"
                    putExtra(
                      Intent.EXTRA_TEXT,
                      "🏏 *मैच सूचना*\n${fixture.team1} VS ${fixture.team2}\nतारीख: ${fixture.date} (${fixture.time})\nमैदान: ${fixture.ground}\nप्रतियोगिता: ${fixture.tournamentTitle}\n\nभदोही ग्रामीण क्रिकेट प्लेटफ़ॉर्म"
                    )
                  }
                  context.startActivity(Intent.createChooser(shareIntent, "मैच शेड्यूल साझा करें"))
                },
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.weight(1f).height(38.dp)
              ) {
                Text("📲 मैच शेयर करें", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = White)
              }
            }
          }
        }
      }
    }

    // Persistent Legal Disclaimer Notice Card at bottom of Tournaments & Fixtures
    item {
      Card(
        colors = CardDefaults.cardColors(containerColor = Color(0xFFFEF3C7)),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier
          .fillMaxWidth()
          .border(1.dp, Color(0xFFF59E0B), RoundedCornerShape(12.dp))
          .padding(top = 4.dp, bottom = 12.dp)
      ) {
        Column(modifier = Modifier.padding(12.dp)) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Text("⚖️", fontSize = 16.sp)
              Spacer(modifier = Modifier.width(6.dp))
              Text(
                "विधिक अस्वीकरण (Legal Notice)",
                fontWeight = FontWeight.Bold,
                fontSize = 12.sp,
                color = Color(0xFF92400E)
              )
            }
            Surface(
              color = Color(0xFFD97706),
              shape = RoundedCornerShape(6.dp),
              modifier = Modifier.clickable { onNavigateToRules() }
            ) {
              Text(
                "शर्तें पढ़ें →",
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                color = White,
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
              )
            }
          }
          Spacer(modifier = Modifier.height(4.dp))
          Text(
            "यह ऐप केवल ग्रामीण खेल समन्वय हेतु है। किसी भी सट्टेबाजी (जुआ), वित्तीय लेनदेन या मैदान पर होने वाली शारीरिक चोट (Volenti Non Fit Injuria) के लिए ऐप या डेवलपर उत्तरदायी नहीं हैं। सभी खिलाड़ी स्वेच्छा से अपने स्वयं के जोखिम पर खेलते हैं।",
            fontSize = 10.sp,
            color = Color(0xFF78350F),
            lineHeight = 14.sp
          )
        }
      }
    }
  }
}

// =========================================================================
// 2. MULTI-TEAM MANAGEMENT & SQUAD VIEW (With Persistent Storage)
// =========================================================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MultiTeamManagementView(
  teams: MutableList<StoredTeam>,
  tournaments: List<StoredTournament>,
  players: List<PlayerItem>,
  registeredProfile: StoredPlayerProfile?,
  initialOpenCreateDialog: Boolean,
  preselectedTournamentId: String?,
  onDialogOpened: () -> Unit,
  onTeamCreated: (StoredTeam) -> Unit,
  onTeamsUpdated: () -> Unit
) {
  val context = LocalContext.current
  var selectedTeamIndex by remember { mutableStateOf(0) }
  var showCreateDialog by remember { mutableStateOf(initialOpenCreateDialog) }
  var showAddPlayerDialog by remember { mutableStateOf(false) }

  var newTeamName by remember { mutableStateOf("") }
  var newVillage by remember { mutableStateOf(registeredProfile?.village ?: "") }
  var newCaptainName by remember { mutableStateOf(registeredProfile?.fullName ?: "मेरा नाम") }
  var selectedTournamentId by remember { mutableStateOf(preselectedTournamentId ?: (if (tournaments.isNotEmpty()) tournaments[0].id else "1")) }
  var formError by remember { mutableStateOf<String?>(null) }

  LaunchedEffect(initialOpenCreateDialog, preselectedTournamentId) {
    if (initialOpenCreateDialog) {
      if (preselectedTournamentId != null) {
        selectedTournamentId = preselectedTournamentId
      }
      showCreateDialog = true
      onDialogOpened()
    }
  }

  // DIALOG: CREATE NEW TEAM
  if (showCreateDialog) {
    AlertDialog(
      onDismissRequest = { showCreateDialog = false },
      title = {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Text("🛡️", fontSize = 20.sp)
          Spacer(modifier = Modifier.width(8.dp))
          Text("नई क्रिकेट टीम बनाएं", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = DeepForest)
        }
      },
      text = {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
          Text("प्रतियोगिता का चयन करें:", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MainText)
          LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            items(tournaments) { tour ->
              val isSel = selectedTournamentId == tour.id
              FilterChip(
                selected = isSel,
                onClick = { selectedTournamentId = tour.id },
                label = { Text(tour.title.take(18) + "..", fontSize = 10.sp) },
                colors = FilterChipDefaults.filterChipColors(
                  selectedContainerColor = PrimaryGreen,
                  selectedLabelColor = White
                )
              )
            }
          }

          if (formError != null) {
            Surface(color = Color(0xFFFEE2E2), shape = RoundedCornerShape(6.dp)) {
              Text(formError!!, color = Color(0xFFB91C1C), fontSize = 11.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(6.dp))
            }
          }

          OutlinedTextField(
            value = newTeamName,
            onValueChange = { newTeamName = it },
            label = { Text("टीम का नाम") },
            placeholder = { Text("उदा. गोपीगंज टाइटन्स") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
          )

          OutlinedTextField(
            value = newVillage,
            onValueChange = { newVillage = it },
            label = { Text("गांव / कस्बा") },
            placeholder = { Text("उदा. खमरिया, औराई") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
          )

          OutlinedTextField(
            value = newCaptainName,
            onValueChange = { newCaptainName = it },
            label = { Text("कप्तान का नाम") },
            placeholder = { Text("उदा. अमित सिंह") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
          )

          Surface(color = Color(0xFFFEF3C7), shape = RoundedCornerShape(8.dp)) {
            Text(
              "⚠️ अस्वीकरण: खिलाड़ी स्वेच्छा से मैच में भाग लेते हैं। मैच के दौरान किसी भी शारीरिक चोट (Volenti Non Fit Injuria) व मैदान विवाद के लिए खिलाड़ी एवं टीम स्वयं जिम्मेदार हैं।",
              fontSize = 10.sp,
              color = Color(0xFF92400E),
              modifier = Modifier.padding(6.dp),
              lineHeight = 13.sp
            )
          }
        }
      },
      confirmButton = {
        Button(
          onClick = {
            formError = null
            if (newTeamName.trim().length < 3) {
              formError = "टीम का नाम कम से कम 3 अक्षरों का होना चाहिए।"
              return@Button
            }
            if (newVillage.trim().isEmpty()) {
              formError = "कृपया गांव का नाम दर्ज करें।"
              return@Button
            }
            if (newCaptainName.trim().isEmpty()) {
              formError = "कृपया कप्तान का नाम दर्ज करें।"
              return@Button
            }

            val chosenTour = tournaments.find { it.id == selectedTournamentId }
            val tourTitle = chosenTour?.title ?: "भदोही ग्रामीण क्रिकेट लीग"
            val tourBlock = chosenTour?.block ?: "ज्ञानपुर"

            val initialCaptain = StoredSquadMember(
              id = "m-${System.currentTimeMillis()}",
              name = newCaptainName.trim(),
              role = "कप्तान",
              village = newVillage.trim(),
              maskedPhone = registeredProfile?.maskedMobile ?: "98XXXXXX21"
            )

            val created = StoredTeam(
              id = "team-${System.currentTimeMillis()}",
              teamName = newTeamName.trim(),
              tournamentId = selectedTournamentId,
              tournamentTitle = tourTitle,
              village = newVillage.trim(),
              block = tourBlock,
              captainName = newCaptainName.trim(),
              status = "गठन जारी (FORMING)",
              members = listOf(initialCaptain)
            )

            onTeamCreated(created)
            selectedTeamIndex = 0
            showCreateDialog = false
            newTeamName = ""
            Toast.makeText(context, "नई टीम बनाई गई! अब 11 खिलाड़ी जोड़ें।", Toast.LENGTH_SHORT).show()
          },
          colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)
        ) {
          Text("टीम बनाएं", color = White, fontWeight = FontWeight.Bold)
        }
      },
      dismissButton = {
        TextButton(onClick = { showCreateDialog = false }) {
          Text("रद्द करें", color = MainText)
        }
      }
    )
  }

  // DIALOG: ADD SQUAD MEMBER
  if (showAddPlayerDialog && teams.isNotEmpty() && selectedTeamIndex < teams.size) {
    var pName by remember { mutableStateOf("") }
    var pVillage by remember { mutableStateOf("") }
    var pRole by remember { mutableStateOf("ऑल-राउंडर") }
    var pPhone by remember { mutableStateOf("") }
    var memberError by remember { mutableStateOf<String?>(null) }
    val roles = listOf("ऑल-राउंडर", "बल्लेबाज", "गेंदबाज", "विकेट-कीपर", "उप-कप्तान")

    AlertDialog(
      onDismissRequest = { showAddPlayerDialog = false },
      title = {
        Text("टीम में खिलाड़ी जोड़ें", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = DeepForest)
      },
      text = {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
          if (memberError != null) {
            Surface(color = Color(0xFFFEE2E2), shape = RoundedCornerShape(6.dp)) {
              Text(memberError!!, color = Color(0xFFB91C1C), fontSize = 11.sp, modifier = Modifier.padding(6.dp))
            }
          }
          OutlinedTextField(
            value = pName,
            onValueChange = { pName = it },
            label = { Text("खिलाड़ी का नाम") },
            placeholder = { Text("उदा. विकास यादव") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
          )
          OutlinedTextField(
            value = pVillage,
            onValueChange = { pVillage = it },
            label = { Text("गांव") },
            placeholder = { Text("उदा. सुरियावां खास") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
          )
          OutlinedTextField(
            value = pPhone,
            onValueChange = { if (it.length <= 10 && it.all { c -> c.isDigit() }) pPhone = it },
            label = { Text("10-अंकीय मोबाइल नंबर") },
            placeholder = { Text("उदा. 9876543210") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
          )
          Text("भूमिका चुनें:", fontSize = 11.sp, fontWeight = FontWeight.Bold)
          LazyRow(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
            items(roles) { r ->
              val isSel = pRole == r
              FilterChip(
                selected = isSel,
                onClick = { pRole = r },
                label = { Text(r, fontSize = 10.sp) },
                colors = FilterChipDefaults.filterChipColors(selectedContainerColor = PrimaryGreen, selectedLabelColor = White)
              )
            }
          }
        }
      },
      confirmButton = {
        Button(
          onClick = {
            memberError = null
            if (pName.trim().length < 2) {
              memberError = "कृपया खिलाड़ी का नाम दर्ज करें।"
              return@Button
            }
            if (pVillage.trim().isEmpty()) {
              memberError = "कृपया गांव का नाम दर्ज करें।"
              return@Button
            }
            val masked = if (pPhone.length == 10) "${pPhone.take(2)}XXXXXX${pPhone.takeLast(2)}" else "98XXXXXX21"

            val currentTeam = teams[selectedTeamIndex]
            if (currentTeam.members.size >= 15) {
              memberError = "टीम में अधिकतम 15 खिलाड़ी हो सकते हैं।"
              return@Button
            }

            val updatedMembers = currentTeam.members.toMutableList().apply {
              add(
                StoredSquadMember(
                  id = "m-${System.currentTimeMillis()}",
                  name = pName.trim(),
                  role = pRole,
                  village = pVillage.trim(),
                  maskedPhone = masked
                )
              )
            }
            teams[selectedTeamIndex] = currentTeam.copy(members = updatedMembers)
            onTeamsUpdated()
            showAddPlayerDialog = false
            Toast.makeText(context, "${pName.trim()} को स्क्वाड में जोड़ा गया!", Toast.LENGTH_SHORT).show()
          },
          colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)
        ) {
          Text("जोड़ें", color = White)
        }
      },
      dismissButton = {
        TextButton(onClick = { showAddPlayerDialog = false }) {
          Text("रद्द करें", color = MainText)
        }
      }
    )
  }

  LazyColumn(
    modifier = Modifier.fillMaxSize().padding(12.dp),
    verticalArrangement = Arrangement.spacedBy(10.dp)
  ) {
    // Header & Create Team CTA
    item {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Column {
          Text("🛡️ मेरी टीमें (Multi-Team)", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = MainText)
          Text("भदोही ग्रामीण प्रतियोगिताओं के लिए टीमें बनाएं", fontSize = 11.sp, color = MutedText)
        }
        Button(
          onClick = { showCreateDialog = true },
          colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
          shape = RoundedCornerShape(8.dp),
          contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
        ) {
          Text("+ नई टीम बनाएं", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = White)
        }
      }
    }

    if (teams.isEmpty()) {
      item {
        Card(
          colors = CardDefaults.cardColors(containerColor = White),
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier.fillMaxWidth().padding(vertical = 20.dp)
        ) {
          Column(
            modifier = Modifier.fillMaxWidth().padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
          ) {
            Text("🛡️", fontSize = 40.sp)
            Spacer(modifier = Modifier.height(10.dp))
            Text("आपने अभी कोई टीम नहीं बनाई है", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = MainText)
            Spacer(modifier = Modifier.height(6.dp))
            Text("ऊपर दिए गए '+ नई टीम बनाएं' बटन पर क्लिक करें।", fontSize = 11.sp, color = MutedText)
          }
        }
      }
      return@LazyColumn
    }

    // Horizontal Team Switcher Chips
    item {
      Text("अपनी टीम चुनें:", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MainText)
      LazyRow(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier.fillMaxWidth()
      ) {
        items(teams.size) { idx ->
          val t = teams[idx]
          val isSelected = selectedTeamIndex == idx
          Surface(
            color = if (isSelected) PrimaryGreen else White,
            shape = RoundedCornerShape(12.dp),
            border = BorderStroke(if (isSelected) 1.5.dp else 1.dp, if (isSelected) PrimaryGreen else BorderColor),
            modifier = Modifier.clickable { selectedTeamIndex = idx }
          ) {
            Row(
              modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
              verticalAlignment = Alignment.CenterVertically
            ) {
              Text("🛡️", fontSize = 14.sp)
              Spacer(modifier = Modifier.width(6.dp))
              Column {
                Text(
                  t.teamName,
                  fontSize = 12.sp,
                  fontWeight = FontWeight.Bold,
                  color = if (isSelected) White else MainText
                )
                Text(
                  "${t.members.size}/15 • ${t.status.take(8)}",
                  fontSize = 10.sp,
                  color = if (isSelected) AmberHighlight else MutedText
                )
              }
            }
          }
        }
      }
    }

    val activeTeam = if (selectedTeamIndex < teams.size) teams[selectedTeamIndex] else teams[0]

    // Selected Team Detailed Card
    item {
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
            Column {
              Text(activeTeam.teamName, fontWeight = FontWeight.Bold, fontSize = 17.sp, color = MainText)
              Text("ग्राम: ${activeTeam.village} (${activeTeam.block})", fontSize = 11.sp, color = MutedText)
            }
            Surface(
              color = when {
                activeTeam.status.contains("ACCEPTED") -> Color(0xFFDCFCE7)
                activeTeam.status.contains("APPLIED") -> Color(0xFFFEF3C7)
                else -> Color(0xFFEFF6FF)
              },
              shape = RoundedCornerShape(8.dp)
            ) {
              Text(
                activeTeam.status,
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                color = when {
                  activeTeam.status.contains("ACCEPTED") -> Color(0xFF166534)
                  activeTeam.status.contains("APPLIED") -> Color(0xFF92400E)
                  else -> Color(0xFF1E40AF)
                },
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
              )
            }
          }

          Spacer(modifier = Modifier.height(10.dp))
          Surface(
            color = CreamBackground,
            shape = RoundedCornerShape(8.dp),
            modifier = Modifier.fillMaxWidth()
          ) {
            Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(3.dp)) {
              Text("🏆 प्रतियोगिता: ${activeTeam.tournamentTitle}", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MainText)
              Text("👤 कप्तान: ${activeTeam.captainName}", fontSize = 11.sp, color = MainText)
              Text(
                "👥 स्क्वाड क्षमता: ${activeTeam.members.size} / 15 खिलाड़ी (न्यूनतम 11 आवश्यक)",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = if (activeTeam.members.size >= 11) PrimaryGreen else Color(0xFFDC2626)
              )
            }
          }

          Spacer(modifier = Modifier.height(12.dp))
          // Action Buttons: Add Member or Submit Application
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
          ) {
            val isLocked = activeTeam.status.contains("APPLIED") || activeTeam.status.contains("ACCEPTED")

            if (!isLocked) {
              Button(
                onClick = { showAddPlayerDialog = true },
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.weight(1f).height(38.dp)
              ) {
                Text("+ खिलाड़ी जोड़ें", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = White)
              }

              Button(
                onClick = {
                  if (activeTeam.members.size < 11) {
                    Toast.makeText(context, "आवेदन के लिए कम से कम 11 खिलाड़ी आवश्यक हैं! (वर्तमान: ${activeTeam.members.size})", Toast.LENGTH_LONG).show()
                  } else {
                    teams[selectedTeamIndex] = activeTeam.copy(status = "आवेदन भेजा गया (APPLIED)")
                    onTeamsUpdated()
                    Toast.makeText(context, "आयोजक को टीम आवेदन सफलतापूर्वक भेजा गया!", Toast.LENGTH_LONG).show()
                  }
                },
                colors = ButtonDefaults.buttonColors(containerColor = if (activeTeam.members.size >= 11) Color(0xFF15803D) else Color(0xFF9CA3AF)),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.weight(1.3f).height(38.dp)
              ) {
                Text("आवेदन जमा करें", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = White)
              }
            } else {
              OutlinedButton(
                onClick = {
                  teams[selectedTeamIndex] = activeTeam.copy(status = "गठन जारी (FORMING)")
                  onTeamsUpdated()
                  Toast.makeText(context, "आवेदन वापस लिया गया। अब आप रोस्टर बदल सकते हैं।", Toast.LENGTH_SHORT).show()
                },
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.weight(1f).height(38.dp)
              ) {
                Text("आवेदन वापस लें (Edit)", fontSize = 11.sp, color = Color(0xFFDC2626))
              }
            }

            // WhatsApp Squad Share
            OutlinedButton(
              onClick = {
                val squadText = StringBuilder()
                squadText.append("🏏 *${activeTeam.teamName}* (${activeTeam.village})\n")
                squadText.append("प्रतियोगिता: ${activeTeam.tournamentTitle}\n")
                squadText.append("कप्तान: ${activeTeam.captainName}\n\n")
                squadText.append("📋 *टीम खिलाड़ी सूची (${activeTeam.members.size}/15):*\n")
                activeTeam.members.forEachIndexed { i, m ->
                  squadText.append("${i + 1}. ${m.name} (${m.role}) - ग्राम: ${m.village}\n")
                }
                squadText.append("\nभदोही ग्रामीण क्रिकेट प्लेटफ़ॉर्म पर पंजीकृत")

                val shareIntent = Intent(Intent.ACTION_SEND).apply {
                  type = "text/plain"
                  putExtra(Intent.EXTRA_TEXT, squadText.toString())
                }
                context.startActivity(Intent.createChooser(shareIntent, "WhatsApp टीम रोस्टर शेयर करें"))
              },
              shape = RoundedCornerShape(8.dp),
              modifier = Modifier.height(38.dp)
            ) {
              Text("📲 रोस्टर शेयर", fontSize = 11.sp, color = PrimaryGreen, fontWeight = FontWeight.Bold)
            }
          }
        }
      }
    }

    // Squad Roster List Header
    item {
      Row(
        modifier = Modifier.fillMaxWidth().padding(top = 6.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Text("📋 टीम रोस्टर (${activeTeam.members.size} खिलाड़ी):", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = MainText)
        if (activeTeam.members.size < 11) {
          Text("⚠️ 11 न्यूनतम अनिवार्य", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFFDC2626))
        } else {
          Text("✅ न्यूनतम 11 पूर्ण", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = PrimaryGreen)
        }
      }
    }

    // Squad Roster Members
    items(activeTeam.members) { member ->
      Card(
        colors = CardDefaults.cardColors(containerColor = White),
        shape = RoundedCornerShape(10.dp),
        modifier = Modifier.fillMaxWidth().border(1.dp, BorderColor, RoundedCornerShape(10.dp))
      ) {
        Row(
          modifier = Modifier.padding(10.dp),
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.SpaceBetween
        ) {
          Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
              modifier = Modifier
                .size(32.dp)
                .background(if (member.role == "कप्तान") AmberHighlight else PrimaryGreen, CircleShape),
              contentAlignment = Alignment.Center
            ) {
              Text(
                if (member.role == "कप्तान") "👑" else "🏏",
                fontSize = 14.sp
              )
            }
            Spacer(modifier = Modifier.width(10.dp))
            Column {
              Row(verticalAlignment = Alignment.CenterVertically) {
                Text(member.name, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = MainText)
                Spacer(modifier = Modifier.width(6.dp))
                Surface(
                  color = if (member.role == "कप्तान") Color(0xFFFEF3C7) else CreamBackground,
                  shape = RoundedCornerShape(4.dp)
                ) {
                  Text(
                    member.role,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (member.role == "कप्तान") Color(0xFF92400E) else PrimaryGreen,
                    modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                  )
                }
              }
              Text("ग्राम: ${member.village} • ${member.maskedPhone}", fontSize = 10.sp, color = MutedText)
            }
          }

          // Remove Member button (if not locked and not captain)
          if (!activeTeam.status.contains("APPLIED") && !activeTeam.status.contains("ACCEPTED") && member.role != "कप्तान") {
            IconButton(
              onClick = {
                val updatedMembers = activeTeam.members.toMutableList().apply { remove(member) }
                teams[selectedTeamIndex] = activeTeam.copy(members = updatedMembers)
                onTeamsUpdated()
                Toast.makeText(context, "${member.name} को टीम से हटाया गया", Toast.LENGTH_SHORT).show()
              },
              modifier = Modifier.size(28.dp)
            ) {
              Text("❌", fontSize = 12.sp)
            }
          }
        }
      }
    }
  }
}

// =========================================================================
// 3. PLAYER REGISTRATION, PROFILE & INVITATIONS VIEW
// =========================================================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PlayerRegistrationAndProfileView(
  currentProfile: StoredPlayerProfile?,
  invitations: List<StoredInvitation>,
  onProfileSaved: (StoredPlayerProfile) -> Unit,
  onProfileCleared: () -> Unit,
  onInvitationAction: (String, Boolean) -> Unit
) {
  val context = LocalContext.current
  var isEditing by remember { mutableStateOf(currentProfile == null) }

  var mobileNumber by remember { mutableStateOf(currentProfile?.mobile ?: "") }
  var pin by remember { mutableStateOf("") }
  var confirmPin by remember { mutableStateOf("") }
  var isAgeVerified by remember { mutableStateOf(true) }
  var isTermsAccepted by remember { mutableStateOf(true) }

  var fullName by remember { mutableStateOf(currentProfile?.fullName ?: "") }
  var village by remember { mutableStateOf(currentProfile?.village ?: "") }
  var selectedBlock by remember { mutableStateOf(currentProfile?.block ?: "ज्ञानपुर") }
  var selectedRole by remember { mutableStateOf(currentProfile?.role ?: "ऑल-राउंडर") }
  var selectedBatting by remember { mutableStateOf(currentProfile?.battingStyle ?: "दाएं हाथ") }
  var selectedBowling by remember { mutableStateOf(currentProfile?.bowlingStyle ?: "दाएं हाथ मध्यम गति") }
  var isAvailable15Days by remember { mutableStateOf(currentProfile?.isAvailable ?: true) }
  var allowWhatsapp by remember { mutableStateOf(currentProfile?.allowWhatsapp ?: true) }

  var errorMessage by remember { mutableStateOf<String?>(null) }
  var showSuccessDialog by remember { mutableStateOf(false) }
  var generatedRecoveryCode by remember { mutableStateOf("") }

  val blocks = listOf("ज्ञानपुर", "औराई", "भदोही", "सुरियावां", "डीघ", "अभोली")
  val roles = listOf("ऑल-राउंडर", "बल्लेबाज", "गेंदबाज", "विकेट-कीपर")
  val battingStyles = listOf("दाएं हाथ", "बाएं हाथ")
  val bowlingStyles = listOf("दाएं हाथ मध्यम गति", "तेज गेंदबाज", "ऑफ स्पिन", "लेग स्पिन", "बाएं हाथ मध्यम", "गेंदबाजी नहीं")

  // RECOVERY CODE DIALOG
  if (showSuccessDialog) {
    AlertDialog(
      onDismissRequest = {
        showSuccessDialog = false
        isEditing = false
      },
      title = {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Text("🔑", fontSize = 22.sp)
          Spacer(modifier = Modifier.width(8.dp))
          Text("पंजीकरण सफल! रिकवरी कोड", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = DeepForest)
        }
      },
      text = {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Text("आपका खाता सुरक्षित कर लिया गया है। इस कोड को अपनी डायरी में लिख लें:", fontSize = 12.sp, color = MainText)
          Surface(
            color = Color(0xFFFEF3C7),
            shape = RoundedCornerShape(8.dp),
            border = BorderStroke(1.dp, Color(0xFFF59E0B)),
            modifier = Modifier.fillMaxWidth()
          ) {
            Column(modifier = Modifier.padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
              Text("आपका गुप्त रिकवरी कोड:", fontSize = 10.sp, color = Color(0xFF92400E))
              Text(generatedRecoveryCode, fontSize = 20.sp, fontWeight = FontWeight.ExtraBold, color = DeepForest)
              Text("पिन भूलने पर इस कोड से खाता वापस मिलेगा।", fontSize = 9.sp, color = Color(0xFF92400E))
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
          Text("मैंने कोड लिख लिया है (Done)", color = White, fontWeight = FontWeight.Bold)
        }
      }
    )
  }

  // IF ALREADY REGISTERED AND NOT EDITING -> SHOW PROFILE CARD & INVITATIONS
  if (currentProfile != null && !isEditing) {
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
                  modifier = Modifier.size(46.dp).background(PrimaryGreen, CircleShape),
                  contentAlignment = Alignment.Center
                ) {
                  Text(currentProfile.fullName.take(1), fontWeight = FontWeight.Bold, fontSize = 20.sp, color = White)
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                  Text(currentProfile.fullName, fontWeight = FontWeight.Bold, fontSize = 17.sp, color = White)
                  Text("ग्राम: ${currentProfile.village} • ब्लॉक: ${currentProfile.block}", fontSize = 11.sp, color = AmberHighlight)
                }
              }

              Surface(
                color = if (currentProfile.isAvailable) Color(0xFFDCFCE7) else Color(0xFFFEE2E2),
                shape = RoundedCornerShape(12.dp)
              ) {
                Text(
                  if (currentProfile.isAvailable) "उपलब्ध (15 दिन)" else "अनुपलब्ध",
                  fontSize = 10.sp,
                  fontWeight = FontWeight.Bold,
                  color = if (currentProfile.isAvailable) Color(0xFF166534) else Color(0xFF991B1B),
                  modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                )
              }
            }

            Spacer(modifier = Modifier.height(14.dp))
            HorizontalDivider(color = White.copy(alpha = 0.2f))
            Spacer(modifier = Modifier.height(12.dp))

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

      // SECTION: RECEIVED TEAM INVITATIONS (आमंत्रण)
      item {
        Card(
          colors = CardDefaults.cardColors(containerColor = White),
          shape = RoundedCornerShape(14.dp),
          modifier = Modifier.fillMaxWidth().border(1.dp, BorderColor, RoundedCornerShape(14.dp))
        ) {
          Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Text("📬 प्राप्त टीम आमंत्रण (${invitations.size})", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = MainText)
              Text("कप्तानों द्वारा बुलावा", fontSize = 10.sp, color = MutedText)
            }

            if (invitations.isEmpty()) {
              Text("वर्तमान में कोई नया आमंत्रण नहीं है।", fontSize = 11.sp, color = MutedText)
            } else {
              invitations.forEach { inv ->
                Surface(
                  color = CreamBackground,
                  shape = RoundedCornerShape(8.dp),
                  modifier = Modifier.fillMaxWidth()
                ) {
                  Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Row(
                      modifier = Modifier.fillMaxWidth(),
                      horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                      Text("🛡️ ${inv.teamName}", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = MainText)
                      Text("रोल: ${inv.roleOffered}", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = PrimaryGreen)
                    }
                    Text("कप्तान: ${inv.captainName} • ${inv.tournamentTitle}", fontSize = 10.sp, color = MutedText)
                    Text("मैदान: ${inv.ground}", fontSize = 10.sp, color = MutedText)

                    if (inv.status == "PENDING") {
                      Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth().padding(top = 4.dp)) {
                        Button(
                          onClick = { onInvitationAction(inv.id, true) },
                          colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
                          shape = RoundedCornerShape(6.dp),
                          contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                          modifier = Modifier.weight(1f).height(32.dp)
                        ) {
                          Text("स्वीकार करें", fontSize = 11.sp, color = White)
                        }
                        OutlinedButton(
                          onClick = { onInvitationAction(inv.id, false) },
                          shape = RoundedCornerShape(6.dp),
                          contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                          modifier = Modifier.weight(1f).height(32.dp)
                        ) {
                          Text("अस्वीकार करें", fontSize = 11.sp, color = Color(0xFFDC2626))
                        }
                      }
                    } else {
                      Surface(color = Color(0xFFDCFCE7), shape = RoundedCornerShape(4.dp)) {
                        Text("✅ स्वीकृत (Accepted)", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF166534), modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      item {
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
              onProfileCleared()
              isEditing = true
              mobileNumber = ""
              pin = ""
              confirmPin = ""
              fullName = ""
              village = ""
            },
            shape = RoundedCornerShape(10.dp),
            modifier = Modifier.weight(1f).height(42.dp)
          ) {
            Text("लॉग आउट / नया खाता", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFFDC2626))
          }
        }
      }
    }
    return
  }

  // REGISTRATION FORM
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

          Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
            Checkbox(
              checked = isTermsAccepted,
              onCheckedChange = { isTermsAccepted = it },
              colors = CheckboxDefaults.colors(checkedColor = PrimaryGreen)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
              "मैं खेल चोट दायित्व मुक्ति (Volenti Non Fit Injuria), शून्य सट्टेबाजी एवं विधिक अस्वीकरण शर्तों से सहमत हूँ।",
              fontSize = 11.sp,
              fontWeight = FontWeight.Medium,
              color = if (isTermsAccepted) MainText else Color(0xFFDC2626),
              lineHeight = 15.sp
            )
          }
        }
      }
    }

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
          if (!isTermsAccepted) {
            errorMessage = "कृपया खेल चोट दायित्व मुक्ति एवं विधिक अस्वीकरण शर्तों को स्वीकार करें।"
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

          val chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
          val part1 = (1..4).map { chars.random() }.joinToString("")
          val part2 = (1..4).map { chars.random() }.joinToString("")
          val recCode = currentProfile?.recoveryCode ?: "$part1-$part2"

          val masked = if (mobileNumber.length == 10) {
            "${mobileNumber.take(2)}XXXXXX${mobileNumber.takeLast(2)}"
          } else "98XXXXXX21"

          val profile = StoredPlayerProfile(
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
// 4. PLAYERS SCOUTING VIEW (With Real-Time Search & Block Filtering)
// =========================================================================
@Composable
fun PlayersView(
  players: List<PlayerItem>,
  onInvitePlayer: (PlayerItem) -> Unit
) {
  val context = LocalContext.current
  var searchQuery by remember { mutableStateOf("") }
  var selectedRole by remember { mutableStateOf("सभी") }
  var selectedBlock by remember { mutableStateOf("सभी") }

  val roles = listOf("सभी", "बल्लेबाज", "गेंदबाज", "ऑल-राउंडर", "विकेट-कीपर")
  val blocks = listOf("सभी", "ज्ञानपुर", "औराई", "भदोही", "सुरियावां", "डीघ", "अभोली")

  val filtered = players.filter { p ->
    val matchRole = selectedRole == "सभी" || p.role == selectedRole
    val matchBlock = selectedBlock == "सभी" || p.block == selectedBlock
    val matchQuery = searchQuery.trim().isEmpty() ||
      p.name.contains(searchQuery.trim(), ignoreCase = true) ||
      p.village.contains(searchQuery.trim(), ignoreCase = true)
    matchRole && matchBlock && matchQuery
  }

  LazyColumn(
    modifier = Modifier.fillMaxSize().padding(12.dp),
    verticalArrangement = Arrangement.spacedBy(10.dp)
  ) {
    // Privacy Alert
    item {
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

    // Search Bar
    item {
      OutlinedTextField(
        value = searchQuery,
        onValueChange = { searchQuery = it },
        placeholder = { Text("खिलाड़ी का नाम या गांव खोजें...") },
        leadingIcon = { Text("🔍", fontSize = 16.sp) },
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(10.dp),
        singleLine = true
      )
    }

    // Block Filter Chips
    item {
      Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text("ब्लॉक अनुसार फ़िल्टर:", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MainText)
        LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
          items(blocks) { b ->
            val isSelected = selectedBlock == b
            FilterChip(
              selected = isSelected,
              onClick = { selectedBlock = b },
              label = { Text(b, fontSize = 10.sp) },
              colors = FilterChipDefaults.filterChipColors(
                selectedContainerColor = PrimaryGreen,
                selectedLabelColor = White
              )
            )
          }
        }
      }
    }

    // Role Filter Chips
    item {
      Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text("भूमिका अनुसार फ़िल्टर:", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MainText)
        LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
          items(roles) { role ->
            val isSelected = selectedRole == role
            FilterChip(
              selected = isSelected,
              onClick = { selectedRole = role },
              label = { Text(role, fontSize = 10.sp) },
              colors = FilterChipDefaults.filterChipColors(
                selectedContainerColor = PrimaryGreen,
                selectedLabelColor = White
              )
            )
          }
        }
      }
    }

    if (filtered.isEmpty()) {
      item {
        Card(
          colors = CardDefaults.cardColors(containerColor = White),
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier.fillMaxWidth().padding(vertical = 20.dp)
        ) {
          Column(
            modifier = Modifier.fillMaxWidth().padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
          ) {
            Text("🔍", fontSize = 32.sp)
            Spacer(modifier = Modifier.height(8.dp))
            Text("कोई खिलाड़ी नहीं मिला", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = MainText)
            Text("फ़िल्टर बदलकर पुनः प्रयास करें।", fontSize = 11.sp, color = MutedText)
          }
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
              onClick = { onInvitePlayer(p) },
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
// 5. RULES & LEGAL DISCLAIMERS VIEW (SCR-21, Universal Invariants & Legal Protections)
// =========================================================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RulesView() {
  val context = LocalContext.current
  var subTab by remember { mutableStateOf(0) } // 0: कानूनी अस्वीकरण (Legal), 1: ग्रामीण नियम व रिपोर्ट (Invariants)

  var showReportDialog by remember { mutableStateOf(false) }
  var reportReason by remember { mutableStateOf("उम्र सीमा उल्लंघन (Underage)") }
  var reportVillage by remember { mutableStateOf("") }
  var reportComment by remember { mutableStateOf("") }
  val reasons = listOf("उम्र सीमा उल्लंघन (Underage)", "मैदान पर विवाद या दुर्व्यवहार", "बिना सूचना मैच रद्द होना", "नियम उल्लंघन")

  if (showReportDialog) {
    AlertDialog(
      onDismissRequest = { showReportDialog = false },
      title = {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Text("🚨", fontSize = 20.sp)
          Spacer(modifier = Modifier.width(8.dp))
          Text("ग्राउंड रिपोर्ट / शिकायत दर्ज करें", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = DeepForest)
        }
      },
      text = {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
          Text("समस्या का प्रकार:", fontSize = 11.sp, fontWeight = FontWeight.Bold)
          reasons.forEach { r ->
            Row(
              verticalAlignment = Alignment.CenterVertically,
              modifier = Modifier.fillMaxWidth().clickable { reportReason = r }
            ) {
              RadioButton(
                selected = reportReason == r,
                onClick = { reportReason = r },
                colors = RadioButtonDefaults.colors(selectedColor = PrimaryGreen)
              )
              Text(r, fontSize = 11.sp, color = MainText)
            }
          }
          OutlinedTextField(
            value = reportVillage,
            onValueChange = { reportVillage = it },
            label = { Text("मैदान / गांव का नाम") },
            placeholder = { Text("उदा. खमरिया इंटर कॉलेज मैदान") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
          )
          OutlinedTextField(
            value = reportComment,
            onValueChange = { reportComment = it },
            label = { Text("विवरण (अधिकतम 250 अक्षर)") },
            placeholder = { Text("समस्या का संक्षिप्त विवरण...") },
            modifier = Modifier.fillMaxWidth(),
            maxLines = 3
          )
        }
      },
      confirmButton = {
        Button(
          onClick = {
            if (reportVillage.trim().isEmpty()) {
              Toast.makeText(context, "कृपया मैदान या गांव का नाम दर्ज करें।", Toast.LENGTH_SHORT).show()
              return@Button
            }
            showReportDialog = false
            reportVillage = ""
            reportComment = ""
            Toast.makeText(context, "आपकी शिकायत जिला खेल समन्वय समिति को भेज दी गई है!", Toast.LENGTH_LONG).show()
          },
          colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)
        ) {
          Text("रिपोर्ट भेजें", color = White, fontWeight = FontWeight.Bold)
        }
      },
      dismissButton = {
        TextButton(onClick = { showReportDialog = false }) {
          Text("रद्द करें", color = MainText)
        }
      }
    )
  }

  LazyColumn(
    modifier = Modifier.fillMaxSize().padding(14.dp),
    verticalArrangement = Arrangement.spacedBy(10.dp)
  ) {
    // Sub-segment toggle (कानूनी अस्वीकरण vs ग्रामीण नियम)
    item {
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .background(White, RoundedCornerShape(12.dp))
          .padding(4.dp)
          .border(1.dp, BorderColor, RoundedCornerShape(12.dp)),
        horizontalArrangement = Arrangement.SpaceEvenly
      ) {
        Surface(
          color = if (subTab == 0) DeepForest else Color.Transparent,
          shape = RoundedCornerShape(8.dp),
          modifier = Modifier
            .weight(1f)
            .clickable { subTab = 0 }
        ) {
          Box(contentAlignment = Alignment.Center, modifier = Modifier.padding(vertical = 8.dp)) {
            Text(
              "⚖️ कानूनी अस्वीकरण",
              fontSize = 12.sp,
              fontWeight = FontWeight.Bold,
              color = if (subTab == 0) AmberHighlight else MainText
            )
          }
        }
        Surface(
          color = if (subTab == 1) PrimaryGreen else Color.Transparent,
          shape = RoundedCornerShape(8.dp),
          modifier = Modifier
            .weight(1f)
            .clickable { subTab = 1 }
        ) {
          Box(contentAlignment = Alignment.Center, modifier = Modifier.padding(vertical = 8.dp)) {
            Text(
              "📜 ग्रामीण नियम व रिपोर्ट",
              fontSize = 12.sp,
              fontWeight = FontWeight.Bold,
              color = if (subTab == 1) White else MainText
            )
          }
        }
      }
    }

    if (subTab == 0) {
      // -------------------------------------------------------------
      // SUB-TAB 0: LEGAL DISCLAIMERS & LIABILITY WAIVERS (कानूनी अस्वीकरण)
      // -------------------------------------------------------------
      item {
        Card(
          colors = CardDefaults.cardColors(containerColor = DeepForest),
          shape = RoundedCornerShape(14.dp),
          modifier = Modifier.fillMaxWidth()
        ) {
          Column(modifier = Modifier.padding(14.dp)) {
            Text("⚖️ विधिक अस्वीकरण एवं दायित्व मुक्ति", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = AmberHighlight)
            Spacer(modifier = Modifier.height(4.dp))
            Text(
              "भारतीय सूचना प्रौद्योगिकी अधिनियम (IT Act), पब्लिक गैंबलिंग एक्ट 1867 एवं खेल विधि के तहत पूर्ण विधिक सुरक्षा।",
              fontSize = 11.sp,
              color = White.copy(alpha = 0.9f)
            )
          }
        }
      }

      // Legal Card 1: Anti-Gambling & No Betting
      item {
        Card(
          colors = CardDefaults.cardColors(containerColor = White),
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier.fillMaxWidth().border(1.dp, Color(0xFFEF4444), RoundedCornerShape(12.dp))
        ) {
          Column(modifier = Modifier.padding(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Text("🚫", fontSize = 18.sp)
              Spacer(modifier = Modifier.width(8.dp))
              Text("सट्टेबाजी एवं जुआ पूर्णतः निषेध (Zero Gambling)", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Color(0xFF991B1B))
            }
            Spacer(modifier = Modifier.height(6.dp))
            Surface(color = Color(0xFFFEE2E2), shape = RoundedCornerShape(6.dp)) {
              Text(
                "अधिनियम: उत्तर प्रदेश पब्लिक गैंबलिंग एक्ट, 1961 एवं IT Rules 2021",
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFFB91C1C),
                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
              )
            }
            Spacer(modifier = Modifier.height(6.dp))
            Text(
              "इस ऐप पर किसी भी प्रकार की सट्टेबाजी, सट्टा, जुआ, कैश दांव, मनी पूल या मैच-फिक्सिंग सख्त वर्जित है। ऐप केवल खेल समन्वय और सूचना हेतु है। मैदान पर कोई व्यक्ति अवैध सट्टेबाजी करता है तो वह स्वयं कानूनी और आपराधिक रूप से जिम्मेदार होगा।",
              fontSize = 11.sp,
              color = MainText,
              lineHeight = 16.sp
            )
          }
        }
      }

      // Legal Card 2: Sports Injury & Health Waiver
      item {
        Card(
          colors = CardDefaults.cardColors(containerColor = White),
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier.fillMaxWidth().border(1.dp, Color(0xFFF59E0B), RoundedCornerShape(12.dp))
        ) {
          Column(modifier = Modifier.padding(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Text("🏥", fontSize = 18.sp)
              Spacer(modifier = Modifier.width(8.dp))
              Text("शारीरिक चोट व स्वास्थ्य जोखिम (Volenti Non Fit Injuria)", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Color(0xFF92400E))
            }
            Spacer(modifier = Modifier.height(6.dp))
            Surface(color = Color(0xFFFEF3C7), shape = RoundedCornerShape(6.dp)) {
              Text(
                "विधिक सिद्धांत: स्वेच्छा से खेल में भागीदारी (Sports Injury Waiver)",
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFFB45309),
                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
              )
            }
            Spacer(modifier = Modifier.height(6.dp))
            Text(
              "क्रिकेट एक जोखिम भरा खेल है। लेदर, भारी टेनिस या कॉस्को बॉल, बैट, शारीरिक टक्कर या मैदान की स्थिति से खिलाड़ी, दर्शक या अंपायर को लगने वाली किसी भी चोट, फ्रैक्चर, अस्पताल खर्च या अनहोनी के लिए यह ऐप, डेवलपर या संचालन समिति उत्तरदायी नहीं है। सभी खिलाड़ी स्वेच्छा से अपने स्वयं के जोखिम पर खेलते हैं।",
              fontSize = 11.sp,
              color = MainText,
              lineHeight = 16.sp
            )
          }
        }
      }

      // Legal Card 3: Zero Financial Liability
      item {
        Card(
          colors = CardDefaults.cardColors(containerColor = White),
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier.fillMaxWidth().border(1.dp, BorderColor, RoundedCornerShape(12.dp))
        ) {
          Column(modifier = Modifier.padding(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Text("💰", fontSize = 18.sp)
              Spacer(modifier = Modifier.width(8.dp))
              Text("शून्य वित्तीय मध्यस्थता एवं नकद फीस अस्वीकरण", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = PrimaryGreen)
            }
            Spacer(modifier = Modifier.height(6.dp))
            Text(
              "यह ऐप 100% निःशुल्क है। ऐप में कोई ऑनलाइन पेमेंट गेटवे, वॉलेट या UPI नहीं है। आयोजकों द्वारा ली जाने वाली कोई भी एंट्री फीस (उदा. ₹500 नकद) या घोषित इनाम राशि पूरी तरह से आयोजक और टीमों के बीच का निजी समझौता है। मैच रद्द होने पर फीस वापसी या इनाम भुगतान का ऐप कोई दायित्व नहीं लेता।",
              fontSize = 11.sp,
              color = MainText,
              lineHeight = 16.sp
            )
          }
        }
      }

      // Legal Card 4: Non-Affiliation
      item {
        Card(
          colors = CardDefaults.cardColors(containerColor = White),
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier.fillMaxWidth().border(1.dp, BorderColor, RoundedCornerShape(12.dp))
        ) {
          Column(modifier = Modifier.padding(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Text("🏛️", fontSize = 18.sp)
              Spacer(modifier = Modifier.width(8.dp))
              Text("गैर-संबद्धता अस्वीकरण (Non-Affiliation Notice)", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = DeepForest)
            }
            Spacer(modifier = Modifier.height(6.dp))
            Text(
              "यह प्लेटफ़ॉर्म भदोही जिले के ग्रामीण खेल प्रेमियों द्वारा संचालित एक स्वतंत्र पहल है। इसका भारतीय क्रिकेट नियंत्रण बोर्ड (BCCI), उत्तर प्रदेश क्रिकेट संघ (UPCA), ICC या किसी सरकारी खेल विभाग से कोई आधिकारिक संबंध नहीं है।",
              fontSize = 11.sp,
              color = MainText,
              lineHeight = 16.sp
            )
          }
        }
      }

      // Legal Card 5: Section 79 IT Act Intermediary
      item {
        Card(
          colors = CardDefaults.cardColors(containerColor = White),
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier.fillMaxWidth().border(1.dp, BorderColor, RoundedCornerShape(12.dp))
        ) {
          Column(modifier = Modifier.padding(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Text("🛡️", fontSize = 18.sp)
              Spacer(modifier = Modifier.width(8.dp))
              Text("सूचना प्रौद्योगिकी अधिनियम धारा 79 (मध्यस्थ संरक्षण)", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = DeepForest)
            }
            Spacer(modifier = Modifier.height(6.dp))
            Text(
              "यह मंच केवल डिजिटल सूचना पटल (Intermediary) के रूप में कार्य करता है। टूर्नामेंट की तिथियां, मैदान, संपर्क विवरण आयोजकों द्वारा दर्ज किए जाते हैं। ऐप किसी भी गलत सूचना या मैदान की अनुपलब्धता की गारंटी नहीं देता (AS IS / AS AVAILABLE)।",
              fontSize = 11.sp,
              color = MainText,
              lineHeight = 16.sp
            )
          }
        }
      }

      // Legal Card 6: 18+ Age Policy
      item {
        Card(
          colors = CardDefaults.cardColors(containerColor = White),
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier.fillMaxWidth().border(1.dp, BorderColor, RoundedCornerShape(12.dp))
        ) {
          Column(modifier = Modifier.padding(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Text("🔞", fontSize = 18.sp)
              Spacer(modifier = Modifier.width(8.dp))
              Text("आयु सीमा एवं अभिभावक सहमति (18+ Policy)", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = DeepForest)
            }
            Spacer(modifier = Modifier.height(6.dp))
            Text(
              "यह ऐप केवल 18 वर्ष या उससे अधिक आयु के वयस्कों के लिए है। यदि कोई नाबालिग खिलाड़ी स्थानीय मैच में भाग लेता है, तो यह केवल उसके माता-पिता या अभिभावक की प्रत्यक्ष अनुमति और जिम्मेदारी पर ही संभव है।",
              fontSize = 11.sp,
              color = MainText,
              lineHeight = 16.sp
            )
          }
        }
      }

      // Legal Card 7: Jurisdiction
      item {
        Card(
          colors = CardDefaults.cardColors(containerColor = White),
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier.fillMaxWidth().border(1.dp, BorderColor, RoundedCornerShape(12.dp))
        ) {
          Column(modifier = Modifier.padding(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Text("📍", fontSize = 18.sp)
              Spacer(modifier = Modifier.width(8.dp))
              Text("लागू कानून एवं विधिक न्यायक्षेत्र (Jurisdiction)", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = DeepForest)
            }
            Spacer(modifier = Modifier.height(6.dp))
            Text(
              "सभी विवाद और कानूनी विषय भारत गणराज्य के कानूनों के अधीन हैं और विशेष न्यायक्षेत्र न्यायालय भदोही (ज्ञानपुर) एवं माननीय उच्च न्यायालय इलाहाबाद होगा।",
              fontSize = 11.sp,
              color = MainText,
              lineHeight = 16.sp
            )
          }
        }
      }

      // Button: View Full Legal Document on GitHub
      item {
        OutlinedButton(
          onClick = {
            try {
              val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://github.com/umbind/Bhadohi-Village-Cricket-Platform/blob/main/LEGAL_DISCLAIMER.md"))
              context.startActivity(intent)
            } catch (_: Exception) {
              Toast.makeText(context, "दस्तावेज: LEGAL_DISCLAIMER.md", Toast.LENGTH_SHORT).show()
            }
          },
          shape = RoundedCornerShape(10.dp),
          modifier = Modifier.fillMaxWidth().height(44.dp)
        ) {
          Text("🌐 पूरा विधिक दस्तावेज GitHub पर पढ़ें (LEGAL_DISCLAIMER.md)", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = DeepForest)
        }
      }
    } else {
      // -------------------------------------------------------------
      // SUB-TAB 1: GROUND RULES & SAFETY REPORTING (ग्रामीण नियम)
      // -------------------------------------------------------------
      item {
        Card(
          colors = CardDefaults.cardColors(containerColor = DeepForest),
          shape = RoundedCornerShape(14.dp),
          modifier = Modifier.fillMaxWidth()
        ) {
          Column(modifier = Modifier.padding(14.dp)) {
            Text("📜 भदोही ग्रामीण क्रिकेट - सार्वभौमिक नियम", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = AmberHighlight)
            Spacer(modifier = Modifier.height(6.dp))
            Text("यह प्लेटफ़ॉर्म केवल प्रतियोगिता समन्वय के लिए है। किसी भी प्रकार के ऑनलाइन विवादों और वित्तीय धोखाधड़ी से मुक्त।", fontSize = 12.sp, color = White.copy(alpha = 0.9f))
          }
        }
      }

      // Safety and Misconduct Reporting Banner
      item {
        Card(
          colors = CardDefaults.cardColors(containerColor = Color(0xFFFEF2F2)),
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier.fillMaxWidth().border(1.dp, Color(0xFFEF4444), RoundedCornerShape(12.dp))
        ) {
          Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
          ) {
            Column(modifier = Modifier.weight(1f)) {
              Text("🚨 खेल भावना व सुरक्षा रिपोर्ट", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = Color(0xFF991B1B))
              Text("उम्र फर्जीवाड़ा या मैदान पर विवाद की गोपनीय शिकायत दर्ज करें।", fontSize = 10.sp, color = Color(0xFF7F1D1D))
            }
            Button(
              onClick = { showReportDialog = true },
              colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFDC2626)),
              shape = RoundedCornerShape(8.dp),
              contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
            ) {
              Text("शिकायत करें", fontSize = 10.sp, color = White, fontWeight = FontWeight.Bold)
            }
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
}

// =========================================================================
// 6. LEGAL DISCLAIMERS & LIABILITY WAIVER DIALOG
// =========================================================================
@Composable
fun LegalDisclaimersDialog(onDismiss: () -> Unit) {
  val context = LocalContext.current
  AlertDialog(
    onDismissRequest = onDismiss,
    title = {
      Row(verticalAlignment = Alignment.CenterVertically) {
        Text("⚖️", fontSize = 22.sp)
        Spacer(modifier = Modifier.width(8.dp))
        Text(
          "विधिक अस्वीकरण एवं शर्तें",
          fontSize = 16.sp,
          fontWeight = FontWeight.Bold,
          color = DeepForest
        )
      }
    },
    text = {
      LazyColumn(
        verticalArrangement = Arrangement.spacedBy(10.dp),
        modifier = Modifier.fillMaxWidth()
      ) {
        item {
          Surface(
            color = Color(0xFFFEF2F2),
            shape = RoundedCornerShape(8.dp),
            modifier = Modifier.fillMaxWidth().border(1.dp, Color(0xFFEF4444), RoundedCornerShape(8.dp))
          ) {
            Column(modifier = Modifier.padding(10.dp)) {
              Text("🚫 सट्टेबाजी एवं जुआ पूर्णतः निषेध", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = Color(0xFF991B1B))
              Spacer(modifier = Modifier.height(2.dp))
              Text("उत्तर प्रदेश पब्लिक गैंबलिंग एक्ट 1961 के तहत इस ऐप पर किसी भी प्रकार का सट्टा, जुआ, कैश दांव या मैच-फिक्सिंग सख्त वर्जित है। ऐप केवल खेल समन्वय मंच है। मैदान पर कोई अवैध सट्टेबाजी करता है तो वह स्वयं कानूनी रूप से जिम्मेदार होगा।", fontSize = 10.sp, color = Color(0xFF7F1D1D), lineHeight = 14.sp)
            }
          }
        }
        item {
          Surface(
            color = Color(0xFFFFFBEB),
            shape = RoundedCornerShape(8.dp),
            modifier = Modifier.fillMaxWidth().border(1.dp, Color(0xFFF59E0B), RoundedCornerShape(8.dp))
          ) {
            Column(modifier = Modifier.padding(10.dp)) {
              Text("🏥 शारीरिक चोट व स्वास्थ्य जोखिम (Volenti Non Fit Injuria)", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = Color(0xFF92400E))
              Spacer(modifier = Modifier.height(2.dp))
              Text("क्रिकेट एक जोखिम भरा खेल है। लेदर, भारी टेनिस या कॉस्को बॉल, बैट, शारीरिक टक्कर या मैदान की स्थिति से खिलाड़ी, दर्शक या अंपायर को लगने वाली किसी भी चोट, फ्रैक्चर, अस्पताल खर्च या अनहोनी के लिए यह ऐप, डेवलपर या संचालन समिति उत्तरदायी नहीं है। सभी खिलाड़ी अपने स्वयं के जोखिम पर भाग लेते हैं।", fontSize = 10.sp, color = Color(0xFF78350F), lineHeight = 14.sp)
            }
          }
        }
        item {
          Surface(
            color = Color(0xFFF0FDF4),
            shape = RoundedCornerShape(8.dp),
            modifier = Modifier.fillMaxWidth().border(1.dp, PrimaryGreen, RoundedCornerShape(8.dp))
          ) {
            Column(modifier = Modifier.padding(10.dp)) {
              Text("💰 शून्य वित्तीय मध्यस्थता एवं नकद फीस", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = Color(0xFF166534))
              Spacer(modifier = Modifier.height(2.dp))
              Text("यह ऐप 100% निःशुल्क है। ऐप में कोई ऑनलाइन भुगतान या वॉलेट नहीं है। आयोजकों द्वारा ली जाने वाली एंट्री फीस या घोषित इनाम राशि पूरी तरह से आयोजक और संबंधित टीमों के बीच का निजी समझौता है। मैच रद्द होने पर फीस वापसी या इनाम के भुगतान की गारंटी ऐप नहीं देता।", fontSize = 10.sp, color = Color(0xFF14532D), lineHeight = 14.sp)
            }
          }
        }
        item {
          Surface(
            color = Color(0xFFF8FAFC),
            shape = RoundedCornerShape(8.dp),
            modifier = Modifier.fillMaxWidth().border(1.dp, BorderColor, RoundedCornerShape(8.dp))
          ) {
            Column(modifier = Modifier.padding(10.dp)) {
              Text("🏛️ गैर-संबद्धता (Non-Affiliation Notice)", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = MainText)
              Spacer(modifier = Modifier.height(2.dp))
              Text("यह भदोही जिले के ग्रामीण खिलाड़ियों का स्वतंत्र मंच है। इसका BCCI, UPCA, ICC या किसी सरकारी खेल विभाग से कोई आधिकारिक संबंध नहीं है।", fontSize = 10.sp, color = MutedText, lineHeight = 14.sp)
            }
          }
        }
        item {
          Surface(
            color = Color(0xFFF8FAFC),
            shape = RoundedCornerShape(8.dp),
            modifier = Modifier.fillMaxWidth().border(1.dp, BorderColor, RoundedCornerShape(8.dp))
          ) {
            Column(modifier = Modifier.padding(10.dp)) {
              Text("⚖️ सूचना प्रौद्योगिकी अधिनियम धारा 79 (मध्यस्थ दर्जा)", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = MainText)
              Spacer(modifier = Modifier.height(2.dp))
              Text("यह मंच केवल डिजिटल सूचना पटल (Intermediary) है। टूर्नामेंट व मैच विवरण आयोजकों द्वारा दर्ज किया जाता है। ऐप किसी भी गलत सूचना या मैदान की अनुपलब्धता की गारंटी नहीं देता (AS IS)।", fontSize = 10.sp, color = MutedText, lineHeight = 14.sp)
            }
          }
        }
        item {
          Surface(
            color = Color(0xFFF8FAFC),
            shape = RoundedCornerShape(8.dp),
            modifier = Modifier.fillMaxWidth().border(1.dp, BorderColor, RoundedCornerShape(8.dp))
          ) {
            Column(modifier = Modifier.padding(10.dp)) {
              Text("📍 न्यायक्षेत्र एवं लागू कानून", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = MainText)
              Spacer(modifier = Modifier.height(2.dp))
              Text("सभी विवाद और कानूनी मामले भारत गणराज्य के कानूनों के अधीन हैं और विशेष न्यायक्षेत्र न्यायालय भदोही (ज्ञानपुर) एवं उच्च न्यायालय इलाहाबाद होगा।", fontSize = 10.sp, color = MutedText, lineHeight = 14.sp)
            }
          }
        }
        item {
          OutlinedButton(
            onClick = {
              try {
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://github.com/umbind/Bhadohi-Village-Cricket-Platform/blob/main/LEGAL_DISCLAIMER.md"))
                context.startActivity(intent)
              } catch (_: Exception) {}
            },
            modifier = Modifier.fillMaxWidth()
          ) {
            Text("🌐 पूरा विधिक दस्तावेज (GitHub पर देखें)", fontSize = 11.sp, color = DeepForest, fontWeight = FontWeight.Bold)
          }
        }
      }
    },
    confirmButton = {
      Button(
        onClick = onDismiss,
        colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)
      ) {
        Text("मैं सहमत हूँ", color = White, fontWeight = FontWeight.Bold)
      }
    }
  )
}
