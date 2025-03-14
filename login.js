// Firebase configuration
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

// Get form elements
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');
const loginButton = document.querySelector('.login-submit-btn');

// Handle form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form values
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // Show loading state
    loginButton.disabled = true;
    loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    errorMessage.textContent = '';
    
    console.log('Attempting login with:', email); // Debug log

    try {
        console.log('Starting authentication process...'); // New debug log
        // Sign in user
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        console.log('User authenticated:', user.uid); // Debug log
        console.log('Fetching user document from path:', `users/${user.uid}`); // New debug log

        // Get user profile from Firestore
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        console.log('Firestore document exists:', userDoc.exists); // New debug log
        if (userDoc.exists) {
            const userData = userDoc.data();
            console.log('User data retrieved:', userData); // Debug log
            console.log('User profile type:', userData.basic_info?.profileType); // New debug log

            // Store user data in localStorage
            const userDataToStore = {
                uid: user.uid,
                email: user.email,
                ...userData
            };
            console.log('Storing user data:', userDataToStore); // New debug log
            localStorage.setItem('currentUser', JSON.stringify(userDataToStore));

            // Redirect to dashboard
            console.log('Redirecting to dashboard...'); // New debug log
            window.location.href = 'dashboard.html';
        } else {
            console.log('No user document found in Firestore'); // Enhanced debug log
            console.log('User UID:', user.uid); // New debug log
            errorMessage.textContent = "User profile not found. Please register first.";
            loginButton.disabled = false;
            loginButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        }
    } catch (error) {
        console.error('Login error details:', { 
            code: error.code,
            message: error.message,
            fullError: error 
        }); // Enhanced error logging
        
        loginButton.disabled = false;
        loginButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage.textContent = "No account found with this email";
                break;
            case 'auth/wrong-password':
                errorMessage.textContent = "Incorrect password";
                break;
            case 'auth/invalid-email':
                errorMessage.textContent = "Invalid email address";
                break;
            case 'auth/too-many-requests':
                errorMessage.textContent = "Too many failed attempts. Please try again later.";
                break;
            default:
                errorMessage.textContent = `Error logging in: ${error.message}`;
        }
    }
});

// Check initial auth state
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('Current user:', user.email); // Debug log
        console.log('User UID:', user.uid); // New debug log
    } else {
        console.log('No user currently signed in'); // New debug log
    }
});

