import time
import firebase_admin
from firebase_admin import credentials, db
import yagmail

# =========================
# FIREBASE SETUP
# =========================

cred = credentials.Certificate("serviceAccountKey.json")

firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://smart-bin-system-71b37-default-rtdb.firebaseio.com/'
})

# =========================
# EMAIL CONFIGURATION
# =========================

SENDER_EMAIL = "smartbinsystem20@gmail.com"

# USE GOOGLE APP PASSWORD HERE
SENDER_PASSWORD = "zusb pnzs pzxx hdbd"

yag = yagmail.SMTP(
    user=SENDER_EMAIL,
    password=SENDER_PASSWORD
)

# =========================
# ALERT RECEIVERS
# =========================

RECIPIENT_EMAILS = [
    "operator1@cihe.edu.au",
    "manager2@cihe.edu.au"
]

# =========================
# ANTI-SPAM LOCK
# =========================

last_emailed_status = ""

# =========================
# FIREBASE LISTENER
# =========================

def check_bin_status(event):

    global last_emailed_status

    try:

        data = event.data

        # Ignore empty updates
        if not isinstance(data, dict):
            return

        # Read values safely
        bin_id = data.get("binId", "Unknown Asset")
        location = data.get("location", "Unknown Location")
        status = data.get("status", "Normal")
        distance = data.get("distance", 0)
        is_faulty = data.get("isFaulty", False)

        # Final state logic
        current_status = "Faulty" if is_faulty else status

        print("\n========================")
        print("NEW FIREBASE UPDATE")
        print(data)
        print("========================")

        # SEND EMAIL ONLY ON STATUS CHANGE
        if (
            current_status in ["Warning", "Critical", "Faulty"]
            and current_status != last_emailed_status
        ):

            print(f"Sending alert email for {current_status}...")

            subject = f"🚨 CIHE SMART BIN ALERT: {bin_id} is {current_status.upper()}"

            body = f"""
            Smart Waste Management Alert

            Bin ID: {bin_id}
            Location: {location}
            Status: {current_status}
            Distance: {distance} cm

            Please check the dashboard immediately.
            """

            yag.send(
                to=RECIPIENT_EMAILS,
                subject=subject,
                contents=body
            )

            print(f"✅ Alert email successfully sent for {current_status}")

            # LOCK STATUS
            last_emailed_status = current_status

        # RESET LOCK WHEN NORMAL
        elif current_status == "Normal":

            last_emailed_status = ""

            print("System reset to NORMAL")

    except Exception as e:

        print("\n❌ ERROR INSIDE FIREBASE LISTENER")
        print(e)

# =========================
# START REALTIME LISTENER
# =========================

db.reference("smartbin").listen(check_bin_status)

print("🚀 Background IoT Automation Server is running...")

# KEEP SERVER RUNNING
while True:
    time.sleep(1)
