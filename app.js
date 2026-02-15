// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// --- 1. FIREBASE CONFIGURATION (ORIGINAL) ---
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

// --- 2. GLOBAL HELPERS (ORIGINAL) ---
window.flipCard = function(cardElement) {
    cardElement.classList.toggle('flipped');
};

// --- 3. LANGUAGE SWITCHER LOGIC (NEW INTEGRATION) ---
window.setLanguage = function(lang) {
    document.querySelectorAll(`[data-${lang}]`).forEach(el => {
        // Handle input placeholders
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = el.getAttribute(`data-${lang}`);
        } 
        // Handle select options
        else if (el.tagName === 'OPTION') {
            el.text = el.getAttribute(`data-${lang}`);
        } 
        // Handle standard text elements
        else {
            el.innerHTML = el.getAttribute(`data-${lang}`);
        }
    });
    // Save preference so it persists on refresh
    localStorage.setItem('weddingLang', lang);
};

// --- 4. DOM LOGIC ---
document.addEventListener('DOMContentLoaded', () => {

    // Initialize language from storage or default to English
    const savedLang = localStorage.getItem('weddingLang') || 'en';
    setLanguage(savedLang);

    // ==========================================
    // A. MAIN WEDDING RSVP FORM LOGIC (ORIGINAL)
    // ==========================================
    const rsvpAddGuestBtn = document.getElementById('addGuestBtn');
    const rsvpExtraGuestsContainer = document.getElementById('extraGuestsContainer');
    let rsvpGuestCount = 0;

    if (rsvpAddGuestBtn && rsvpExtraGuestsContainer) {
        rsvpAddGuestBtn.addEventListener('click', () => {
            if (rsvpGuestCount >= 4) {
                alert("Maximum 4 extra guests allowed.");
                return;
            }
            rsvpGuestCount++;
            
            const div = document.createElement('div');
            div.classList.add('guest-entry');
            // Integrated translation attributes into the dynamic HTML
            div.innerHTML = `
                <h4 data-en="Guest ${rsvpGuestCount}" data-it="Ospite ${rsvpGuestCount}">Guest ${rsvpGuestCount}</h4>
                <div class="form-group">
                    <input type="text" class="guest-name" placeholder="Name" data-en="Name" data-it="Nome" required>
                    <input type="text" class="guest-surname" placeholder="Surname" data-en="Surname" data-it="Cognome" required>
                </div>
                <div class="form-group">
                    <select class="guest-diet">
                        <option value="None" data-en="Diet: None" data-it="Dieta: Nessuna">Diet: None</option>
                        <option value="Vegetarian" data-en="Vegetarian" data-it="Vegetariano">Vegetarian</option>
                        <option value="Vegan" data-en="Vegan" data-it="Vegano">Vegan</option>
                        <option value="Gluten Free" data-en="Gluten Free" data-it="Senza Glutine">Gluten Free</option>
                        <option value="Other" data-en="Other" data-it="Altro">Other</option>
                    </select>
                </div>
                <input type="text" class="guest-details" placeholder="Allergies / Details" data-en="Allergies / Details" data-it="Allergie / Dettagli">
            `;
            rsvpExtraGuestsContainer.appendChild(div);
            
            // Re-run language check to translate the newly added guest fields
            setLanguage(localStorage.getItem('weddingLang') || 'en');
        });
    }

    const weddingForm = document.getElementById('weddingForm');
    if (weddingForm) {
        weddingForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = weddingForm.querySelector('.submit-btn');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = "Sending...";
            submitBtn.disabled = true;

            const mainGuest = {
                name: document.getElementById('mainName').value,
                surname: document.getElementById('mainSurname').value,
                diet: document.getElementById('mainDiet').value,
                details: document.getElementById('mainDietDetails').value,
                email: document.getElementById('mainEmail').value,
                type: 'Main'
            };

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
                // Save to Firebase (ORIGINAL)
                await addDoc(collection(db, "rsvps"), {
                    mainContact: mainGuest.name + ' ' + mainGuest.surname,
                    email: mainGuest.email,
                    guests: allGuests,
                    timestamp: new Date()
                });

                // EmailJS Integration (ORIGINAL)
                if (window.emailjs) {
                    const emailParams = {
                        to_email: mainGuest.email,
                        to_name: mainGuest.name,
                        guest_count: allGuests.length
                    };
                    await emailjs.send('service_wedding2026', 'template_jk4uo01', emailParams);
                }

                alert("Thank you! You have joined the party.");
                window.location.reload();

            } catch (error) {
                console.error("Error adding document: ", error);
                alert("Something went wrong. Please try again.");
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

    // ==========================================
    // B. BUS RESERVATION FORM LOGIC (ORIGINAL)
    // ==========================================
    const busAddGuestBtn = document.getElementById('busAddGuestBtn'); 
    const busGuestsContainer = document.getElementById('busGuestsContainer');
    let busGuestCount = 0;

    if(busAddGuestBtn && busGuestsContainer) {
        busAddGuestBtn.addEventListener('click', () => {
            if (busGuestCount < 4) {
                busGuestCount++;
                const div = document.createElement('div');
                div.classList.add('form-group');
                // Integrated translation attributes
                div.innerHTML = `
                    <label data-en="Guest ${busGuestCount} Name" data-it="Nome Ospite ${busGuestCount}">Guest ${busGuestCount} Name</label>
                    <input type="text" name="guest${busGuestCount}_name" placeholder="Name" data-en="Name" data-it="Nome">
                    <input type="text" name="guest${busGuestCount}_surname" placeholder="Surname" data-en="Surname" data-it="Cognome" style="margin-top:5px;">
                `;
                busGuestsContainer.appendChild(div);
                
                // Translate the new labels/placeholders
                setLanguage(localStorage.getItem('weddingLang') || 'en');

                if (busGuestCount === 4) {
                    busAddGuestBtn.style.display = 'none';
                }
            }
        });
    }

    const busForm = document.getElementById('busForm');
    if(busForm) {
        busForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(busForm);
            const guests = [];
            for (let i = 1; i <= busGuestCount; i++) {
                const gName = formData.get(`guest${i}_name`);
                const gSurname = formData.get(`guest${i}_surname`);
                if(gName && gSurname) {
                    guests.push({ name: gName, surname: gSurname });
                }
            }

            const reservationData = {
                mainGuest: { name: formData.get('name'), surname: formData.get('surname') },
                additionalGuests: guests,
                totalSeats: 1 + guests.length,
                timestamp: new Date()
            };

            try {
                await addDoc(collection(db, "bus_reservations"), reservationData);
                alert("Bus reservation sent successfully!");
                busForm.reset();
                busGuestsContainer.innerHTML = '';
                busGuestCount = 0;
                busAddGuestBtn.style.display = 'inline-block';
            } catch (error) {
                console.error("Error adding bus reservation: ", error);
                alert("Error sending reservation.");
            }
        });
    }
});