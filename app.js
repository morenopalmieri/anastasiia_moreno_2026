// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase Config
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

// --- GLOBAL HELPERS ---
// We attach this to 'window' so the HTML onclick="flipCard(this)" can find it
window.flipCard = function(cardElement) {
    cardElement.classList.toggle('flipped');
};

// --- DOM LOGIC ---
document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. MAIN WEDDING RSVP FORM LOGIC
    // ==========================================
    const rsvpAddGuestBtn = document.getElementById('addGuestBtn'); // The button in your main RSVP form
    const rsvpExtraGuestsContainer = document.getElementById('extraGuestsContainer');
    let rsvpGuestCount = 0;

    // Add Extra Guest Fields (RSVP)
    if (rsvpAddGuestBtn && rsvpExtraGuestsContainer) {
        rsvpAddGuestBtn.addEventListener('click', () => {
            if (rsvpGuestCount >= 4) {
                alert("Maximum 4 extra guests allowed.");
                return;
            }
            rsvpGuestCount++;
            
            const div = document.createElement('div');
            div.classList.add('guest-entry');
            div.innerHTML = `
                <h4 data-en="Guest ${rsvpGuestCount}" data-it="Ospite ${rsvpGuestCount}">Guest ${rsvpGuestCount}</h4>
                <div class="form-group">
                    <input type="text" class="guest-name" placeholder="Name" required data-en="Name" data-it="Nome">
                    <input type="text" class="guest-surname" placeholder="Surname" required data-en="Surname" data-it="Cognome">
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

            // Re-apply language translations to newly generated fields
            setLanguage(localStorage.getItem('weddingLang') || 'en');
        });
    }

    // Handle RSVP Submit
    const weddingForm = document.getElementById('weddingForm');
    if (weddingForm) {
        weddingForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = weddingForm.querySelector('.submit-btn');
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
                // Save to Firebase (v9 syntax)
                await addDoc(collection(db, "rsvps"), {
                    mainContact: mainGuest.name + ' ' + mainGuest.surname,
                    email: mainGuest.email,
                    guests: allGuests,
                    timestamp: new Date()
                });

                // Send Email via EmailJS (Ensure window.emailjs is available)
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
                submitBtn.textContent = "Join the Party";
                submitBtn.disabled = false;
            }
        });
    }

    // ==========================================
    // 2. BUS RESERVATION FORM LOGIC
    // ==========================================
    
    // Note: I renamed these IDs to avoid conflict with the RSVP form.
    // YOU MUST UPDATE YOUR HTML TO MATCH THESE IDS (See Step 2 below)
    const busAddGuestBtn = document.getElementById('busAddGuestBtn'); 
    const busGuestsContainer = document.getElementById('busGuestsContainer');
    let busGuestCount = 0;
    const MAX_BUS_GUESTS = 4;

    if(busAddGuestBtn && busGuestsContainer) {
        busAddGuestBtn.addEventListener('click', () => {
            if (busGuestCount < MAX_BUS_GUESTS) {
                busGuestCount++;
                const div = document.createElement('div');
                div.classList.add('form-group');
                div.innerHTML = `
                    <label data-en="Guest ${busGuestCount} Name" data-it="Nome Ospite ${busGuestCount}">Guest ${busGuestCount} Name</label>
                    <input type="text" name="guest${busGuestCount}_name" placeholder="Name" data-en="Name" data-it="Nome">
                    <input type="text" name="guest${busGuestCount}_surname" placeholder="Surname" style="margin-top:5px;" data-en="Surname" data-it="Cognome">
                `;
                busGuestsContainer.appendChild(div);
                
                // Re-apply language translations to newly generated fields
                setLanguage(localStorage.getItem('weddingLang') || 'en');

                if (busGuestCount === MAX_BUS_GUESTS) {
                    busAddGuestBtn.style.display = 'none';
                }
            }
        });
    }

    // Handle Bus Form Submission
    const busForm = document.getElementById('busForm');
    if(busForm) {
        busForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Gather data
            const formData = new FormData(busForm);
            const mainName = formData.get('name');
            const mainSurname = formData.get('surname');
            
            const guests = [];
            for (let i = 1; i <= busGuestCount; i++) {
                const gName = formData.get(`guest${i}_name`);
                const gSurname = formData.get(`guest${i}_surname`);
                if(gName && gSurname) {
                    guests.push({ name: gName, surname: gSurname });
                }
            }

            const reservationData = {
                mainGuest: { name: mainName, surname: mainSurname },
                additionalGuests: guests,
                totalSeats: 1 + guests.length,
                timestamp: new Date()
            };

            try {
                // Save to Firebase (Corrected v9 syntax)
                await addDoc(collection(db, "bus_reservations"), reservationData);
                
                alert("Bus reservation sent successfully!");
                busForm.reset();
                busGuestsContainer.innerHTML = '';
                busGuestCount = 0;
                busAddGuestBtn.style.display = 'inline-block';

            } catch (error) {
                console.error("Error adding bus reservation: ", error);
                alert("Error sending reservation. Please try again.");
            }
        });
    }
});

// ==========================================
// 3. LANGUAGE SWITCHER LOGIC
// ==========================================
window.setLanguage = function(lang) {
    // Find all elements that have a data attribute for the chosen language
    document.querySelectorAll(`[data-${lang}]`).forEach(el => {
        
        // Handle input fields and textareas (changing placeholders)
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = el.getAttribute(`data-${lang}`);
        } 
        // Handle dropdown options
        else if (el.tagName === 'OPTION') {
            el.text = el.getAttribute(`data-${lang}`);
        }
        // Handle standard text
        else {
            el.innerHTML = el.getAttribute(`data-${lang}`);
        }
    });
    
    // Save the user's preference in their browser
    localStorage.setItem('weddingLang', lang);
};

// Check if user already selected a language when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('weddingLang') || 'en';
    setLanguage(savedLang);
});