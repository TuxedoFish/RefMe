# On windows

1. Navigate to node_modules/metro-config/src/defaults/blacklist.js

2. Replace the section with this:

```
var sharedBlacklist = [
/node_modules[\/\\]react[\/\\]dist[\/\\].*/,
/website\/node_modules\/.*/,
/heapCapture\/bundle\.js/,
/.*\/__tests__\/.*/
];
```

# To run

Notes: Requires internet accesss

1. Connect Android device 

2. Run in a command prompt:

```adb devices```

3. Run in a command prompt:

```npx react-native run-android```

# To publish to Android:

1. Generate a keystore

2. Add the keystore to the project

3a. Navigate to android/app/build.gradle

3b. Find android { defaultConfig {} }

3c. Change the version code and name

4a. Navigate into android/

4b. Run in a command prompt:

```./gradlew assembleRelease```

5. Navigate to android/app/build/outputs/app/app-release.apk

# Notes on react-native-pdf

Changes made to extract meta data from the onLoadComplete function

Fork repo and create a version for the app

Adds in authors for ~50% of the resources

Also adds in true creation and last modified dates

Gather metadata and put into a redux object

Add to this when document is viewed -> Use in future in references & search

(For future add this into search too? - take out author tag)