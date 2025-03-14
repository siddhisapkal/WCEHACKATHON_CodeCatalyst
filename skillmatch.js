// Initialize Firebase with your config
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

// DOM Elements
const selectionScreen = document.getElementById('selectionScreen');
const profilesScreen = document.getElementById('profilesScreen');
const cardContainer = document.getElementById('cardContainer');
const loadingSpinner = document.getElementById('loadingSpinner');
const backButton = document.getElementById('backButton');
const findMentorBtn = document.getElementById('findMentor');
const findMenteeBtn = document.getElementById('findMentee');
const matchNotification = document.getElementById('matchNotification');
const matchedUserName = document.getElementById('matchedUserName');
const startChat = document.getElementById('startChat');
const continueBrowsing = document.getElementById('continueBrowsing');

let currentUser = null;
let currentUserData = null;
let currentView = null;
let currentProfiles = [];
let currentProfileIndex = 0;

// Check authentication
auth.onAuthStateChanged(async (user) => {
    console.log('Auth state changed:', user ? 'User logged in' : 'No user');
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (!userDoc.exists) {
            console.error('No user profile found');
            auth.signOut();
            window.location.href = 'login.html';
            return;
        }

        currentUser = user;
        currentUserData = userDoc.data();
        currentUserData.uid = user.uid; // Ensure UID is included
        console.log('Current user data loaded:', currentUserData);
        
    } catch (error) {
        console.error('Error fetching user data:', error);
        alert('Error loading user profile. Please try logging in again.');
        auth.signOut();
        window.location.href = 'login.html';
    }
});

// Event Listeners
findMentorBtn.addEventListener('click', () => {
    console.log('Find Mentor clicked');
    if (!currentUser || !currentUserData) {
        console.error('User data not loaded yet');
        alert('Please wait while we load your profile...');
        return;
    }
    showProfiles('mentor');
});

findMenteeBtn.addEventListener('click', () => {
    console.log('Find Mentee clicked');
    if (!currentUser || !currentUserData) {
        console.error('User data not loaded yet');
        alert('Please wait while we load your profile...');
        return;
    }
    showProfiles('mentee');
});

backButton.addEventListener('click', showSelectionScreen);

// Show profiles based on type
async function showProfiles(type) {
    console.log('Showing profiles for type:', type);
    if (!currentUser || !currentUserData) {
        console.error('User data not loaded yet');
        alert('Please wait while we load your profile...');
        return;
    }

    currentView = type;
    selectionScreen.style.display = 'none';
    profilesScreen.classList.remove('hidden');
    loadingSpinner.classList.remove('hidden');
    cardContainer.innerHTML = '';

    try {
        console.log('Fetching profiles from Firebase...');
        console.log('Current user ID:', currentUser.uid);
        console.log('Looking for profile type:', type);
        
        // Updated query to match the correct data structure
        const snapshot = await db.collection('users')
            .where('basic_info.profileType', 'array-contains', type)
            .get();

        console.log('Found profiles:', snapshot.size);
        loadingSpinner.classList.add('hidden');

        if (snapshot.empty) {
            cardContainer.innerHTML = `<div class="no-profiles">No ${type}s found</div>`;
            return;
        }

        currentProfiles = [];
        snapshot.forEach(doc => {
            // Skip current user's profile
            if (doc.id === currentUser.uid) {
                return;
            }
            
            const userData = doc.data();
            userData.uid = doc.id;
            if (!userData.skills) {
                userData.skills = [];
            }
            const matchScore = calculateSkillMatch(userData.skills);
            console.log('Profile:', userData.basic_info?.name, 'Match score:', matchScore);
            currentProfiles.push({
                ...userData,
                matchScore
            });
        });

        // Sort by matching skills
        currentProfiles.sort((a, b) => b.matchScore - a.matchScore);
        currentProfileIndex = 0;

        console.log('Filtered profiles:', currentProfiles.length);

        if (currentProfiles.length === 0) {
            cardContainer.innerHTML = '<div class="no-profiles">No matching profiles found</div>';
            return;
        }

        // Show first profile
        showNextProfile();

    } catch (error) {
        console.error('Error loading profiles:', error);
        loadingSpinner.classList.add('hidden');
        cardContainer.innerHTML = `<div class="error">Error loading profiles: ${error.message}. Please try again.</div>`;
    }
}

function showNextProfile() {
    console.log('Showing next profile:', currentProfileIndex);
    if (currentProfileIndex >= currentProfiles.length) {
        cardContainer.innerHTML = '<div class="no-profiles">No more profiles available</div>';
        return;
    }

    const userData = currentProfiles[currentProfileIndex];
    createSwipeCard(userData);
}

function createSwipeCard(userData) {
    console.log('Creating card for:', userData.basic_info?.name);
    const matchingSkills = userData.skills ? userData.skills.filter(skill => 
        currentUserData.skills.map(s => s.toLowerCase()).includes(skill.toLowerCase())
    ) : [];

    const card = document.createElement('div');
    card.className = 'swipe-card';
    card.innerHTML = `
        <div class="card-content">
            <div class="card-image" style="background-image: url('${userData.basic_info?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.basic_info?.name || 'User')}&background=random`}')"></div>
            <div class="card-info">
                <h2>${userData.basic_info?.name || 'Anonymous'}</h2>
                <p class="institution">${userData.basic_info?.educationLevel || 'Education not specified'} - ${userData.basic_info?.stream || 'Stream not specified'}</p>
                <p class="bio">${userData.basic_info?.bio || 'No bio available'}</p>
                <div class="skills-container">
                    ${matchingSkills.map(skill => `
                        <span class="skill-tag matching">${skill}</span>
                    `).join('')}
                    ${userData.skills ? userData.skills.filter(skill => !matchingSkills.includes(skill)).map(skill => `
                        <span class="skill-tag">${skill}</span>
                    `).join('') : ''}
                </div>
                <div class="match-score">
                    <i class="fas fa-star"></i>
                    <span>${matchingSkills.length} matching skills</span>
                </div>
            </div>
        </div>
    `;

    // Add swipe functionality
    let startX = 0;
    let currentX = 0;

    card.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    });

    card.addEventListener('touchmove', (e) => {
        currentX = e.touches[0].clientX - startX;
        card.style.transform = `translateX(${currentX}px) rotate(${currentX * 0.1}deg)`;
        updateSwipeHint(currentX);
    });

    card.addEventListener('touchend', () => handleSwipeEnd(card, userData.uid, currentX));

    // Mouse events for desktop
    card.addEventListener('mousedown', (e) => {
        startX = e.clientX;
        card.style.transition = 'none';
    });

    card.addEventListener('mousemove', (e) => {
        if (startX === 0) return;
        currentX = e.clientX - startX;
        card.style.transform = `translateX(${currentX}px) rotate(${currentX * 0.1}deg)`;
        updateSwipeHint(currentX);
    });

    card.addEventListener('mouseup', () => handleSwipeEnd(card, userData.uid, currentX));
    card.addEventListener('mouseleave', () => handleSwipeEnd(card, userData.uid, currentX));

    cardContainer.innerHTML = '';
    cardContainer.appendChild(card);

    // Add swipe buttons
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'swipe-buttons';
    buttonsContainer.innerHTML = `
        <button class="swipe-button decline" onclick="handleManualSwipe(false)">
            <i class="fas fa-times"></i>
        </button>
        <button class="swipe-button accept" onclick="handleManualSwipe(true)">
            <i class="fas fa-check"></i>
        </button>
    `;
    cardContainer.appendChild(buttonsContainer);
}

function updateSwipeHint(currentX) {
    const card = document.querySelector('.swipe-card');
    if (currentX > 50) {
        card.classList.add('swipe-right-hint');
        card.classList.remove('swipe-left-hint');
    } else if (currentX < -50) {
        card.classList.add('swipe-left-hint');
        card.classList.remove('swipe-right-hint');
    } else {
        card.classList.remove('swipe-right-hint', 'swipe-left-hint');
    }
}

async function handleSwipeEnd(card, targetUid, currentX) {
    const threshold = 150;
    if (Math.abs(currentX) > threshold) {
        const isLike = currentX > 0;
        await handleSwipe(targetUid, isLike);
        card.remove();
        showNextProfile();
    } else {
        card.style.transform = 'translateX(0) rotate(0deg)';
    }
}

async function handleSwipe(targetUid, isLike) {
    try {
        // Verify current user
        if (!firebase.auth().currentUser) {
            console.error('No authenticated user found');
            alert('Please login again');
            window.location.href = 'login.html';
            return;
        }

        const currentUserId = firebase.auth().currentUser.uid;
        console.log('Current user ID:', currentUserId);
        console.log('Target user ID:', targetUid);
        console.log('Is like:', isLike);

        // Create swipe data
        const swipeData = {
            targetUid: targetUid,
            isLike: isLike,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            swipedBy: currentUserId,
            type: currentUserData.basic_info.profileType[0] // 'mentor' or 'mentee'
        };

        console.log('Saving swipe data:', swipeData);

        // Create the swipes collection if it doesn't exist and add the swipe
        const userRef = db.collection('users').doc(currentUserId);
        const swipeRef = userRef.collection('swipes').doc(targetUid);

        // Record the swipe
        await swipeRef.set(swipeData);
        console.log('Swipe recorded successfully');

        if (isLike) {
            console.log('Checking for mutual match...');
            // Check if there's a mutual match
            const theirSwipeRef = await db.collection('users')
                .doc(targetUid)
                .collection('swipes')
                .doc(currentUserId)
                .get();

            console.log('Their swipe exists:', theirSwipeRef.exists);
            if (theirSwipeRef.exists) {
                console.log('Their swipe data:', theirSwipeRef.data());
            }

            if (theirSwipeRef.exists && theirSwipeRef.data().isLike) {
                console.log('Match found! Creating match...');
                // It's a match!
                const matchId = await createMatch(currentUserId, targetUid);
                console.log('Match created with ID:', matchId);
                showMatchPopup(targetUid);
            }
        }

    } catch (error) {
        console.error('Error in handleSwipe:', error);
        // Log detailed error information
        console.error({
            errorCode: error.code,
            errorMessage: error.message,
            errorStack: error.stack
        });
        
        // Show user-friendly error
        alert('There was an error processing your swipe. Please try again.');
    }
}

async function createMatch(user1Id, user2Id) {
    try {
        console.log('Creating match between:', user1Id, 'and', user2Id);
        
        // Get both users' data
        const [user1Doc, user2Doc] = await Promise.all([
            db.collection('users').doc(user1Id).get(),
            db.collection('users').doc(user2Id).get()
        ]);

        if (!user1Doc.exists || !user2Doc.exists) {
            throw new Error('One or both users not found');
        }

        const user1Data = user1Doc.data();
        const user2Data = user2Doc.data();

        // Create match document
        const matchData = {
            users: [user1Id, user2Id],
            userDetails: {
                [user1Id]: {
                    name: user1Data.basic_info.name,
                    profilePicture: user1Data.basic_info.profilePicture,
                    role: user1Data.basic_info.profileType[0],
                    email: user1Data.email
                },
                [user2Id]: {
                    name: user2Data.basic_info.name,
                    profilePicture: user2Data.basic_info.profilePicture,
                    role: user2Data.basic_info.profileType[0],
                    email: user2Data.email
                }
            },
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastMessage: null,
            status: 'active'
        };

        console.log('Match data to be saved:', matchData);

        // Add match to matches collection
        const matchRef = await db.collection('matches').add(matchData);
        console.log('Match document created with ID:', matchRef.id);

        // Update both users' documents with the match reference
        await Promise.all([
            db.collection('users').doc(user1Id).update({
                matches: firebase.firestore.FieldValue.arrayUnion(matchRef.id)
            }),
            db.collection('users').doc(user2Id).update({
                matches: firebase.firestore.FieldValue.arrayUnion(matchRef.id)
            })
        ]);

        console.log('Both users updated with match reference');
        return matchRef.id;

    } catch (error) {
        console.error('Error in createMatch:', error);
        throw error;
    }
}

function showMatchPopup(matchedUserId) {
    const matchNotification = document.getElementById('matchNotification');
    const matchedUserName = document.getElementById('matchedUserName');

    // Get matched user's data
    db.collection('users').doc(matchedUserId).get()
        .then(doc => {
            const userData = doc.data();
            matchedUserName.textContent = userData.basic_info.name;
            
            // Show the popup
            matchNotification.classList.add('active');

            // Setup button handlers
            document.getElementById('startChat').onclick = () => {
                window.location.href = `chat.html?match=${matchedUserId}`;
            };

            document.getElementById('continueBrowsing').onclick = () => {
                matchNotification.classList.remove('active');
            };
        })
        .catch(error => {
            console.error('Error showing match popup:', error);
        });
}

// Update the manual swipe handler
window.handleManualSwipe = async function(isLike) {
    try {
        const currentProfile = currentProfiles[currentProfileIndex];
        if (!currentProfile) {
            console.error('No current profile found');
            return;
        }

        console.log('Manual swipe:', { isLike, profileId: currentProfile.uid });
        const card = document.querySelector('.swipe-card');
        if (!card) {
            console.error('No card element found');
            return;
        }

        card.style.transition = 'transform 0.5s ease';
        card.style.transform = `translateX(${isLike ? '1000px' : '-1000px'}) rotate(${isLike ? '45deg' : '-45deg'})`;

        await handleSwipe(currentProfile.uid, isLike);

        setTimeout(() => {
            currentProfileIndex++;
            showNextProfile();
        }, 500);
    } catch (error) {
        console.error('Error in manual swipe:', error);
        // Continue to next profile even if there's an error
        setTimeout(() => {
            currentProfileIndex++;
            showNextProfile();
        }, 500);
    }
};

function showSelectionScreen() {
    profilesScreen.classList.add('hidden');
    selectionScreen.style.display = 'flex';
    currentView = null;
    currentProfiles = [];
    currentProfileIndex = 0;
}

// Calculate skill match score
function calculateSkillMatch(userSkills) {
    if (!userSkills || !currentUserData.skills) {
        return 0;
    }
    
    const currentUserSkills = (currentUserData.skills || []).map(skill => skill.toLowerCase());
    const otherUserSkills = userSkills.map(skill => skill.toLowerCase());
    
    console.log('Comparing skills:', {
        currentUserSkills,
        otherUserSkills
    });
    
    const matchingSkills = currentUserSkills.filter(skill => 
        otherUserSkills.includes(skill)
    );
    
    return matchingSkills.length;
}

// Handle match notification actions
startChat.addEventListener('click', async () => {
    try {
        const matchedUser = currentProfiles[currentProfileIndex];
        if (!matchedUser) return;

        // Create or get chat room
        const chatRoomId = [currentUser.uid, matchedUser.uid].sort().join('_');
        const chatRoom = await db.collection('chatRooms').doc(chatRoomId).get();

        if (!chatRoom.exists) {
            await db.collection('chatRooms').doc(chatRoomId).set({
                participants: [
                    {
                        uid: currentUser.uid,
                        name: currentUserData.basic_info?.name
                    },
                    {
                        uid: matchedUser.uid,
                        name: matchedUser.basic_info?.name
                    }
                ],
                lastMessage: null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        // Hide match notification
        matchNotification.classList.remove('active');
        
        // Redirect to chat page
        window.location.href = `chat.html?room=${chatRoomId}`;
    } catch (error) {
        console.error('Error starting chat:', error);
        alert('Error starting chat. Please try again.');
    }
});

continueBrowsing.addEventListener('click', () => {
    matchNotification.classList.remove('active');
});

// Setup logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    auth.signOut().then(() => {
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error('Error signing out:', error);
    });
}); 