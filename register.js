// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDIuTv_GlJjBpRdmJU4FVgLWxY-J_XAh7s",
    authDomain: "wcehacks.firebaseapp.com",
    projectId: "wcehacks",
    storageBucket: "wcehacks.appspot.com",
    messagingSenderId: "583969795199",
    appId: "1:583969795199:web:b710c40f240d5191fc234a",
    measurementId: "G-C7EW3DT1CH"
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();


document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const educationLevel = document.getElementById('educationLevel');
    const schoolOptions = document.querySelector('.school-options');
    const collegeOptions = document.querySelector('.college-options');

    // Show/hide grade/stream options based on education level
    educationLevel.addEventListener('change', function() {
        schoolOptions.classList.toggle('hidden', this.value !== 'school');
        collegeOptions.classList.toggle('hidden', this.value !== 'college');
    });

    // Handle form submission
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        try {
            // Get form values
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const name = document.getElementById('name').value;
            const age = document.getElementById('age').value;
            const educationLevel = document.getElementById('educationLevel').value;
            const profileType = Array.from(document.getElementById('profileType').selectedOptions).map(opt => opt.value);
            const skills = document.getElementById('skills').value.split(',').map(skill => skill.trim());
            const bio = document.getElementById('bio').value;

            // Create auth user
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Convert profile picture to Base64
            const profilePicture = document.getElementById('profilePicture').files[0];
            let profilePictureBase64 = null;
            if (profilePicture) {
                profilePictureBase64 = await imageToBase64(profilePicture);
            }

            // Create user profile in Firestore
            await db.collection('users').doc(user.uid).set({
                basic_info: {
                    name,
                    age: parseInt(age),
                    email,
                    educationLevel,
                    grade: educationLevel === 'school' ? document.getElementById('schoolGrade').value : null,
                    stream: educationLevel === 'college' ? document.getElementById('collegeStream').value : null,
                    profileType,
                    bio,
                    profilePicture: profilePictureBase64
                },
                skills,
                matches: [],
                swipes: {},
                createdAt: new Date().toISOString()
            });

            // Redirect to SkillMatch page
            window.location.href = 'skillmatch.html';

        } catch (error) {
            console.error('Error registering user:', error);
            alert('Error creating account: ' + error.message);
        }
    });

    // Helper function to convert image to Base64
    function imageToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }
});

