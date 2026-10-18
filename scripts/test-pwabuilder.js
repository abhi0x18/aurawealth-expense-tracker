const fs = require('fs');

async function testEndpoint() {
  const payload = {
    additionalTrustedOrigins: [],
    appVersion: "1.0.0.0",
    appVersionCode: 1,
    backgroundColor: "#070A07",
    themeColor: "#10B981",
    display: "standalone",
    enableNotifications: false,
    enableSiteSettingsShortcut: true,
    fallbackType: "customtabs",
    features: {
      locationDelegation: { enabled: true },
      playBilling: { enabled: false }
    },
    host: "https://personalexpense-bay.vercel.app",
    iconUrl: "https://personalexpense-bay.vercel.app/icons/icon-512.png",
    includeSourceCode: false,
    name: "AuraWealth 3D",
    launcherName: "AuraWealth",
    packageId: "com.aurawealth.app",
    webManifestUrl: "https://personalexpense-bay.vercel.app/manifest.json"
  };

  console.log("Sending request to PWABuilder cloud backend...");
  try {
    const res = await fetch("https://pwabuilder-google-play.azurewebsites.net/generateAppPackage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    console.log("Status:", res.status, res.statusText);
    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync("android-package.zip", buffer);
      console.log("Success! Saved android-package.zip of size:", buffer.length);
    } else {
      const text = await res.text();
      console.log("Error response:", text.slice(0, 500));
    }
  } catch (err) {
    console.error("Fetch error:", err.message);
  }
}

testEndpoint();
