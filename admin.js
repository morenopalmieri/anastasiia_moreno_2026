import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyC1tfxGaRFLvlfeWSTXqpIQV_a1CmOakhQ",
    authDomain: "wedding-rsvp-19062026.firebaseapp.com",
    projectId: "wedding-rsvp-19062026",
    storageBucket: "wedding-rsvp-19062026.firebasestorage.app",
    messagingSenderId: "285063942294",
    appId: "1:285063942294:web:479c8fc7dcb074ce8272b7",
    measurementId: "G-SZ2PSDY377"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- FUNCTION 1: LOAD MAIN GUEST LIST ---
async function loadGuests() {
    const tbody = document.getElementById('guestListBody');
    if (!tbody) return;

    const q = query(collection(db, "rsvps"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    
    let totalGuests = 0;
    tbody.innerHTML = ''; 

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const mainContact = data.mainContact;
        const mainEmail = data.email;

        if (data.guests && Array.isArray(data.guests)) {
            data.guests.forEach(guest => {
                totalGuests++;
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${mainContact}</td>
                    <td>${mainEmail}</td>
                    <td>${guest.name} ${guest.surname} (${guest.type})</td>
                    <td>${guest.diet}</td>
                    <td>${guest.details || '-'}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    });

    const countElement = document.getElementById('totalCount');
    if (countElement) {
        countElement.innerText = `Total Guests: ${totalGuests}`;
    }
}

// --- FUNCTION 2: LOAD BUS RESERVATIONS ---
async function loadBusReservations() {
    const busTableBody = document.getElementById('busTableBody');
    if (!busTableBody) return;

    const q = query(collection(db, "bus_reservations"), orderBy("timestamp", "desc"));
    
    try {
        const querySnapshot = await getDocs(q);
        busTableBody.innerHTML = ''; 

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const row = document.createElement('tr');

            const mainName = data.mainGuest ? `${data.mainGuest.name} ${data.mainGuest.surname}` : 'Unknown';

            let guestsList = "None";
            if (data.additionalGuests && data.additionalGuests.length > 0) {
                guestsList = data.additionalGuests.map(g => `${g.name} ${g.surname}`).join(", ");
            }

            const seats = data.totalSeats || (1 + (data.additionalGuests ? data.additionalGuests.length : 0));

            row.innerHTML = `
                <td>${mainName}</td>
                <td>${guestsList}</td>
                <td>${seats}</td>
            `;
            busTableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading bus reservations:", error);
    }
}

// --- UTILITY: EXPORT TO EXCEL ---
window.exportTableToExcel = function(tableID, filename = 'Wedding_Data.xls') {
    const tableSelect = document.getElementById(tableID);
    const tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');
    
    const downloadLink = document.createElement("a");
    document.body.appendChild(downloadLink);
    
    downloadLink.href = 'data:application/vnd.ms-excel,' + tableHTML;
    downloadLink.download = filename;
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

// --- STARTUP: RUN LOADERS ---
// This ensures data is fetched when the page opens
loadGuests();
loadBusReservations();