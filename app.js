// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// TODO: Replace with your specific Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC1tfxGaRFLvlfeWSTXqpIQV_a1CmOakhQ",
  authDomain: "wedding-rsvp-19062026.firebaseapp.com",
  projectId: "wedding-rsvp-19062026",
  storageBucket: "wedding-rsvp-19062026.firebasestorage.app",
  messagingSenderId: "285063942294",
  appId: "1:285063942294:web:479c8fc7dcb074ce8272b7",
  measurementId: "G-SZ2PSDY377"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- FORM LOGIC ---

const addGuestBtn = document.getElementById('addGuestBtn');
const extraGuestsContainer = document.getElementById('extraGuestsContainer');
let guestCount = 0;

// Add Extra Guest Fields
addGuestBtn.addEventListener('click', () => {
    if (guestCount >= 4) {
        alert("Maximum 4 extra guests allowed.");
        return;
    }
    guestCount++;
    
    const div = document.createElement('div');
    div.classList.add('guest-entry');
    div.innerHTML = `
        <h4>Guest ${guestCount}</h4>
        <div class="form-group">
            <input type="text" class="guest-name" placeholder="Name" required>
            <input type="text" class="guest-surname" placeholder="Surname" required>
        </div>
        <div class="form-group">
            <select class="guest-diet">
                <option value="None">Diet: None</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Gluten Free">Gluten Free</option>
                <option value="Other">Other</option>
            </select>
        </div>
        <input type="text" class="guest-details" placeholder="Allergies / Details">
    `;
    extraGuestsContainer.appendChild(div);
});

// Handle Submit
document.getElementById('weddingForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.textContent = "Sending...";
    submitBtn.disabled = true;

    // Collect Main Guest Data
    const mainGuest = {
        name: document.getElementById('mainName').value,
        surname: document.getElementById('mainSurname').value,
        diet: document.getElementById('mainDiet').value,
        details: document.getElementById('mainDietDetails').value,
        email: document.getElementById('mainEmail').value,
        type: 'Main'
    };

    // Collect Extra Guests Data
    const extraGuestsDivs = document.querySelectorAll('.guest-entry');
    let allGuests = [mainGuest];

    extraGuestsDivs.forEach(div => {
        allGuests.push({
            name: div.querySelector('.guest-name').value,
            surname: div.querySelector('.guest-surname').value,
            diet: div.querySelector('.guest-diet').value,
            details: div.querySelector('.guest-details').value,
            email: "N/A (Linked to Main)",
            type: 'Extra',
            linkedTo: mainGuest.name + ' ' + mainGuest.surname
        });
    });

    try {
        // Save to Firebase
        // We create a "Group" submission
        await addDoc(collection(db, "rsvps"), {
            mainContact: mainGuest.name + ' ' + mainGuest.surname,
            email: mainGuest.email,
            guests: allGuests,
            timestamp: new Date()
        });

        // Send Email via EmailJS
        // Note: You need to setup EmailJS separately or remove this block if not used
        const emailParams = {
            to_email: mainGuest.email,
            to_name: mainGuest.name,
            guest_count: allGuests.length
        };
        
        // Uncomment below once you have EmailJS Service ID and Template ID
        await emailjs.send(service_wedding2026, template_jk4uo01, emailParams);

        alert("Thank you! You have joined the party.");
        window.location.reload();

    } catch (error) {
        console.error("Error adding document: ", error);
        alert("Something went wrong. Please try again.");
        submitBtn.textContent = "Join the Party";
        submitBtn.disabled = false;
    }

});
