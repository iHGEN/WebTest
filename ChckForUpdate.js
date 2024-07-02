const versionKey = 'GameVersion';
const dbName = 'AraiCache';
const storeName = 'Version';
const newVersion = '1.0.0'; 

async function getDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName);
            }
        };
    });
}

async function getStoredVersion() {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(versionKey);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

async function storeVersion(version) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(version, versionKey);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

async function clearCache() {
    if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
            await caches.delete(name).then(function(success){
                if (success) {
                    console.log(cacheName + " cache cleared successfully.");
                } else {
                    console.error("Failed to clear " + cacheName + " cache.");
                }
            });
        }
    }
}

async function checkAndUpdateCache(version) {
    try {
        const storedVersion = await getStoredVersion();
        if (storedVersion !== version) {
            await clearCache();
            await storeVersion(version);
            console.log('Cache cleared and new version stored:', version);
        } else {
            console.log('Version is up-to-date:', version);
        }
    } catch (error) {
        console.error('Error updating cache:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkAndUpdateCache(newVersion);
});
