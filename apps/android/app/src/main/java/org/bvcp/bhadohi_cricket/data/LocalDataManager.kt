package org.bvcp.bhadohi_cricket.data

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

data class StoredTournament(
  val id: String,
  val title: String,
  val organizerName: String = "स्थानीय खेल समिति",
  val block: String,
  val ground: String,
  val dates: String,
  val maxTeams: Int,
  val entryNotice: String,
  val status: String,
  val ballType: String = "टेनिस बॉल",
  val overs: Int = 12,
  val organizerContact: String = "98XXXXXX21"
)

data class StoredSquadMember(
  val id: String,
  val name: String,
  val role: String,
  val village: String,
  val maskedPhone: String
)

data class StoredTeam(
  val id: String,
  val teamName: String,
  val tournamentId: String,
  val tournamentTitle: String,
  val village: String,
  val block: String,
  val captainName: String,
  val status: String,
  val members: List<StoredSquadMember>
)

data class StoredPlayerProfile(
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

data class StoredMatchFixture(
  val id: String,
  val tournamentTitle: String,
  val matchRound: String,
  val team1: String,
  val team2: String,
  val date: String,
  val time: String,
  val ground: String,
  val groundLandmark: String = "ज्ञानपुर-औराई मार्ग, भदोही",
  val overs: String = "12 ओवर्स",
  val ballType: String = "टेनिस बॉल",
  val pitchStatus: String = "☀️ पिच सूखी है • समय पर टॉस होगा"
)

data class StoredInvitation(
  val id: String,
  val teamName: String,
  val captainName: String,
  val tournamentTitle: String,
  val ground: String,
  val roleOffered: String,
  val status: String // "PENDING", "ACCEPTED", "DECLINED"
)

object LocalDataManager {
  private const val PREFS_NAME = "bvcp_offline_data"
  private const val KEY_PROFILE = "user_profile"
  private const val KEY_TEAMS = "user_teams"
  private const val KEY_TOURNAMENTS = "tournaments_list"
  private const val KEY_INVITATIONS = "invitations_list"

  fun saveProfile(context: Context, profile: StoredPlayerProfile) {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val json = JSONObject().apply {
      put("fullName", profile.fullName)
      put("mobile", profile.mobile)
      put("maskedMobile", profile.maskedMobile)
      put("village", profile.village)
      put("block", profile.block)
      put("role", profile.role)
      put("battingStyle", profile.battingStyle)
      put("bowlingStyle", profile.bowlingStyle)
      put("recoveryCode", profile.recoveryCode)
      put("isAvailable", profile.isAvailable)
      put("allowWhatsapp", profile.allowWhatsapp)
    }
    prefs.edit().putString(KEY_PROFILE, json.toString()).apply()
  }

  fun loadProfile(context: Context): StoredPlayerProfile? {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val raw = prefs.getString(KEY_PROFILE, null) ?: return null
    return try {
      val json = JSONObject(raw)
      StoredPlayerProfile(
        fullName = json.getString("fullName"),
        mobile = json.getString("mobile"),
        maskedMobile = json.getString("maskedMobile"),
        village = json.getString("village"),
        block = json.getString("block"),
        role = json.getString("role"),
        battingStyle = json.getString("battingStyle"),
        bowlingStyle = json.getString("bowlingStyle"),
        recoveryCode = json.getString("recoveryCode"),
        isAvailable = json.optBoolean("isAvailable", true),
        allowWhatsapp = json.optBoolean("allowWhatsapp", true)
      )
    } catch (_: Exception) {
      null
    }
  }

  fun clearProfile(context: Context) {
    context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .remove(KEY_PROFILE)
      .apply()
  }

  fun saveTeams(context: Context, teams: List<StoredTeam>) {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val array = JSONArray()
    for (t in teams) {
      val obj = JSONObject().apply {
        put("id", t.id)
        put("teamName", t.teamName)
        put("tournamentId", t.tournamentId)
        put("tournamentTitle", t.tournamentTitle)
        put("village", t.village)
        put("block", t.block)
        put("captainName", t.captainName)
        put("status", t.status)
        val membersArr = JSONArray()
        for (m in t.members) {
          membersArr.put(JSONObject().apply {
            put("id", m.id)
            put("name", m.name)
            put("role", m.role)
            put("village", m.village)
            put("maskedPhone", m.maskedPhone)
          })
        }
        put("members", membersArr)
      }
      array.put(obj)
    }
    prefs.edit().putString(KEY_TEAMS, array.toString()).apply()
  }

  fun loadTeams(context: Context): List<StoredTeam> {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val raw = prefs.getString(KEY_TEAMS, null) ?: return emptyList()
    val list = mutableListOf<StoredTeam>()
    try {
      val array = JSONArray(raw)
      for (i in 0 until array.length()) {
        val obj = array.getJSONObject(i)
        val membersList = mutableListOf<StoredSquadMember>()
        val membersArr = obj.optJSONArray("members")
        if (membersArr != null) {
          for (j in 0 until membersArr.length()) {
            val m = membersArr.getJSONObject(j)
            membersList.add(
              StoredSquadMember(
                id = m.getString("id"),
                name = m.getString("name"),
                role = m.getString("role"),
                village = m.getString("village"),
                maskedPhone = m.getString("maskedPhone")
              )
            )
          }
        }
        list.add(
          StoredTeam(
            id = obj.getString("id"),
            teamName = obj.getString("teamName"),
            tournamentId = obj.getString("tournamentId"),
            tournamentTitle = obj.getString("tournamentTitle"),
            village = obj.getString("village"),
            block = obj.getString("block"),
            captainName = obj.getString("captainName"),
            status = obj.getString("status"),
            members = membersList
          )
        )
      }
    } catch (_: Exception) {}
    return list
  }

  fun saveTournaments(context: Context, tournaments: List<StoredTournament>) {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val array = JSONArray()
    for (t in tournaments) {
      val obj = JSONObject().apply {
        put("id", t.id)
        put("title", t.title)
        put("organizerName", t.organizerName)
        put("block", t.block)
        put("ground", t.ground)
        put("dates", t.dates)
        put("maxTeams", t.maxTeams)
        put("entryNotice", t.entryNotice)
        put("status", t.status)
        put("ballType", t.ballType)
        put("overs", t.overs)
        put("organizerContact", t.organizerContact)
      }
      array.put(obj)
    }
    prefs.edit().putString(KEY_TOURNAMENTS, array.toString()).apply()
  }

  fun loadTournaments(context: Context): List<StoredTournament> {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val raw = prefs.getString(KEY_TOURNAMENTS, null) ?: return emptyList()
    val list = mutableListOf<StoredTournament>()
    try {
      val array = JSONArray(raw)
      for (i in 0 until array.length()) {
        val obj = array.getJSONObject(i)
        list.add(
          StoredTournament(
            id = obj.getString("id"),
            title = obj.getString("title"),
            organizerName = obj.optString("organizerName", "स्थानीय खेल समिति"),
            block = obj.getString("block"),
            ground = obj.getString("ground"),
            dates = obj.getString("dates"),
            maxTeams = obj.optInt("maxTeams", 16),
            entryNotice = obj.optString("entryNotice", "मैदान पर नकद"),
            status = obj.optString("status", "पंजीकरण खुला"),
            ballType = obj.optString("ballType", "टेनिस बॉल"),
            overs = obj.optInt("overs", 12),
            organizerContact = obj.optString("organizerContact", "98XXXXXX21")
          )
        )
      }
    } catch (_: Exception) {}
    return list
  }

  fun saveInvitations(context: Context, invites: List<StoredInvitation>) {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val array = JSONArray()
    for (inv in invites) {
      val obj = JSONObject().apply {
        put("id", inv.id)
        put("teamName", inv.teamName)
        put("captainName", inv.captainName)
        put("tournamentTitle", inv.tournamentTitle)
        put("ground", inv.ground)
        put("roleOffered", inv.roleOffered)
        put("status", inv.status)
      }
      array.put(obj)
    }
    prefs.edit().putString(KEY_INVITATIONS, array.toString()).apply()
  }

  fun loadInvitations(context: Context): List<StoredInvitation> {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val raw = prefs.getString(KEY_INVITATIONS, null) ?: return emptyList()
    val list = mutableListOf<StoredInvitation>()
    try {
      val array = JSONArray(raw)
      for (i in 0 until array.length()) {
        val obj = array.getJSONObject(i)
        list.add(
          StoredInvitation(
            id = obj.getString("id"),
            teamName = obj.getString("teamName"),
            captainName = obj.getString("captainName"),
            tournamentTitle = obj.getString("tournamentTitle"),
            ground = obj.getString("ground"),
            roleOffered = obj.getString("roleOffered"),
            status = obj.optString("status", "PENDING")
          )
        )
      }
    } catch (_: Exception) {}
    return list
  }
}
