const firebaseConfig = {
    apiKey: "AIzaSyDIuTv_GlJjBpRdmJU4FVgLWxY-J_XAh7s",
    authDomain: "wcehacks.firebaseapp.com",
    projectId: "wcehacks",
    storageBucket: "wcehacks.appspot.com",
    messagingSenderId: "583969795199",
    appId: "1:583969795199:web:b710c40f240d5191fc234a"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

let voiceEnabled = false; // Default voice setting

// Function to toggle voice setting
function toggleVoice(enabled) {
    voiceEnabled = enabled;
    localStorage.setItem('voiceEnabled', enabled); // Save preference
}

// Load voice preference when page loads
document.addEventListener('DOMContentLoaded', function() {
    voiceEnabled = localStorage.getItem('voiceEnabled') === 'true';
    // Update UI to reflect current setting
    const voiceToggle = document.querySelector('#voiceToggle');
    if (voiceToggle) {
        voiceToggle.checked = voiceEnabled;
    }

    const loadingOverlay = document.getElementById('loadingOverlay');

    // Check authentication state
    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            // No user is signed in, redirect to login
            window.location.href = 'login.html';
            return;
        }

        try {
            // Get user data from Firestore
            const userDoc = await db.collection('users').doc(user.uid).get();
            
            if (!userDoc.exists) {
                console.error('No user profile found');
                auth.signOut();
                window.location.href = 'login.html';
                return;
            }

            const userData = userDoc.data();
            console.log("Dashboard user data:", userData); // For debugging

            // Update all user-related elements
            updateUserProfile(userData);
            
            // Setup logout functionality
            setupLogout();
            
        } catch (error) {
            console.error('Error fetching user data:', error);
            loadingOverlay.style.display = 'none';
        }
    });

    // Select all sidebar navigation links
    const navLinks = document.querySelectorAll('.sidebar-nav a');
 
    navLinks.forEach(link => {
      link.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent default behavior
       
        // Remove active class from all links
        navLinks.forEach(lnk => lnk.classList.remove('active'));
       
        // Add active class to the clicked link
        this.classList.add('active');
       
        // Get the destination URL from the link's href attribute
        const destination = this.getAttribute('href');
       
        // Navigate to the destination route after a slight delay (optional)
        // This delay can be used if you want to show a transition effect.
        setTimeout(() => {
          window.location.href = destination;
        }, 150); // Delay in milliseconds
      });
    });
 
    // Initialize circular progress bars
    const circularProgressBars = document.querySelectorAll('.circular-progress');
    circularProgressBars.forEach(progress => {
        const percentage = progress.getAttribute('data-progress');
        progress.style.setProperty('--progress', `${percentage * 3.6}deg`);
    });

    // Chat functionality
    const chatInput = document.querySelector('.chat-input input');
    const chatButton = document.querySelector('.chat-input button');
    const chatMessages = document.querySelector('.chat-messages');

    function addMessage(message, isAI = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isAI ? 'ai' : 'user'}`;
       
        if (isAI) {
            messageDiv.innerHTML = `
                <i class="fas fa-robot"></i>
                <div class="message-content">${message}</div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-content">${message}</div>
            `;
        }
       
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    chatButton.addEventListener('click', () => {
        const message = chatInput.value.trim();
        if (message) {
            addMessage(message, false);
            chatInput.value = '';
           
            // Simulate AI response
            setTimeout(() => {
                addMessage("I'm processing your request. How can I help you further?", true);
            }, 1000);
        }
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            chatButton.click();
        }
    });

    // Notifications dropdown (can be expanded)
    const notifications = document.querySelector('.notifications');
    notifications.addEventListener('click', () => {
        // Add notification dropdown functionality
    });

    // User profile dropdown (can be expanded)
    const userProfile = document.querySelector('.user-profile');
    userProfile.addEventListener('click', () => {
        // Add user profile dropdown functionality
    });

    // Add this to your existing DOMContentLoaded event listener
    function initializeProgressCircles() {
        const rings = document.querySelectorAll('.ring-progress');
        rings.forEach(ring => {
            const targetProgress = parseInt(ring.getAttribute('data-progress'));
            const circle = ring.querySelector('.progress');
            const percentageText = ring.querySelector('.percentage');
            const circumference = 339; // 2 * π * 54 (new radius)
           
            // Start from 0
            let currentProgress = 0;
            const duration = 2000; // 2 seconds duration
            const startTime = performance.now();
           
            // Animate the progress
            function animate(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
               
                // Easing function for smooth animation
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                currentProgress = targetProgress * easeOutQuart;
               
                // Update circle progress
                const offset = circumference - (currentProgress / 100 * circumference);
                circle.style.strokeDashoffset = offset;
               
                // Update percentage text
                percentageText.textContent = `${Math.round(currentProgress)}%`;
               
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            }

            // Start animation after a brief delay
            setTimeout(() => {
                requestAnimationFrame(animate);
            }, 500);
        });
    }

    // Call this function after the DOM is loaded
    initializeProgressCircles();

    // Update the voice functionality
    function initializeVoiceFeatures() {
        const voiceControlBtn = document.querySelector('#voiceControlBtn');
        const voiceIcon = voiceControlBtn.querySelector('i');
        const voiceStatus = voiceControlBtn.querySelector('.voice-status');
       
        // Initialize button state
        function updateVoiceUI() {
            voiceControlBtn.classList.toggle('active', voiceEnabled);
            voiceIcon.className = `fas fa-microphone${voiceEnabled ? '' : '-slash'}`;
            voiceStatus.textContent = `Voice ${voiceEnabled ? 'On' : 'Off'}`;
        }
       
        // Set initial state
        voiceEnabled = localStorage.getItem('voiceEnabled') === 'true';
        updateVoiceUI();
       
        // Toggle voice on button click
        voiceControlBtn.addEventListener('click', () => {
            voiceEnabled = !voiceEnabled;
            localStorage.setItem('voiceEnabled', voiceEnabled);
            updateVoiceUI();
        });
       
        // Function to speak text
        function speakText(text) {
            if (!voiceEnabled) return;
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            utterance.pitch = 1;
            utterance.volume = 0.8;
            window.speechSynthesis.speak(utterance);
        }
       
        // Add hover listeners to elements with aria-labels
        document.querySelectorAll('[aria-label]').forEach(element => {
            element.addEventListener('mouseenter', () => {
                const textToRead = element.getAttribute('aria-label');
                if (textToRead && voiceEnabled) {
                    speakText(textToRead);
                }
            });
        });
       
        // Add hover listeners to menu items
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                if (voiceEnabled) {
                    const text = item.textContent.trim();
                    speakText(text);
                }
            });
        });
    }

    // Initialize voice features when the page loads
    initializeVoiceFeatures();
});

// Function to update user profile information
function updateUserProfile(userData) {
    // Update user display name in multiple locations
    const userNameElements = document.querySelectorAll('#userName, #userDisplayName');
    userNameElements.forEach(element => {
        element.textContent = userData.name || userData.displayName || 'User';
    });

    // Update profile picture in multiple locations
    const profilePicElements = document.querySelectorAll('#profilePicture, #userProfileImage');
    const profileImageUrl = userData.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'User')}&background=random`;
    profilePicElements.forEach(element => {
        element.src = profileImageUrl;
    });

    // Update role and institution
    if (userData.basic_info) {
        const userRole = document.getElementById('userRole');
        if (userRole) {
            userRole.textContent = userData.basic_info.profileType || 'Member';
        }

        const userInstitution = document.getElementById('userInstitution');
        if (userInstitution) {
            userInstitution.textContent = userData.basic_info.institution || '';
        }

        const userBio = document.getElementById('userBio');
        if (userBio) {
            userBio.textContent = userData.basic_info.bio || 'No bio available';
        }
    }

    // Update skills
    const skillTags = document.getElementById('skillTags');
    if (skillTags) {
        if (userData.skills && userData.skills.length > 0) {
            skillTags.innerHTML = userData.skills.map(skill => 
                `<span class="skill-tag">${skill}</span>`
            ).join('');
        } else {
            skillTags.innerHTML = '<p>No skills added yet</p>';
        }
    }

    // Hide loading overlay
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// Function to setup logout functionality
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.signOut().then(() => {
                // Clear stored data
                localStorage.removeItem('currentUser');
                // Redirect to login
                window.location.href = 'login.html';
            }).catch((error) => {
                console.error('Error signing out:', error);
            });
        });
    }
}
 








 



















