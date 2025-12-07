import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// PASTE YOUR FIREBASE CONFIG HERE AGAIN
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

async function loadGuests() {
    const q = query(collection(db, "rsvps"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    
    const tbody = document.getElementById('guestListBody');
    let totalGuests = 0;
    
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const mainContact = data.mainContact;
        const mainEmail = data.email;

        // Loop through the array of guests in this submission
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
    });

    document.getElementById('totalCount').innerText = `Total Guests: ${totalGuests}`;
}

// Function to download CSV
window.exportTableToExcel = function(tableID) {
    let downloadLink;
    let dataType = 'application/vnd.ms-excel';
    let tableSelect = document.getElementById(tableID);
    let tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');
    
    let filename = 'Wedding_Guests.xls';
    downloadLink = document.createElement("a");
    document.body.appendChild(downloadLink);
    
    if(navigator.msSaveOrOpenBlob){
        var blob = new Blob(['\ufeff', tableHTML], {
            type: dataType
        });
        navigator.msSaveOrOpenBlob( blob, filename);
    } else {
        downloadLink.href = 'data:' + dataType + ', ' + tableHTML;
        downloadLink.download = filename;
        downloadLink.click();
    }
}

// Load guests when page loads
loadGuests();